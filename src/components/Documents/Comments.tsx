import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Tag,
  Typography,
  Input,
  Button,
  Avatar,
  Divider,
  Empty,
  Spin,
} from "antd";
import {
  CommentOutlined,
  SendOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface SubmissionDataItem {
  label: string;
  value: string | React.ReactNode;
  tagColor?: string;
  isFile?: boolean;
  fileUrl?: string;
  icon?: React.ReactNode;
}

interface CommentType {
  id: string;
  commenter_id: string;
  commenter_name: string;
  created_at: string;
  content: string;
  document_id: string;
  parent_id?: string | null;
  replies?: CommentType[];
}

interface CommentInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onClear: () => void;
  submitting?: boolean;
}

// Memoized comment item to prevent re-rendering all comments when typing
const CommentItem = memo(({ comment }: { comment: CommentType }) => {
  const { data: session } = useSession();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mb-5 relative"
    >
      <div className="flex gap-4">
        <Avatar icon={<UserOutlined />} className="bg-blue-600" size={40} />
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <Text strong className="text-base">
              {comment.commenter_name !== ""
                ? comment.commenter_name
                : session?.user.id === comment.commenter_id
                ? "You"
                : "Tutor"}
            </Text>
            <Text type="secondary" className="text-sm">
              {comment.created_at}
            </Text>
          </div>
          <Paragraph className="!text-start text-[15px] mb-0 leading-6 text-gray-800 bg-blue-50 p-3 rounded-xl">
            {comment.content}
          </Paragraph>
        </div>
      </div>
    </motion.div>
  );
});

CommentItem.displayName = "CommentItem";

// Memoized input component to prevent re-renders of the comment list when typing
const MemoizedCommentInput = memo(
  ({
    value,
    onChange,
    onSubmit,
    onClear,
    submitting = false,
  }: CommentInputProps) => (
    <div className="mt-6">
      <TextArea
        value={value}
        onChange={onChange}
        placeholder="Write a comment..."
        autoSize={{ minRows: 2, maxRows: 6 }}
        className="rounded-lg resize-none text-[15px] p-3 bg-gray-50 border-gray-200"
        disabled={submitting}
      />
      <div className="flex gap-3 justify-end mt-3">
        <Button
          onClick={onClear}
          icon={<DeleteOutlined />}
          disabled={!value.trim() || submitting}
          className="flex items-center"
        >
          Clear
        </Button>
        <Button
          type="primary"
          onClick={onSubmit}
          icon={<SendOutlined />}
          disabled={!value.trim() || submitting}
          loading={submitting}
          className="flex items-center"
        >
          Post
        </Button>
      </div>
    </div>
  )
);

MemoizedCommentInput.displayName = "MemoizedCommentInput";

// Memoized comments list to prevent re-renders when typing in the input
const MemoizedCommentsList = memo(
  ({ comments }: { comments: CommentType[] }) => (
    <div className="max-h-[500px] overflow-y-auto pr-2.5 mt-5">
      {comments.length > 0 ? (
        <AnimatePresence>
          {comments.map((comment, index) => (
            <CommentItem key={index} comment={comment} />
          ))}
        </AnimatePresence>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No comments yet"
          className="my-10"
        />
      )}
    </div>
  )
);

MemoizedCommentsList.displayName = "MemoizedCommentsList";

