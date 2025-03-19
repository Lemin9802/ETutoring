import { useState } from "react";
import { Card, Button, Modal, Input, message, Popconfirm } from "antd";
import axios from "axios";
import { BlogType } from "@/types/Blogs";
import { useSession } from "next-auth/react";


interface BlogCardProps {
  blog: BlogType;
  onBlogUpdated: (updatedBlog: BlogType) => void;
  onBlogDeleted?: (deletedBlogId: string) => void; 
}

const BlogCard = ({ blog, onBlogUpdated, onBlogDeleted }: BlogCardProps) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [title, setTitle] = useState(blog.title);
  const [content, setContent] = useState(blog.content);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const handleUpdateBlog = async (id: string) => {
    // Kiểm tra id trước
    if (!id) {
      message.error("❌ Error: Blog ID is missing.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      message.warning("⚠ Title and content cannot be empty!");
      return;
    }
  
    setLoading(true);
    try {
      console.log(`📝 Updating Blog ID: ${id}`);
      const response = await axios.post(
        `/api/blogs/update?id=${id}`,
        {
          title,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );
  
      if (response.status === 200) {
        message.success("✅ Blog updated successfully!");
        if (onBlogUpdated) onBlogUpdated(response.data.data);
        setIsEditModalVisible(false);
      } else {
        throw new Error("⚠ Failed to update blog");
      }
    } catch (error) {
      console.error("❌ API Error:", error);
      message.error("❌ Failed to update blog. Please try again.");
    } finally {
      setLoading(false);
    }
  }; 

  const handleDeleteBlog = async () => {
    if (!onBlogDeleted) return; 
    setLoading(true);
    try {
      const response = await axios.delete(`/api/blogs/delete/${blog.id}`);
      if (response.status === 200) {
        message.success("Blog deleted successfully!");
        onBlogDeleted(blog.id);
      } else {
        throw new Error("Failed to delete blog");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      message.error("Failed to delete blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={blog.title}
      extra={
        <Button type="link" onClick={() => setIsEditModalVisible(true)}>
          ✏ Edit
        </Button>
      }
      className="shadow-lg rounded-lg transition-transform hover:scale-105"
    >
      <p className="text-gray-700">{blog.content.slice(0, 100)}...</p>
      <div className="flex justify-end gap-2 mt-4">
        {onBlogDeleted && (
          <Popconfirm
            title="Are you sure you want to delete this blog? This action cannot be undone."
            onConfirm={handleDeleteBlog}
            okText="Yes, Delete"
            cancelText="Cancel"
          >
            <Button danger loading={loading}>🗑 Delete</Button>
          </Popconfirm>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        title="Edit Blog"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Input
          placeholder="Enter blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4"
        />
        <Input.TextArea
          rows={4}
          placeholder="Enter blog content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button onClick={() => setIsEditModalVisible(false)}>Cancel</Button>
          <Button type="primary" loading={loading} onClick={() => handleUpdateBlog(blog.id)}>
            Update Blog
          </Button>

        </div>
      </Modal>
    </Card>
  );
};

export default BlogCard;
