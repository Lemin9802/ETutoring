import React, { useEffect, useState } from "react";
import {
  Badge,
  Table,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Select,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { convertDocumentStatusColor } from "@/utils/convertDocumentStatusColor";
import { convertDocumentStatusName } from "@/utils/convertDocumentStatusName";
import axios from "axios";
import { APIResponse } from "@/types/APIResponse";
import format from "dayjs";
const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

interface DataType {
  id: string;
  title: string;
  author: string;
  status: number;
  recipient_name: string;
  updatedAt: string;
}

interface SubmitValues {
  tutor: string;
  file?: {
    fileList?: { originFileObj: File }[];
  };
}

const DocumentUploadedListPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { data: session } = useSession();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [data, setData] = useState<DataType[]>([]);

  const [tutorList, setTutorList] = useState<string[]>([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.post<APIResponse>("/api/documents/user", {
          page_number: currentPage,
          page_size: pageSize,
        });

        const resData = response.data.data as unknown as DataType[];

        if (response.data.success) {
          setData(resData);
        }
        console.log("Documents:", resData);
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchDocuments();
  }, [currentPage, pageSize]);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await axios.post<APIResponse>(
          "/api/students/get-tutors"
        );

        const resData = response.data.data as string[];

        if (response.data.success) {
          setTutorList(resData);
        }
        console.log("Tutors:", resData);
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchTutors();
  }, []);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = (values: SubmitValues) => {
    const senderId = session?.user?.id;
    const tutorId: string = values.tutor;
    const uploadedFile: File | undefined =
      values.file?.fileList?.[0]?.originFileObj;

    console.log("Sender ID:", senderId);
    console.log("Tutor ID:", tutorId);
    console.log("Uploaded File:", uploadedFile);

    message.success("Document submitted successfully!");
    setIsModalOpen(false);
    form.resetFields();
  };

  const uploadProps = {
    beforeUpload: (_file: File) => {
      void _file;
      return true;
    },
  };

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };
  const columns: ColumnsType<DataType> = [
    {
      title: (
        <Text strong style={{ fontSize: "14px" }}>
          Title
        </Text>
      ),
      dataIndex: "title",
      key: "title",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: (
        <Text strong style={{ fontSize: "14px" }}>
          Status
        </Text>
      ),
      dataIndex: "status",
      key: "status",
      render: (status: number) => (
        <Badge
          color={convertDocumentStatusColor(status)}
          text={convertDocumentStatusName(status)}
        />
      ),
    },
    {
      title: (
        <Text strong style={{ fontSize: "14px" }}>
          Recipient
        </Text>
      ),
      dataIndex: "recipient_name",
      key: "recipient",
      render: (recipient: string) => <Text> {recipient}</Text>,
    },
    {
      title: (
        <Text strong style={{ fontSize: "14px" }}>
          Status Updated
        </Text>
      ),
      dataIndex: "updated_at",
      key: "updated_at",
      render: (updatedAt: string) => (
        <Text>{format(updatedAt).format("MMMM D, YYYY h:mm A")}</Text>
      ),
    },
    {
        title: "Action",
        key: "action",
        render: (record: DataType) => (
          <Link href={`/students/upload-document-detail/detail?id=${record.id}`}>
            <Button type="primary" ghost>
              Detail
            </Button>
          </Link>
        ),
      },
  ];

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <Title level={2}>Documents Uploaded</Title>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        <Button type="primary" onClick={showModal}>
          Add Document
        </Button>
      </div>
      <Table<DataType>
        columns={columns}
        dataSource={data}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data.length,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
        }}
        onChange={handleTableChange}
        bordered={false}
        showHeader
      />
      <Modal
        title="Add Document"
        open={isModalOpen}
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
            label="Select Tutor"
            name="tutor"
            rules={[
              { required: true, message: "Tutor selection is required!" },
            ]}
          >
            <Select placeholder="Choose tutor">
              {tutorList.map((tutor) => (
                <Option key={tutor} value={tutor}>
                  {tutor}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Upload File"
            name="file"
            rules={[{ required: true, message: "File upload is required!" }]}
          >
            <Dragger {...uploadProps}>
              <UploadOutlined /> Click or drag file to this area to upload
            </Dragger>
          </Form.Item>
          <Form.Item style={{ textAlign: "right" }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentUploadedListPage;