const DocumentInfo = ({
  submissionData,
}: {
  submissionData: SubmissionDataItem[];
}) => (
  <div className="mb-10">
    <table className="w-full">
      <tbody>
        {submissionData.map((item, index) => (
          <tr
            key={index}
            className={
              index < submissionData.length - 1
                ? "border-b border-gray-200"
                : ""
            }
          >
            <td className="py-4 flex items-center w-1/3">
              {item.icon && (
                <span className="text-blue-600 mr-2.5 text-base">
                  {item.icon}
                </span>
              )}
              <Text strong className="text-[15px] text-gray-800">
                {item.label}
              </Text>
            </td>
            <td className="py-4">
              {item.tagColor ? (
                <Tag
                  color={item.tagColor}
                  className="text-sm px-2.5 py-0.5 rounded"
                >
                  {item.value}
                </Tag>
              ) : item.isFile ? (
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm inline-block"
                >
                  {item.value}
                </a>
              ) : (
                item.value
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Feedback: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [feedback, setFeedback] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const userRole = session?.user?.roles?.toLowerCase() || "students";

  useEffect(() => {
    if (id) {
      setLoading(true);

      const fetchData = async () => {
        try {
          const response = await axios.post(`/api/documents/comments/get`, {
            document_id: id,
          });

          const fetchedComments = response.data.data.flatMap((comment: CommentType) => {
            // Include the parent comment
            const mainComment = { ...comment };

            // Include the replies as separate comments
            const replies = comment.replies
              ? comment.replies.map((reply: CommentType) => ({
                  ...reply,
                }))
              : [];

            // Flatten the result (parent comment + its replies as separate items)
            return [mainComment, ...replies];
          });

          setComments(fetchedComments);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [id]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewComment(e.target.value);
    },
    []
  );

  const handleClearComment = useCallback(() => {
    setNewComment("");
  }, []);

  // Determine if user can provide feedback based on role
  const canProvideFeedback =
    userRole === "teachers" ||
    userRole === "admin" ||
    userRole === "moderators";

  // Determine if user can comment based on role and existing comments
  const canComment =
    userRole !== "students" || (userRole === "students" && comments.length > 0);

  const handleAddComment = useCallback(async () => {
    if (newComment.trim() && canComment && !submitting) {
      setSubmitting(true);
      setSubmitError(null);

      // Get the latest comment ID to use as the parent ID
      const latestComment =
        comments.length > 0 ? comments[comments.length - 1] : null;
      const parentId = latestComment?.id || null;

      setNewComment("");

      // Send the comment to the backend
      await axios
        .post("/api/documents/comments/create", {
          documentId: id,
          content: newComment,
          parentCommentId: parentId,
        })
        .then((response) => {
          // Replace the temporary comment with the real one from the server
          if (response.data && response.data) {
            const newComment = response.data.data as CommentType;
            setComments((prevComments) => [...prevComments, newComment]);
          }
          setSubmitting(false);
        })
        .catch((error) => {
          console.error("Error creating comment:", error);
          setSubmitError("Failed to save your comment. Please try again.");
          setSubmitting(false);
        });
    }
  }, [
    newComment,
    id,
    canComment,
    comments,
    submitting,
  ]);

  const handleSaveFeedback = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleEditFeedback = useCallback(() => {
    setIsEditing(true);
  }, []);

  const submissionData: SubmissionDataItem[] = [
    {
      label: "Submission status",
      value: "Submitted for grading",
      tagColor: "blue",
      icon: <CheckCircleOutlined />,
    },
  ];

  // Only add feedback comments section if the user can provide feedback
  if (canProvideFeedback) {
    submissionData.push({
      label: "Feedback comments",
      value: (
        <div>
          {isEditing ? (
            <>
              <TextArea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback..."
                autoSize={{ minRows: 3, maxRows: 6 }}
                className="rounded-lg resize-none text-[15px] p-3 mb-3 bg-gray-50 border-gray-200"
              />
              <Button type="primary" onClick={handleSaveFeedback}>
                Save Feedback
              </Button>
            </>
          ) : (
            <div className="p-3 bg-blue-50 rounded-lg">
              <Text className="block mb-3 text-[15px] leading-6">
                {feedback || "No feedback yet."}
              </Text>
              <Button type="link" onClick={handleEditFeedback} className="p-0">
                Edit
              </Button>
            </div>
          )}
        </div>
      ),
      icon: <CommentOutlined />,
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading document and comments..." />
      </div>
    );
  }

  return (
    <div className="py-10 px-5">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <Title
            level={2}
            className="text-2xl md:text-3xl font-semibold mb-2.5 text-gray-800"
          >
            Document Feedback
          </Title>
          <Divider className="my-6" />
        </div>

        {/* Document information section */}
        <DocumentInfo submissionData={submissionData} />

        {/* Comments section */}
        <div className="mt-10">
          <Title
            level={4}
            className="text-xl font-semibold flex items-center mb-5 text-gray-800"
          >
            <CommentOutlined className="mr-3 text-blue-600" />
            Submission Comments ({comments.length})
          </Title>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <MemoizedCommentsList comments={comments} />
            <Divider className="my-6" />
            {!canComment ? (
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
                <Text strong>Only tutors can initiate a discussion.</Text>{" "}
                Students can comment after a tutor has posted the first comment.
              </div>
            ) : (
              <>
                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {submitError}
                  </div>
                )}
                <MemoizedCommentInput
                  value={newComment}
                  onChange={handleInputChange}
                  onSubmit={handleAddComment}
                  onClear={handleClearComment}
                  submitting={submitting}
                />
                {submitting && (
                  <div className="mt-3 text-center">
                    <Spin size="small" />{" "}
                    <Text type="secondary">Saving comment...</Text>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
