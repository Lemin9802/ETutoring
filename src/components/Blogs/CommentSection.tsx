import React, { useState } from "react";
import { Input, Button, Modal } from "antd";
import { CommentType } from "@/types/Blogs";

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
  const [replyInput, setReplyInput] = useState<{ [key: string]: string }>({});

  const handleAddComment = () => {
    if (newComment.trim() === "") return;
    onAddComment(newComment);
    setNewComment("");
  };

  const handleReplyChange = (parentId: string, text: string) => {
    setReplyInput((prev) => ({
      ...prev,
      [parentId]: text,
    }));
  };

  const handleAddReply = (parentId: string) => {
    if (!replyInput[parentId]?.trim()) return;

    onAddComment(replyInput[parentId], parentId);

    setReplyInput((prev) => ({
      ...prev,
      [parentId]: "",
    }));
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
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>

      {/* Comment List */}
      <div className="max-h-60 overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="mb-2 p-2 bg-gray-100 rounded-md">
              <div className="flex justify-between items-center">
                <strong className="text-gray-700">{comment.user}</strong>

                {/* Delete button only for user's own comments */}
                {comment.user === "You" && (
                  <button
                    onClick={() => confirmDelete(comment.id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    🗑 Delete
                  </button>
                )}
              </div>
              <p className="text-gray-600">{comment.text}</p>

              {/* Reply Button */}
              <button
                onClick={() =>
                  setReplyInput((prev) => ({
                    ...prev,
                    [comment.id]: prev[comment.id] ? "" : "", // Toggle reply input
                  }))
                }
                className="text-blue-500 text-sm mt-1 hover:underline"
              >
                Reply
              </button>

              {/* Reply Input (only appears for this comment) */}
              {replyInput[comment.id] !== undefined && (
                <div className="mt-2 ml-6 flex gap-2">
                  <Input
                    value={replyInput[comment.id]}
                    onChange={(e) =>
                      handleReplyChange(comment.id, e.target.value)
                    }
                    placeholder="Reply to this comment..."
                  />
                  <Button
                    type="primary"
                    onClick={() => handleAddReply(comment.id)}
                  >
                    Reply
                  </Button>
                </div>
              )}

              {/* Render Replies (Nested Comments) */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-6 mt-2 border-l pl-3 border-gray-300">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="mb-2 p-2 bg-gray-200 rounded-md"
                    >
                      <div className="flex justify-between items-center">
                        <strong className="text-gray-700">{reply.user}</strong>

                        {/* Delete button only for user's own replies */}
                        {reply.user === "You" && (
                          <button
                            onClick={() => confirmDelete(reply.id)}
                            className="text-red-500 text-sm hover:underline"
                          >
                            🗑 Delete
                          </button>
                        )}
                      </div>
                      <p className="text-gray-600">{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input */}
      <div className="mt-4 flex gap-2">
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
