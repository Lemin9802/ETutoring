import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Typography, Input, Button, Collapse } from "antd";
import axios from "axios";
import { useRouter } from "next/router";

const { Title } = Typography;
const { Panel } = Collapse;

const Feedback: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  interface DocumentData {
    id: string;
    title: string;
    file_url: string;
    recipient_name: string;
  }

  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [comments, setComments] = useState<{ name: string; time: string; content: string; document_id: string }[]>([]);
  const [newComment, setNewComment] = useState("");
  const [feedback, setFeedback] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      axios.post("/api/documents/user", { page_number: 1, page_size: 10 })
        .then(response => {
          const document = response.data.data.find((doc: DocumentData) => doc.id === id);
          if (document) {
            setDocumentData(document);
          }
        })
        .catch(error => {
          console.error("Error fetching document:", error);
        });
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      axios.post(`/api/documents/comments/get`, { document_id: id })
        .then(response => {
          const fetchedComments = response.data.data.map((comment: { name: string; time: string; content: string }) => ({
            ...comment,
            document_id: id as string,
          }));
          setComments(fetchedComments || []);
          if (fetchedComments.length > 0) {
            setNewComment(fetchedComments[0].content);
          }
        })
        .catch(error => {
          console.error("Error fetching comments:", error);
        });
    }
  }, [id]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const existingComment = comments.find(comment => comment.document_id === id);
      if (!existingComment) {
        const newEntry = {
          name: "Ngọc Minh",
          time: new Date().toLocaleString(),
          content: newComment,
          document_id: id as string,
        };
        setComments([...comments, newEntry]);
      }
      setNewComment("");
    }
  };

  const handleSaveFeedback = () => {
    setIsEditing(false);
  };

  const handleEditFeedback = () => {
    setIsEditing(true);
  };

  const submissionData = [
    { label: "Submission status", value: "Submitted for grading", tagColor: "blue" },
    { label: "Grading status", value: "Graded", tagColor: "green" },
    { label: "Due date", value: "Monday, 18 March 2024, 12:00 PM" },
    { label: "Time remaining", value: "Assignment was submitted 18 days 13 hours early", highlight: true },
    { label: "Last modified", value: "Wednesday, 28 February 2024, 10:58 PM" },
    {
      label: "File submissions",
      value: documentData?.title || "Loading...",
      isFile: true,
      fileUrl: documentData?.file_url || "#",
    },
    {
      label: "Submission comments",
      value: (
        <Collapse>
          <Panel header={<span>Comments ({comments.length})</span>} key="1">
            {comments.length > 0 ? (
              <ul>
                {comments.map((comment, index) => (
                  <li key={index} className="border-b py-2">
                    <strong>{comment.name}</strong> <span className="text-gray-500 text-sm">({comment.time})</span>
                    <p>{comment.document_id}: {comment.content}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No comments yet</p>
            )}
            <Input.TextArea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="mt-2"
            />
            <div className="mt-2 flex gap-2 flex-wrap">
              <Button type="primary" onClick={handleAddComment}>
                Save comment
              </Button>
              <Button onClick={() => setNewComment("")}>Cancel</Button>
            </div>
          </Panel>
        </Collapse>
      ),
    },
    { label: "Grade", value: "Distinction", tagColor: "purple" },
    { label: "Graded on", value: "Thursday, 7 March 2024, 8:49 AM" },
    { label: "Graded by", value: documentData?.recipient_name || "" },
    {
      label: "Feedback comments",
      value: (
        <div>
          {isEditing ? (
            <>
              <Input.TextArea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback..."
                className="mb-2"
              />
              <Button type="primary" onClick={handleSaveFeedback}>
                Save
              </Button>
            </>
          ) : (
            <div>
              <p>{feedback || "No feedback yet."}</p>
              <span
                className="text-blue-600 underline cursor-pointer text-sm"
                onClick={handleEditFeedback}
              >
                Edit
              </span>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 min-h-screen flex justify-center items-center w-full">
      <Card className="w-full max-w-7xl shadow-lg" style={{ backgroundColor: "#E8EDF2" }}>
        <Title level={2} className="mb-4 text-left text-2xl md:text-3xl lg:text-4xl" style={{ color: "#0A2742" }}>
          Feedback
        </Title>
        <Table
          pagination={false}
          showHeader={false}
          dataSource={submissionData.map((item, index) => ({ key: index, ...item }))}
          columns={[
            { dataIndex: "label", key: "label", render: (text) => <strong>{text}</strong> },
            { dataIndex: "value", key: "value", render: (text, record) => record.tagColor ? <Tag color={record.tagColor} className="text-xs md:text-sm">{text}</Tag> : record.isFile ? <a href={record.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs md:text-sm">{text}</a> : record.highlight ? <span className="bg-green-200 px-2 py-1 rounded text-xs md:text-sm">{text}</span> : <span className="text-xs md:text-sm">{text}</span> }
          ]}
          className="overflow-x-auto"
        />
      </Card>
    </div>
  );
};

export default Feedback;
