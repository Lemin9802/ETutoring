import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react"; // Import useSession từ NextAuth
import { BlogType } from "@/types/Blogs";
import axios from "axios";
import { Spin } from "antd";
import BlogCard from "./BlogCard";

interface BlogListProps {
  filter: string; // "all", "my-blogs", "liked"
  userId?: string;
  blogs?: BlogType[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BlogList = ({ filter, userId, blogs: initialBlogs }: BlogListProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession(); // ✅ Lấy session
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // ✅ Bọc fetchBlogs bằng useCallback để đảm bảo không tạo lại function không cần thiết
  const fetchBlogs = useCallback(async (pageNumber: number) => {
    if (!session?.user?.accessToken) {
      console.error("Session not found or missing accessToken!");
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const response = await axios.post(
        "/api/blogs/get-all",
        { page: pageNumber, limit: 10 },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        }
      );

      if (response.status !== 200 || !response.data.data) {
        throw new Error("Failed to fetch blogs");
      }

      const newBlogs = response.data.data || [];
      setBlogs((prev) => (pageNumber === 1 ? newBlogs : [...prev, ...newBlogs]));
      setHasMore(newBlogs.length > 0);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // ✅ useEffect gọi fetchBlogs, dependency đã được fix
  useEffect(() => {
    setBlogs([]);
    setPage(1);
    setHasMore(true);
    if (session?.user?.accessToken) fetchBlogs(1);
  }, [filter, userId, session, fetchBlogs]);

  useEffect(() => {
    if (loading || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    });

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-6">
      {blogs.map((blog) => (
        <BlogCard
          key={blog.id}
          blog={blog}
          onBlogUpdated={(updatedBlog: BlogType) => {
            setBlogs((prev: BlogType[]) =>
              prev.map((b) => (b.id === updatedBlog.id ? updatedBlog : b))
            );
          }}
          onBlogDeleted={(deletedBlogId: string) => {
            setBlogs((prev: BlogType[]) => prev.filter((b) => b.id !== deletedBlogId));
          }}
        />
      ))}
      {hasMore && !loading && <div ref={observerRef} className="h-10" />}
      {loading && <div className="flex justify-center"><Spin size="large" /></div>}
      {!hasMore && blogs.length > 0 && (
        <p className="text-center text-gray-400 mt-4">You have reached the end!</p>
      )}
    </div>
  );
};

export default BlogList;
