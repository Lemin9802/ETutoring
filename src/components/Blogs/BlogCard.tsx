import { useState } from "react";
import {
  Card,
  Button,
  Modal,
  Input,
  message,
  Popconfirm,
  Dropdown,
  Menu,
} from "antd";
import axios from "axios";
import { BlogType } from "@/types/Blogs";
import { useSession } from "next-auth/react";
import { MoreOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

interface BlogCardProps {
  blog: BlogType & { userName?: string };
  onBlogUpdated: (updatedBlog: BlogType) => void;
  onBlogDeleted?: (deletedBlogId: string) => void;
}

const BlogCard = ({ blog, onBlogUpdated, onBlogDeleted }: BlogCardProps) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [title, setTitle] = useState(blog.title);
  const [content, setContent] = useState(blog.content);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");

  const { data: session } = useSession();

  const canEditOrDelete =
    session?.user?.roles === "Admin" || session?.user?.id === blog.user_id;

  const handleUpdateBlog = async () => {
    if (!blog.id) return message.error("❌ Error: Blog ID is missing.");
    if (!title.trim() || !content.trim()) {
      return message.warning("⚠ Title and content cannot be empty!");
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "/api/blogs/update",
        { id: blog.id, title, content },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      );

      if (response.status === 200) {
        message.success("✅ Blog updated successfully!");
        onBlogUpdated(response.data.data);
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
    if (!blog.id) return message.error("❌ Error: Blog ID is missing.");

    setLoading(true);
    try {
      const response = await axios.post(
        "/api/blogs/delete",
        { id: blog.id },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      );

      if (response.status === 200) {
        message.success("🗑 Blog deleted successfully!");
        onBlogDeleted?.(blog.id);
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

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments((prev) => [...prev, newComment]);
    setNewComment("");
  };

  const menu = (
    <Menu>
      <Menu.Item key="edit" onClick={() => setIsEditModalVisible(true)}>
        ✏ Edit
      </Menu.Item>
      <Menu.Item key="delete">
        <Popconfirm
          title="Are you sure to delete this blog?"
          onConfirm={handleDeleteBlog}
          okText="Yes"
          cancelText="No"
        >
          <span className="text-red-500">🗑 Delete</span>
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  return (
    <Card className="shadow rounded-xl p-4 bg-white border border-gray-200 transition-transform hover:scale-105 duration-300">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm">
            👤
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {blog.userName || "Unknown User"}
            </p>
            <p className="text-xs text-gray-500">
              {dayjs(blog.created_at).format("HH:mm DD-MM-YYYY")}
            </p>
          </div>
        </div>

        {canEditOrDelete && (
          <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-1">{blog.title}</h2>
      <p className="text-gray-700 mb-4">{blog.content.slice(0, 120)}...</p>

      {/* Comment Box */}
      <div className="border-t pt-3">
        <Input.TextArea
          rows={2}
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-2"
        />
        <div className="flex justify-end">
          <Button
            type="primary"
            icon={<span className="mr-1">💬</span>}
            onClick={handleAddComment}
          >
            Comment
          </Button>
        </div>
        {comments.length > 0 && (
          <div className="mt-3 space-y-2">
            {comments.map((comment, idx) => (
              <div
                key={idx}
                className="bg-gray-50 border border-gray-200 p-2 rounded text-sm"
              >
                <span className="text-gray-600">🗨 {comment}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Edit */}
      <Modal
        title="Edit Blog"
        open={isEditModalVisible}
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
