import { useState } from "react";
import { Button } from "antd";
import Banner from "@/components/Banner";
import BlogList from "@/components/Blogs/BlogList";
import BlogWriteModal from "@/components/Blogs/BlogWriteModal";
import { APIResponse } from "@/types/APIResponse";

const BlogListPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleSubmitBlog = async (values: {
    title: string;
    content: string;
  }) => {
    try {
      const response = await fetch("/api/blogs/create", {});
      if (response.ok) {
        console.log("Blog Created Successfully");
        return;
      }

      const result: APIResponse = await response.json();
      if (result.error) {
        console.error(result.message);
        return;
      }

      // Here you can send the blog data to an API or update state
      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Banner
        title="Blog List"
        description="Welcome to the blog list page!"
        bgColor="bg-green-600"
      />

      {/* Create Blog Button */}
      <div className="flex justify-end max-w-7xl mx-auto px-6 mt-6">
        <Button type="primary" size="large" onClick={handleOpenModal}>
          + Create New Blog
        </Button>
      </div>

      {/* Blog Write Modal */}
      <BlogWriteModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmitBlog}
      />

      {/* Blog List */}
      <BlogList />
    </>
  );
};

export default BlogListPage;
