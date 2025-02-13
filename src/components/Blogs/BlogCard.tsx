import Image from "next/image";
import React, { useState, useRef } from "react";
import NoImage from "public/images/blogs/no-image.svg";
import Link from "next/link";
import { Modal, Button } from "antd";
import {
  CommentOutlined,
  LikeOutlined,
  LikeFilled,
  ShareAltOutlined,
} from "@ant-design/icons";
import { BlogType, CommentType } from "@/types/Blogs";
import CommentSection from "./CommentSection";

interface BlogCardProps extends BlogType {}

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  title,
  author,
  createdAt,
  imageUrl,
  content,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([
    {
      id: crypto.randomUUID(),
      user: "Alice",
      text: "Great article! 🎉",
      replies: [],
    },
    {
      id: crypto.randomUUID(),
      user: "Bob",
      text: "Thanks for sharing this.",
      replies: [],
    },
    {
      id: crypto.randomUUID(),
      user: "You",
      text: "Thanks for sharing this.",
      replies: [],
    },
  ]);

  const commentSectionRef = useRef<HTMLDivElement>(null); // Ref for comments section

  // Toggle Like Button
  const handleLike = () => {
    setIsLiked((prev) => !prev);
  };

  // Handle Comment Button Click (Open Modal and Scroll to Comments)
  const handleOpenComments = () => {
    setIsModalOpen(true);
    setTimeout(() => {
      commentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300); // Delay to ensure modal is fully opened
  };

  // Add Comment (Including Replies)
  const handleAddComment = (text: string, parentId?: string) => {
    const newComment = {
      id: crypto.randomUUID(), // Generate a GUID
      user: "You",
      text,
      replies: [],
    };

    if (parentId) {
      // Add reply to the specific comment
      setComments(
        (prev) =>
          prev.map((comment) =>
            comment.id === parentId
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), newComment],
                }
              : comment
          ) as CommentType[]
      );
    } else {
      // Add a new top-level comment
      setComments([...comments, newComment]);
    }

    setTimeout(() => {
      commentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) =>
      prev
        .map((comment) => {
          // If the comment to delete is a reply, filter it from replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.filter(
                (reply) => reply.id !== commentId
              ),
            };
          }
          return comment;
        })
        // Filter out the top-level comment if it's the one being deleted
        .filter((comment) => comment.id !== commentId)
    );
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      {/* Author and Date */}
      <div className="flex items-center text-gray-500 text-sm">
        <span className="font-semibold text-gray-700">{author}</span>
        <span className="mx-2">•</span>
        <span>{createdAt}</span>
      </div>

      {/* Blog Title */}
      <Link href={`/blogs/details`} className="block mt-2">
        <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
          {title}
        </h2>
      </Link>

      {/* Blog Image (Optional) */}
      {imageUrl && (
        <div className="mt-3">
          <Image
            src={imageUrl || NoImage}
            alt={title}
            className="w-full max-w-md rounded-md object-cover transition-opacity duration-300 hover:opacity-80"
            width={600}
            height={300}
          />
        </div>
      )}

      {/* Blog Content (Shortened) */}
      <p className="mt-2 text-gray-700">
        {content.length > 200 ? `${content.substring(0, 200)}...` : content}
        {content.length > 200 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-500 hover:underline ml-2"
          >
            Read More
          </button>
        )}
      </p>

      {/* Actions (Like, Comment, Share) */}
      <div className="mt-4 flex items-center gap-6 text-gray-500">
        {/* Like Button */}
        <button
          className={`flex items-center gap-2 ${
            isLiked ? "text-red-500" : "hover:text-blue-500"
          }`}
          onClick={handleLike}
        >
          {isLiked ? <LikeFilled /> : <LikeOutlined />}
          <span>{isLiked ? "Liked" : "Like"}</span>
        </button>

        {/* Comment Button */}
        <button
          className="flex items-center gap-2 hover:text-blue-500"
          onClick={handleOpenComments} // Open modal and scroll to comments
        >
          <CommentOutlined />
          <span>Comment</span>
        </button>

        {/* Share Button */}
        <button className="flex items-center gap-2 hover:text-blue-500">
          <ShareAltOutlined />
          <span>Share</span>
        </button>
      </div>

      {/* Modal for Full Blog Content and Comments */}
      <Modal
        title={title}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        centered
        styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }} // Enable scrolling inside the modal
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
        ]}
      >
        {/* Full Blog Content */}
        <p className="text-gray-700">{content}</p>

        {/* Divider */}
        <hr className="my-4" />

        {/* Comments Section (Scroll to this when clicking Comment button) */}
        <CommentSection
          comments={comments}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      </Modal>
    </div>
  );
};

export default BlogCard;
