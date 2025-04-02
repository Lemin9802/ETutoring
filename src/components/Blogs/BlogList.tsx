import { useCallback } from "react";
import { BlogType } from "@/types/Blogs";
import BlogCard from "./BlogCard";

interface BlogListProps {
  filter: string; // "all", "my-blogs", "liked"
  blogs: BlogType[];
  userId?: string;
  users: { id: string; name: string }[];
  onBlogUpdated?: (updatedBlog: BlogType) => void;
  onBlogDeleted?: (deletedBlogId: string) => void;
}

const BlogList = ({ blogs, users, onBlogUpdated, onBlogDeleted }: BlogListProps) => {
  const getUserName = useCallback(
    (userId: string) => {
      const user = users.find((u) => u.id === userId);
      return user ? user.name : "Unknown User";
    },
    [users]
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-6">
      {blogs.map((blog) => (
        <BlogCard
          key={blog.id}
          blog={{
            ...blog,
            userName: blog.user_full_name || getUserName(blog.user_id),
          }}
          onBlogUpdated={onBlogUpdated ? onBlogUpdated : () => {}}
          onBlogDeleted={onBlogDeleted ? onBlogDeleted : () => {}}
        />
      ))}
      {blogs.length === 0 && (
        <p className="text-center text-gray-400 mt-4">No blogs found.</p>
      )}
    </div>
  );
};

export default BlogList;
