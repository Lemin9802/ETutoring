import React from "react";
import { Modal, Form, Input, Upload, Select, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

interface Tutor {
  tutor_id: string;
  full_name: string;
  address?: string;
  phone_number?: string;
  email?: string;
}

interface SubmitValues {
  tutor: string;
  title: string;
  file?: {
    fileList?: { originFileObj: File }[];
  };
}

interface AddDocumentModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: (values: SubmitValues) => void;
  tutorList: Tutor[];
}

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  isOpen,
  onCancel,
  onSubmit,
  tutorList,
}) => {
  const [form] = Form.useForm();
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleSubmit = (values: SubmitValues) => {
    onSubmit(values);
    form.resetFields();
  };

  const uploadProps = {
    beforeUpload: (_file: File) => {
      void _file;
      return true;
    },
  };

  return (
    <Modal
      title="Add Document"
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Title is required!" }]}
        >
          <Input placeholder="Enter document title" />
        </Form.Item>
        <Form.Item
          label="Select Recipient"
          name="tutor"
          rules={[
            { required: true, message: "Recipient selection is required!" },
          ]}
        >
          <Select placeholder="Choose recipient">
            {tutorList.map((tutor) => (
              <Option key={tutor.tutor_id} value={tutor.tutor_id}>
                {tutor.full_name || tutor.email}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Upload Document"
          name="file"
          rules={[{ required: true, message: "Please upload a document!" }]}
        >
          <Upload {...uploadProps} maxCount={1}>
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDocumentModal;
