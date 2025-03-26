import { useState } from "react";
import { Modal, Input, Button, message} from "antd";
import axios from "axios";
import { BlogType } from "@/types/Blogs";

interface BlogWriteModalProps {
  visible: boolean;
  onClose: () => void;
  onBlogCreated: (newBlog: BlogType) => void;
  onBlogUpdated?: (updatedBlog: BlogType) => void;
  onBlogDeleted?: (deletedBlogId: string) => void;
}

const BlogWriteModal = ({
  visible,
  onClose,
  onBlogCreated,
}: BlogWriteModalProps) => {
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

        const createdBlog: BlogType = response.data.data;
        onBlogCreated(createdBlog);
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
      </div>
    </Modal>
  );
};

export default BlogWriteModal; 