import { useCallback } from "react";
import { BlogType } from "@/types/Blogs";
import BlogCard from "./BlogCard";

interface BlogListProps {
  filter: string; // "all", "my-blogs", "liked"
  blogs: BlogType[];
  userId?: string;
  users: { id: string; name: string }[];
  onBlogUpdated?: (updatedBlog?: BlogType) => void;
  onBlogDeleted?: (deletedBlogId: string) => void;
}

const BlogList = ({
  filter,
  blogs,
  users,
  onBlogUpdated = () => {},
  onBlogDeleted = () => {},
}: BlogListProps) => {
  const getUserName = useCallback(
    (userId: string) => {
      const user = users.find((u) => u.id === userId);
      return user ? user.name : "Unknown User";
    },
    [users]
  );
  const getHeaderTitle = () => {
    switch (filter) {
      case "liked":
        return "❤️ Liked Blogs";
      case "my-blogs":
        return "✍ My Blogs";
      default:
        return "📝 All Blogs";
    }
  };
  return (
    <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{getHeaderTitle()}</h2>
      {blogs.length > 0 ? (
        blogs.map((blog) => (
          <BlogCard
            key={blog.id}
            blog={{
              ...blog,
              userName: blog.user_full_name || getUserName(blog.user_id),
            }}
            filter={filter}
            onBlogUpdated={onBlogUpdated}
            onBlogDeleted={onBlogDeleted}
          />
        ))
      ) : (
        <p className="text-center text-gray-400 mt-4">No blogs found.</p>
      )}
    </div>
  );
};

export default BlogList;
