import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Modal, Avatar } from "antd";
import { CommentType } from "@/types/Blogs";
import { UserOutlined } from "@ant-design/icons";

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
  
  const lastCommentRef = useRef<HTMLDivElement | null>(null); // Ref for the last comment

  // Scroll to the last comment when comments update
  useEffect(() => {
    if (lastCommentRef.current) {
      lastCommentRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [comments]); // Runs whenever comments update

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
    <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>

      {/* Comment List */}
      <div className="max-h-96 overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment, index) => (
            <div
              key={comment.id}
              ref={index === comments.length - 1 ? lastCommentRef : null} // Attach ref to last comment
              className="mb-4 flex items-start gap-3"
            >
              {/* Avatar Placeholder */}
              <Avatar size="large" icon={<UserOutlined />} className="bg-gray-300" />

              <div className="w-full">
                <div className="bg-gray-100 p-3 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center">
                    <strong className="text-gray-700">{comment.user}</strong>

                    {comment.user === "You" && (
                      <button
                        onClick={() => confirmDelete(comment.id)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        🗑 Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 mt-1">{comment.text}</p>
                </div>

                {/* Reply & Like Buttons */}
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <button
                    onClick={() =>
                      setReplyInput((prev) => ({
                        ...prev,
                        [comment.id]: prev[comment.id] ? "" : "",
                      }))
                    }
                    className="hover:text-blue-500 font-semibold"
                  >
                    Reply
                  </button>
                </div>

                {/* Reply Input */}
                {replyInput[comment.id] !== undefined && (
                  <div className="mt-2 flex gap-2 ml-8">
                    <Avatar size="small" icon={<UserOutlined />} className="bg-gray-300" />
                    <Input
                      value={replyInput[comment.id]}
                      onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full rounded-full px-4 py-1"
                    />
                    <Button type="primary" onClick={() => handleAddReply(comment.id)}>
                      Reply
                    </Button>
                  </div>
                )}

                {/* Render Replies (Nested Comments) */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-10 mt-2 border-l-2 pl-3 border-gray-300">
                    {comment.replies.map((reply, replyIndex) => (
                      <div
                        key={reply.id}
                        ref={
                          comment.replies && replyIndex === comment.replies.length - 1
                            ? lastCommentRef
                            : null
                        } // Attach ref to last reply
                        className="mb-2 flex items-start gap-3"
                      >
                        <Avatar size="small" icon={<UserOutlined />} className="bg-gray-300" />

                        <div className="w-full">
                          <div className="bg-gray-200 p-3 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center">
                              <strong className="text-gray-700">{reply.user}</strong>

                              {reply.user === "You" && (
                                <button
                                  onClick={() => confirmDelete(reply.id)}
                                  className="text-red-500 text-sm hover:underline"
                                >
                                  🗑 Delete
                                </button>
                              )}
                            </div>
                            <p className="text-gray-700 mt-1">{reply.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input */}
      <div className="mt-4 flex items-center gap-3">
        <Avatar size="large" icon={<UserOutlined />} className="bg-gray-300" />
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full rounded-full px-4 py-2"
        />
        <Button type="primary" onClick={handleAddComment}>
          Post
        </Button>
      </div>
    </div>
  );
};

export default CommentSection;
