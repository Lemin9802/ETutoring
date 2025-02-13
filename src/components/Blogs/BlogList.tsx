import BlogCard from "./BlogCard";
import { useEffect, useState, useRef } from "react";
import { BlogType } from "@/types/Blogs";
import axios from "axios";
import { Spin } from "antd";

interface BlogListProps {
  filter: string; // "all", "my-blogs", "liked"
  userId?: string; // Logged-in user's ID
}

const BlogList = ({ filter, userId }: BlogListProps) => {
  const [blogs, setBlogs] = useState<BlogType[]>([]); // Store loaded blogs
  const [page, setPage] = useState(1); // Track current page
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null); // Ref for infinite scrolling

  useEffect(() => {
    setBlogs([]); // Clear previous blogs when filter changes
    setPage(1); // Reset page count
    setHasMore(true); // Allow more loading
  }, [filter, userId]);

  useEffect(() => {
    fetchBlogs(page);
  }, [page, filter, userId]); // Fetch when page or filter updates

  const fetchBlogs = async (pageNumber: number) => {
    if (!hasMore || loading) return; // Prevent multiple fetch calls
    setLoading(true);
    setError(false);

    try {
      let url = `/api/blogs`;
      const body = {
        page: pageNumber,
        limit: 10,
      };

      const { data } = await axios.post(url, body, {
        headers: { "Content-Type": "application/json" },
      });

      if (pageNumber === 1) {
        setBlogs(data.blogs); // Set new blogs (reset list)
      } else {
        setBlogs((prev) => [...prev, ...data.blogs]); // Append blogs
      }

      setHasMore(data.blogs.length > 0); // Check if more blogs exist
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Intersection Observer: Load more when last blog is in view
  useEffect(() => {
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1); // Load next page
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-6">
      {/* No Blogs Available */}
      {blogs.length === 0 && !loading && !error && (
        <p className="text-center text-gray-500">No blogs available.</p>
      )}

      {/* Show Error Message */}
      {error && (
        <p className="text-center text-red-500">
          Error loading blogs. Try again.
        </p>
      )}

      {/* Render Blogs */}
      {blogs.map((blog) => (
        <BlogCard key={blog.id} {...blog} />
      ))}

      {/* Invisible Element to Trigger More Loading */}
      {hasMore && !loading && <div ref={observerRef} className="h-10" />}

      {/* Show Loading Spinner */}
      {loading && (
        <div className="flex justify-center">
          <Spin size="large" />
        </div>
      )}

      {/* Show End of List Message */}
      {!hasMore && blogs.length > 0 && (
        <p className="text-center text-gray-400 mt-4">
          You have reached the end!
        </p>
      )}
    </div>
  );
};

export default BlogList;
