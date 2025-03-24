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

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const { data: session } = useSession();

  const handleUpdateBlog = async () => {
    if (!blog.id) {
      message.error("❌ Error: Blog ID is missing.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      message.warning("⚠ Title and content cannot be empty!");
      return;
    }

    setLoading(true);
    try {
      console.log(`📝 Updating Blog ID: ${blog.id}`);
      const response = await axios.post(
        "/api/blogs/update",
        {
          id: blog.id,
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
    if (!blog.id) {
      message.error("❌ Error: Blog ID is missing.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "/api/blogs/delete",
        { id: blog.id },
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        }
      );

      if (response.status === 200) {
        message.success("🗑 Blog deleted successfully!");
        if (onBlogDeleted) onBlogDeleted(blog.id);
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
      <p className="text-gray-700">
        {blog.content.slice(0, 100)}...
      </p>

      {/* Footer actions */}
      <div className="flex justify-end gap-2 mt-4">
        {onBlogDeleted ? (
          <Popconfirm
            title="Are you sure you want to delete this blog? This action cannot be undone."
            onConfirm={handleDeleteBlog}
            okText="Yes, Delete"
            cancelText="Cancel"
          >
            <Button danger loading={loading}>
              🗑 Delete
            </Button>
          </Popconfirm>
        ) : (
          <Button onClick={() => setIsDetailModalVisible(true)}>
            👀 View Detail
          </Button>
        )}
      </div>

      {/* Modal Edit */}
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

      <Modal
        title="View Blog Detail"
        visible={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
      >
        <h3 className="text-lg font-semibold mb-2">{blog.title}</h3>
        <p>{blog.content}</p>
      </Modal>
    </Card>
  );
};

export default BlogCard;
