import BlogCard from "./BlogCard";
import { useEffect, useState, useRef } from "react";
import { BlogType } from "@/types/Blogs";
import { mockBlogs } from "@/constant/blogs/blogListMock";

const BlogList = () => {
  const [blogs, setBlogs] = useState<BlogType[]>([]); // Store loaded blogs
  const [page, setPage] = useState(1); // Track page number
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  const observerRef = useRef(null); // Intersection Observer ref

  useEffect(() => {
    fetchBlogs(page);
  }, [page]); // Fetch when page updates

  const fetchBlogs = async (pageNumber: number) => {
    if (!hasMore || loading) return;
    setLoading(true);
    setError(false);

    try {
      setBlogs(mockBlogs); // Mock data for testing
      // const { data } = await axios.post(`/api/blogs`, {
      //   page: pageNumber,
      //   limit: 10, // Adjust limit as needed
      // });

      // if (data.blogs.length === 0) {
      //   setHasMore(false); // No more blogs available
      //   return;
      // }

      // setBlogs((prev) => [...prev, ...data.blogs]); // Append new blogs
      // setHasMore(pageNumber < data.totalPages); // Stop when no more pages
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
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Show No Blogs Available */}
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
      {loading && <p className="text-center text-gray-500">Loading more...</p>}

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
