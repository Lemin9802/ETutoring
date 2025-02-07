import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import Quill styles

// Dynamically import React Quill to prevent SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface BlogWriteModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: { title: string; content: string }) => void;
}

const BlogWriteModal: React.FC<BlogWriteModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [content, setContent] = useState(""); // State for React Quill content
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg: 1024px
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({ ...values, content }); // Pass content separately
      form.resetFields();
      setContent(""); // Reset Quill editor
    } catch (error) {
      console.log("Validation Failed:", error);
    }
  };

  if (!visible) return null;

  return isLargeScreen ? (
    // **Standard Modal for Large Screens**
    <Modal
      title="Create a New Blog"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Submit
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        {/* Blog Title */}
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please enter a blog title" }]}
        >
          <Input placeholder="Enter blog title" />
        </Form.Item>

        {/* Blog Content using React Quill */}
        <Form.Item
          label="Content"
          required
          rules={[
            {
              validator: (_, value) =>
                content
                  ? Promise.resolve()
                  : Promise.reject("Please enter blog content"),
            },
          ]}
        >
          <ReactQuill value={content} onChange={setContent} />
        </Form.Item>
      </Form>
    </Modal>
  ) : (
    // **Full-Screen Editor for Small Screens**
    <div className="fixed inset-0 bg-white z-50 p-6 pt-24 overflow-y-auto">
      {/* Close Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Create a New Blog</h2>
        <Button type="text" danger onClick={onClose}>
          ✖ Close
        </Button>
      </div>

      <Form form={form} layout="vertical">
        {/* Blog Title */}
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please enter a blog title" }]}
        >
          <Input placeholder="Enter blog title" />
        </Form.Item>

        {/* Blog Content using React Quill */}
        <Form.Item
          label="Content"
          required
          rules={[
            {
              validator: (_, value) =>
                content
                  ? Promise.resolve()
                  : Promise.reject("Please enter blog content"),
            },
          ]}
        >
          <ReactQuill
            value={content}
            onChange={setContent}
            className="h-[300px]"
          />
        </Form.Item>

        {/* Submit Button */}
        <Button type="primary" block size="large" onClick={handleOk}>
          Submit
        </Button>
      </Form>
    </div>
  );
};

export default BlogWriteModal;
