import BlogCard from "./BlogCard";
import { useEffect, useState, useRef, useCallback } from "react";
import { BlogType } from "@/types/Blogs";
import axios from "axios";
import { Spin } from "antd";

interface BlogListProps {
  filter: string; // "all", "my-blogs", "liked"
  userId?: string; // Logged-in user's ID
}

const BlogList = ({ filter, userId }: BlogListProps) => {
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Reset state when filter or userId changes
  useEffect(() => {
    setBlogs([]);
    setPage(1);
    setHasMore(true);
  }, [filter, userId]);

  // Use useCallback to stabilize the fetchBlogs function
  const fetchBlogs = useCallback(
    async (pageNumber: number) => {
      if (!hasMore || loading) return;
      setLoading(true);
      setError(false);

      try {
        const url = `/api/blogs`;
        const body = {
          page: pageNumber,
          limit: 10,
        };

        const response = await axios.post(url, body, {
          headers: { "Content-Type": "application/json" },
        });

        if (response.status !== 200) {
          throw new Error("Failed to fetch blogs");
        }

        const { blogs: newBlogs } = response.data;
        setBlogs((prev) =>
          pageNumber === 1 ? newBlogs : [...prev, ...newBlogs]
        );
        setHasMore(newBlogs.length > 0);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [hasMore, loading]
  );

  // Call the API when page, filter, or userId changes
  useEffect(() => {
    fetchBlogs(page);
  }, [page, fetchBlogs, filter, userId]);

  // Create an IntersectionObserver to load more blogs when scrolling to the bottom
  useEffect(() => {
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {

          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-6">
      {blogs.length === 0 && !loading && !error && (
        <p className="text-center text-gray-500">No blogs available.</p>
      )}
      {error && (
        <p className="text-center text-red-500">
          Error loading blogs. Try again.
        </p>
      )}
      {blogs.map((blog) => (
        <BlogCard key={blog.id} {...blog} />
      ))}
      {hasMore && !loading && <div ref={observerRef} className="h-10" />}
      {loading && (
        <div className="flex justify-center">
          <Spin size="large" />
        </div>
      )}
      {!hasMore && blogs.length > 0 && (
        <p className="text-center text-gray-400 mt-4">
          You have reached the end!
        </p>
      )}
    </div>
  );
};

export default BlogList;
