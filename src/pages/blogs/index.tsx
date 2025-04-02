import { useState, useEffect, useCallback } from "react";
import { Button, Tabs, Input } from "antd";
import { useSession } from "next-auth/react";
import Banner from "@/components/Banner";
import BlogWriteModal from "@/components/Blogs/BlogWriteModal";
import { BlogType } from "@/types/Blogs";
import axios from "axios";
import BlogList from "@/components/Blogs/BlogList";

interface User {
  id: string;
  name: string;
}

const BlogIndex = () => {
  const { data: session } = useSession();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [users] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  const fetchBlogs = useCallback(async () => {
    if (!session?.user?.accessToken) return;
  
    try {
      let url = "/api/blogs/get-all"; 
      if (activeTab === "my-blogs") {
        url = "/api/blogs/get-by-id";
      }
  
      const response = await axios.post(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        }
      );
  
      const sortedBlogs = (response.data.data as BlogType[]).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setBlogs(sortedBlogs);
  
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  }, [session, activeTab]);
  
  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchBlogs();
    }
  }, [session, fetchBlogs]);

  return (
    <>
      <Banner
        title="Blogs Page"
        description="Welcome to the blog list page!"
        bgColor="bg-green-600"
      />

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
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
        onBlogCreated={() => {
          fetchBlogs();
        }}
        onBlogUpdated={() => {
          fetchBlogs();
        }}
        onBlogDeleted={() => {
          fetchBlogs();
        }}
      />

      <BlogList 
         filter={activeTab} 
         userId={session?.user?.id} 
         users={users} 
         blogs={blogs} 
         onBlogUpdated={() => {
             fetchBlogs();
         }}
         onBlogDeleted={() => {
             fetchBlogs();
         }}
      />
    </>
  );
};

export default BlogIndex;
