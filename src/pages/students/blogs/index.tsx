import { useState, useEffect, useCallback } from "react";
import { Button, Input, Spin, Empty, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import Banner from "@/components/Banner";
import BlogWriteModal from "@/components/Blogs/BlogWriteModal";
import { BlogType } from "@/types/Blogs";
import axios from "axios";
import BlogCard from "@/components/Blogs/BlogCard";

const StudentBlogIndex = () => {
  const { data: session } = useSession();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch only the logged-in user's blogs
  const fetchMyBlogs = useCallback(async () => {
    if (!session?.user?.accessToken) return;
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/blogs/get-all",
        {},
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      );
      console.log("✅ Fetched Blogs:", response.data.data);
      setBlogs(response.data.data || []);
    } catch (error) {
      console.error("Error fetching my blogs:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchMyBlogs();
  }, [fetchMyBlogs]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Banner
        title="📝 My Blogs"
        description="Manage and edit your personal blogs here."
        bgColor="bg-blue-600"
      />

      {/* Search & Create Blog Section */}
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <Input
          placeholder="🔍 Search your blogs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-2/3 shadow-sm rounded-lg p-2 border-gray-300"
        />
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          className="bg-blue-500 hover:bg-blue-600 transition-all shadow-md"
          onClick={() => setIsModalVisible(true)}
        >
          Create Blog
        </Button>
      </div>

      {/* Blog Create/Edit Modal */}
      <BlogWriteModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onBlogCreated={(newBlog: BlogType) => {
            if (!newBlog || !newBlog.id) {
            console.error("❌ Error: Created blog is invalid", newBlog);
            return;
            }
            message.success("🎉 Blog created successfully!");
        }}
        onBlogUpdated={(updatedBlog: BlogType) =>
            setBlogs((prev) =>
            prev.map((b) => (b.id === updatedBlog.id ? updatedBlog : b))
            )
        }
        />


      {/* Blog Listing */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spin size="large" />
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs
              .filter((blog) => blog?.title?.toLowerCase().includes(search.toLowerCase()))
              .map((blog) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  onBlogUpdated={(updatedBlog: BlogType) =>
                    setBlogs((prev) =>
                      prev.map((b) => (b.id === updatedBlog.id ? updatedBlog : b))
                    )
                  }
                />
              ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-10">
            <Empty description="No blogs found. Create your first blog!" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentBlogIndex;
