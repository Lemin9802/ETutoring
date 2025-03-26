import React, { useState, useEffect } from "react";
import { Divider, Modal, message } from "antd";
import CommentSection from "./CommentSection";
import axios from "axios";

interface BlogModalProps {
  blogTitle: string;
  blogContent: string;
  blogId: string;
  isVisible: boolean;
  onClose: () => void;
}

interface CommentType {
  id: string;
  userId: string;
  user: string | null;
  text: string;
  createdAt: string;
  updatedAt: string;
  replies?: CommentType[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    content: string;
    user_id: string;
    user: string | null;
    id: string;
    created_at: string;
    updated_at: string;
  }[];
  errors: null | string;
  meta: null | string;
}

const BlogModal: React.FC<BlogModalProps> = ({
  blogTitle,
  blogContent,
  blogId,
  isVisible,
  onClose,
}) => {
  const [comments, setComments] = useState<CommentType[]>([]);

  // Fetch comments when modal opens
  useEffect(() => {
    if (isVisible) {
      fetchComments();
    }
  }, [isVisible]);

  const fetchComments = async () => {
    try {
      const response = await fetch("/api/blogs/comments/get-by-blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blog_id: blogId }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data: ApiResponse = await response.json();
  
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch comments.");
      }
  
      const fetchedComments: CommentType[] = data.data.map((comment) => ({
        id: comment.id,
        userId: comment.user_id,
        user: comment.user,
        text: comment.content,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        replies: [],
      }));
  
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      message.error("Failed to load comments.");
    }
  };  

  const handleAddComment = async (text: string, parentId?: string) => {
    try {
      const response = await axios.post("/api/blogs/comments/create", {
        blog_id: blogId,
        content: text,
        parent_id: parentId || null,
      });
  
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to add comment.");
      }
  
      const newComment: CommentType = {
        id: response.data.data.id,
        userId: response.data.data.user_id,
        user: response.data.data.user,
        text: response.data.data.content,
        createdAt: response.data.data.created_at,
        updatedAt: response.data.data.updated_at,
        replies: [],
      };
  
      setComments((prevComments) =>
        parentId
          ? prevComments.map((comment) =>
              comment.id === parentId
                ? { ...comment, replies: [...(comment.replies || []), newComment] }
                : comment
            )
          : [...prevComments, newComment]
      );
  
      message.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      message.error("Failed to add comment.");
    }
  };
    

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await axios.post("/api/blogs/comments/delete", {
        comment_id: commentId,
      });
  
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete comment.");
      }
  
      setComments((prevComments) =>
        prevComments
          .filter((comment) => comment.id !== commentId)
          .map((comment) => ({
            ...comment,
            replies: comment.replies?.filter((reply) => reply.id !== commentId) || [],
          }))
      );
  
      message.success("Comment deleted.");
    } catch (error) {
      console.error("Error deleting comment:", error);
      message.error("Failed to delete comment.");
    }
  };
  

  return (
    <Modal open={isVisible} onOk={onClose} onCancel={onClose} footer={null}>
      <h2 className="text-lg font-semibold mb-1">{blogTitle}</h2>
      <p>{blogContent}</p>
      <Divider />
      <CommentSection
        comments={comments}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />
    </Modal>
  );
};

export default BlogModal;
