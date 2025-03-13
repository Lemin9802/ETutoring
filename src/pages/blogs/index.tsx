import { useState, useEffect, useCallback } from "react";
import { Button, Tabs, Input } from "antd";
import { useSession } from "next-auth/react";
import Banner from "@/components/Banner";
import BlogWriteModal from "@/components/Blogs/BlogWriteModal";
import { BlogType } from "@/types/Blogs";
import axios from "axios";
import BlogCard from "@/components/Blogs/BlogCard";

interface User {
  id: string;
  name: string;
}

const BlogIndex = () => {
  const { data: session } = useSession();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  // ✅ Bọc fetchBlogs bằng useCallback
  const fetchBlogs = useCallback(async () => {
    try {
      const response = await axios.post("/api/blogs/get-all", {}, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });

      console.log("Fetched blogs:", response.data.data); // ✅ Debug API response
      setBlogs(response.data.data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  }, [session]);

  // ✅ Bọc fetchUsers bằng useCallback
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.post("/api/users/get-all", {}, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });

      console.log("Fetched users:", response.data.data); // ✅ Debug API response
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [session]);

  // ✅ Thêm fetchBlogs và fetchUsers vào dependency array
  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchBlogs();
      fetchUsers();
    }
  }, [session, fetchBlogs, fetchUsers]);

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unknown User"; // ✅ Fix hiển thị Unknown User
  };

  const groupedBlogs = blogs.reduce<{ [userId: string]: BlogType[] }>((acc, blog) => {
    const userId = blog.user_id ?? "unknown";
    if (!acc[userId]) acc[userId] = [];
    acc[userId].push(blog);
    return acc;
  }, {});

  return (
    <>
      <Banner
        title="Blog List"
        description="Welcome to the blog list page!"
        bgColor="bg-green-600"
      />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        className="mb-4"
        items={[
          { key: "all", label: "📝 All Blogs" },
          { key: "my-blogs", label: "✍ My Blogs" },
          { key: "liked", label: "❤️ Liked Blogs" }
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 mb-4 flex justify-between items-center">
        <Input
          placeholder="Search blogs or users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/3"
        />
        <Button type="primary" size="large" onClick={() => setIsModalVisible(true)}>
          + Create New Blog
        </Button>
      </div>

      <BlogWriteModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onBlogCreated={(newBlog: BlogType) => setBlogs((prev) => [newBlog, ...prev])}
        onBlogUpdated={(updatedBlog: BlogType) => setBlogs((prev) =>
          prev.map((b) => (b.id === updatedBlog.id ? updatedBlog : b))
        )}
        onBlogDeleted={(deletedBlogId: string) => setBlogs((prev) =>
          prev.filter((b) => b.id !== deletedBlogId)
        )}
      />

      {Object.entries(groupedBlogs).map(([userId, userBlogs]) => (
        <div key={userId} className="border p-4 rounded-lg mb-4 bg-gray-100">
          <h2 className="text-lg font-bold text-blue-700">{getUserName(userId)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {userBlogs.map((blog) => (
              <BlogCard 
                key={blog.id} 
                blog={blog}
                onBlogUpdated={(updatedBlog: BlogType) => {
                  setBlogs((prev) =>
                    prev.map((b) => (b.id === updatedBlog.id ? updatedBlog : b))
                  );
                }}
                onBlogDeleted={(deletedBlogId: string) => {
                  setBlogs((prev) => prev.filter((b) => b.id !== deletedBlogId));
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default BlogIndex;
