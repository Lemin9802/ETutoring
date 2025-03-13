import { useState } from "react";
import { Card, Button, Modal, Input, message, Popconfirm } from "antd";
import axios from "axios";
import { BlogType } from "@/types/Blogs";

interface BlogCardProps {
  blog: BlogType;
  onBlogUpdated: (updatedBlog: BlogType) => void;
  onBlogDeleted: (deletedBlogId: string) => void;
}

const BlogCard = ({ blog, onBlogUpdated, onBlogDeleted }: BlogCardProps) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [title, setTitle] = useState(blog.title);
  const [content, setContent] = useState(blog.content);
  const [loading, setLoading] = useState(false);

  const handleUpdateBlog = async () => {
    if (!title.trim() || !content.trim()) {
      message.warning("Title and content cannot be empty!");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.put(`/api/blogs/update/${blog.id}`, {
        title,
        content,
      });
      if (response.status === 200) {
        message.success("Blog updated successfully!");
        onBlogUpdated(response.data.blog); // ✅ Truyền đúng tham số
        setIsEditModalVisible(false);
      } else {
        throw new Error("Failed to update blog");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      message.error("Failed to update blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(`/api/blogs/delete/${blog.id}`);
      if (response.status === 200) {
        message.success("Blog deleted successfully!");
        onBlogDeleted(blog.id); // ✅ Truyền đúng tham số
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
    <Card title={blog.title} extra={<Button onClick={() => setIsEditModalVisible(true)}>Edit</Button>}>
      <p>{blog.content}</p>
      <div className="flex justify-end gap-2 mt-4">
        <Popconfirm
          title="Are you sure you want to delete this blog? This action cannot be undone."
          onConfirm={handleDeleteBlog}
          okText="Yes, Delete"
          cancelText="Cancel"
        >
          <Button danger loading={loading}>Delete</Button>
        </Popconfirm>
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
          <Button type="primary" loading={loading} onClick={handleUpdateBlog}>
            Update Blog
          </Button>
        </div>
      </Modal>
    </Card>
  );
};

export default BlogCard;
