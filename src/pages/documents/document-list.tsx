import React, { useEffect, useState, useCallback } from "react";
import { Badge, Table, Typography, Button, message } from "antd";
import { ColumnsType } from "antd/es/table";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { convertDocumentStatusColor } from "@/utils/convertDocumentStatusColor";
import { convertDocumentStatusName } from "@/utils/convertDocumentStatusName";
import axios from "axios";
import { APIResponse } from "@/types/APIResponse";
import format from "dayjs";
import AddDocumentModal from "@/components/Documents/AddDocumentModal";
import dayjs from "dayjs";

const { Title, Text } = Typography;

// Define the Tutor interface
interface Tutor {
  tutor_id: string;
  full_name: string;
  address?: string;
  phone_number?: string;
  email?: string;
}

interface Student {
  student_id: string;
  full_name: string;
  address?: string;
  phone_number?: string;
  email?: string;
}

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
  title: string;
  file?: {
    fileList?: { originFileObj: File }[];
  };
}

const DocumentListPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = useSession();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [data, setData] = useState<DataType[]>([]);
  const [tutorList, setTutorList] = useState<Tutor[]>([]);
  const [studentList, setStudentList] = useState<Student[]>([]);

  interface FilterOptions {
    loginDateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
    status: "all" | "active" | "inactive";
  }

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await axios.post<APIResponse>("/api/documents/user", {
        page_number: currentPage,
        page_size: pageSize,
      });

      const resData = response.data.data as unknown as DataType[];

      if (response.data.success) {
        setData(resData);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, pageSize, fetchDocuments]);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await axios.post<APIResponse>("/api/students/get-tutors");
        const resData = response.data.data as Tutor[];

        if (response.data.success) {
          // Adjust mapping if necessary. Assuming API returns complete Tutor objects.
          setTutorList(resData);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };
    fetchTutors();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const fetchParams = {
          page: 1,
          size: pageSize,
          searchTerm: "",
          currentFilters: {
            loginDateRange: null,
            status: "all",
            gender: null,
            nationality: null,
          } as FilterOptions,
        };
        const { page, size, searchTerm, currentFilters } = fetchParams;

        const bodyData = {
          page,
          size,
          search: searchTerm,
          filters: {
            loginDateRange: currentFilters.loginDateRange
              ? [
                  currentFilters.loginDateRange[0]?.toISOString(),
                  currentFilters.loginDateRange[1]?.toISOString(),
                ]
              : null,
            status: currentFilters.status,
          },
        };

        const response = await axios.post("/api/tutors/get-students", bodyData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data: APIResponse = await response.data;

        const tutorData = data.data.map(
          (item: {
            tutor_id: string;
            full_name: string;
            address?: string;
            phone_number?: string;
            email?: string;
          }) => {
            return {
              student_id: item.tutor_id,
              full_name: item.full_name,
              address: item.address,
              phone_number: item.phone_number,
              email: item.email,
            };
          }
        );

        setStudentList(tutorData);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          message.error({
            content: error.response?.data?.message || "An error occurred while fetching students",
            key: "students-fetch-error",
            duration: 3,
          });
        }
      }
    };
    fetchStudents();
  }, [pageSize]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (values: SubmitValues) => {
    try {
      const senderId = session?.user?.id;
      const tutorId: string = values.tutor;
      const uploadedFile: File | undefined = values.file?.fileList?.[0]?.originFileObj;

      if (!uploadedFile || !senderId || !tutorId) {
        message.error("Missing required information!");
        return;
      }

      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("uploaderId", senderId);
      formData.append("tutorId", tutorId);
      formData.append("title", values.title);

      const response = await axios.post("/api/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        message.success("Document uploaded successfully!");
        // Refresh the documents list
        fetchDocuments();
      } else {
        message.error(response.data.message || "Failed to upload document");
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error uploading document:", error);
      message.error("Failed to upload document. Please try again.");
    }
  };

  const handleTableChange = (pagination: { current?: number; pageSize?: number }) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
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
        <Badge color={convertDocumentStatusColor(status)} text={convertDocumentStatusName(status)} />
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
      render: (recipient: string) => <Text>{recipient}</Text>,
    },
    {
      title: (
        <Text strong style={{ fontSize: "14px" }}>
          Status Updated
        </Text>
      ),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (updatedAt: string) => <Text>{format(updatedAt).format("MMMM D, YYYY h:mm A")}</Text>,
    },
    {
      title: "Action",
      key: "action",
      render: (record: DataType) => (
        <Link href={`/documents/detail?id=${record.id}`}>
          <Button type="primary" ghost>
            Detail
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <Title level={2}>Documents</Title>
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

      <AddDocumentModal
        isOpen={isModalOpen}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        tutorList={tutorList}
        studentList={studentList}
      />
    </div>
  );
};

export default DocumentListPage;
