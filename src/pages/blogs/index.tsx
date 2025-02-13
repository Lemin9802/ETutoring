import { useState } from "react";
import { Button, Tabs } from "antd";
import Banner from "@/components/Banner";
import BlogList from "@/components/Blogs/BlogList";
import BlogWriteModal from "@/components/Blogs/BlogWriteModal";
import { useSession } from "next-auth/react";

const BlogListPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // Default tab

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Banner
        title="Blog List"
        description="Welcome to the blog list page!"
        bgColor="bg-green-600"
      />

      {/* Tabs for filtering blog lists */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <Tabs
          defaultActiveKey="all"
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          className="mb-4"
        >
          <Tabs.TabPane tab="📝 All Blogs" key="all" />
          <Tabs.TabPane tab="✍ My Blogs" key="my-blogs" />
          <Tabs.TabPane tab="❤️ Liked Blogs" key="liked" />
        </Tabs>
      </div>

      {/* Create Blog Button */}
      <div className="flex justify-end max-w-7xl mx-auto px-6 mb-4">
        <Button type="primary" size="large" onClick={handleOpenModal}>
          + Create New Blog
        </Button>
      </div>

      {/* Blog Write Modal */}
      <BlogWriteModal visible={isModalVisible} onClose={handleCloseModal} />

      {/* Blog List with Filter */}
      <BlogList filter={activeTab} />
    </>
  );
};

export default BlogListPage;
