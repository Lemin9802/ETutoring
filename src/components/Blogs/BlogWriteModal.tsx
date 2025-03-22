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

/**
 * Nếu Modal này chủ yếu để TẠO blog,
 * thì ta có thể lược bỏ phần update/delete
 */
const BlogWriteModal = ({
  visible,
  onClose,
  onBlogCreated,
  onBlogUpdated,
  onBlogDeleted,
}: BlogWriteModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // ============ CREATE Blog ============
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
        // Lưu ý: theo code BE, response trả về data.data chứ không phải response.data.blog
        // Kiểm tra log:
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

  /**
   * DƯỚI ĐÂY: Nếu bạn **thực sự** muốn modal này vừa Create, vừa Update, vừa Delete,
   * thì bạn cần 1 cách "nhận ID" (props hoặc state). Tạm để code mẫu:
   */

  const handleUpdateBlog = async (id: string) => {
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
      const response = await axios.post("/api/blogs/update", {
        id,
        title,
        content,
      });

      if (response.status === 200) {
        const updatedBlog: BlogType = response.data.data; // BE trả về data.data
        message.success("✅ Blog updated successfully!");
        if (onBlogUpdated) onBlogUpdated(updatedBlog);
        onClose();
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

  const handleDeleteBlog = async (id: string) => {
    if (!id) {
      message.error("❌ Error: Blog ID is missing.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("/api/blogs/delete", { id });
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
        {/* Nút Create */}
        <Button type="primary" loading={loading} onClick={handleCreateBlog}>
          Create Blog
        </Button>

        {/* Chỉ để DEMO Update/Delete (đang HARDCODE blog-id) */}
        <Button
          type="default"
          loading={loading}
          onClick={() => handleUpdateBlog("some-blog-id")}
        >
          Update Blog
        </Button>
        <Popconfirm
          title="Are you sure you want to delete this blog? This action cannot be undone."
          onConfirm={() => handleDeleteBlog("some-blog-id")}
          okText="Yes, Delete"
          cancelText="Cancel"
        >
          <Button danger loading={loading}>
            Delete Blog
          </Button>
        </Popconfirm>
      </div>
    </Modal>
  );
};

export default BlogWriteModal;
