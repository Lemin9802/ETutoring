import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Modal, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";

interface CommentType {
  id: string;
  userId: string;
  user: string | null;
  text: string;
  createdAt: string;
  updatedAt: string;
  replies?: CommentType[];
}

interface CommentSectionProps {
  comments: CommentType[];
  onAddComment: (text: string, parentId?: string) => void;
  onDeleteComment: (commentId: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  onAddComment,
  onDeleteComment,
}) => {
  const [newComment, setNewComment] = useState("");
  const lastCommentRef = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession(); // Lấy session từ next-auth

  useEffect(() => {
    if (lastCommentRef.current) {
      lastCommentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [comments]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment("");
  };

  const confirmDelete = (commentId: string) => {
    Modal.confirm({
      title: "Are you sure?",
      content: "Do you want to delete your comment?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => onDeleteComment(commentId),
    });
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>
      <div className="max-h-96 overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment, index) => (
            <div
              key={comment.id}
              ref={index === comments.length - 1 ? lastCommentRef : null}
              className="mb-4 flex items-start gap-3"
            >
              <Avatar size="large" icon={<UserOutlined />} className="bg-gray-300" />
              <div className="w-full">
                <div className="bg-gray-100 p-3 rounded-lg shadow-sm">
                  <strong className="text-gray-700">
                    {comment.user || "Anonymous"}
                  </strong>
                  <p className="text-gray-700 mt-1">{comment.text}</p>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  {/* Chỉ hiển thị nút Delete nếu comment thuộc về user hiện tại */}
                  {session?.user?.id === comment.userId && (
                    <button
                      onClick={() => confirmDelete(comment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
        />
        <Button type="primary" onClick={handleAddComment}>
          Post
        </Button>
      </div>
    </div>
  );
};

export default CommentSection;
