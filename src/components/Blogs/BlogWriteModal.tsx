import { useState } from "react";
import { Modal, Input, Button, message, Popconfirm } from "antd";
import axios from "axios";
import { BlogType } from "@/types/Blogs";

interface BlogWriteModalProps {
  visible: boolean;
  onClose: () => void;
  onBlogCreated: (newBlog: BlogType) => void;
  onBlogUpdated?: (updatedBlog: BlogType) => void;
  onBlogDeleted?: (deletedBlogId: string) => void;
}

const BlogWriteModal = ({ visible, onClose, onBlogCreated, onBlogUpdated, onBlogDeleted }: BlogWriteModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateBlog = async () => {
    if (!title.trim() || !content.trim()) {
      message.warning("Title and content cannot be empty!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/blogs/create", {
        title,
        content,
      });

      if (response.status === 200) {
        message.success("Blog created successfully!");
        onBlogCreated(response.data.blog);
        setTitle("");
        setContent("");
        onClose();
      } else {
        throw new Error("Failed to create blog");
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      message.error("Failed to create blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBlog = async (id: string) => {
    if (!title.trim() || !content.trim()) {
      message.warning("Title and content cannot be empty!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`/api/blogs/update/${id}`, {
        title,
        content,
      });

      if (response.status === 200) {
        message.success("Blog updated successfully!");
        if (onBlogUpdated) {
          onBlogUpdated(response.data.blog);
        }
        onClose();
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

  const handleDeleteBlog = async (id: string) => {
    setLoading(true);
    try {
      const response = await axios.delete(`/api/blogs/delete/${id}`);

      if (response.status === 200) {
        message.success("Blog deleted successfully!");
        if (onBlogDeleted) {
          onBlogDeleted(id);
        }
        onClose();
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
    <Modal title="Write a Blog" visible={visible} onCancel={onClose} footer={null}>
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
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" loading={loading} onClick={handleCreateBlog}>
          Create Blog
        </Button>
        <Button type="default" loading={loading} onClick={() => handleUpdateBlog("blog-id")}>
          Update Blog
        </Button>
        <Popconfirm
          title="Are you sure you want to delete this blog? This action cannot be undone."
          onConfirm={() => handleDeleteBlog("blog-id")}
          okText="Yes, Delete"
          cancelText="Cancel"
        >
          <Button danger loading={loading}>Delete Blog</Button>
        </Popconfirm>
      </div>
    </Modal>
  );
};

export default BlogWriteModal;
