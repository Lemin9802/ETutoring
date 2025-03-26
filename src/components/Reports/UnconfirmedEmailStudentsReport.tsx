import React, { useState } from "react";
import { Table, Button, Spin, Alert, Space, message } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";

// Data structure matching Backend's UnconfirmedEmailStudentResponse (adjust if needed)
interface UnconfirmedEmailStudentData {
  id: string; // Guid from backend
  fullName: string;
  email: string;
  registrationDate: string; // Assuming backend provides this
}

// Backend ApiResponse structure
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
}

// Raw data structure from API (snake_case)
interface RawUnconfirmedEmailStudentData {
  id: string;
  full_name: string | null;
  email: string;
  registration_date: string; // Adjust if needed
}

const UnconfirmedEmailStudentsReport: React.FC = () => {
  const [data, setData] = useState<UnconfirmedEmailStudentData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [downloadingExcel, setDownloadingExcel] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setData([]); // Clear previous data
    try {
      const apiUrl = "/api/reports/unconfirmed-email-students"; // Updated API endpoint
      const response = await fetch(apiUrl, {
        method: "POST", // Backend expects POST
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch unconfirmed email students data"
        );
      }
      // Adjust mapping based on actual API response structure (snake_case to camelCase)
      const result: ApiResponse<RawUnconfirmedEmailStudentData[]> =
        await response.json();
      if (result.success && result.data) {
        const mappedData: UnconfirmedEmailStudentData[] = result.data.map(
          (item) => ({
            id: item.id,
            fullName: item.full_name || "",
            email: item.email,
            registrationDate: item.registration_date, // Adjust field name
          })
        );
        setData(mappedData);
        if (mappedData.length === 0) {
          message.info("No students with unconfirmed emails found.");
        }
      } else {
        throw new Error(
          result.message || "Failed to fetch unconfirmed email students data"
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: "pdf" | "excel") => {
    const url = `/api/reports/unconfirmed-email-students-${format}`; // Updated API endpoint
    const filename = `UnconfirmedEmailStudentsReport.${
      // Updated filename
      format === "pdf" ? "pdf" : "xlsx"
    }`;
    const setLoadingState =
      format === "pdf" ? setDownloadingPdf : setDownloadingExcel;

    setLoadingState(true);
    setError(null); // Clear previous errors

    try {
      const response = await fetch(url, {
        method: "POST", // Backend expects POST
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to download ${format.toUpperCase()} report`
        );
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      message.success(
        `${format.toUpperCase()} report downloaded successfully.`
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : `An error occurred during ${format} download.`;
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoadingState(false);
    }
  };

  // Adjust columns based on the actual data structure
  const columns: TableProps<UnconfirmedEmailStudentData>["columns"] = [
    {
      title: "Student Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Registration Date", // Adjust title if needed
      dataIndex: "registrationDate",
      key: "registrationDate",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"), // Format as date only
      sorter: (a, b) =>
        new Date(a.registrationDate).getTime() -
        new Date(b.registrationDate).getTime(),
    },
  ];

  return (
    <Spin spinning={loading}>
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={fetchData}
          loading={loading}
        >
          Fetch Report
        </Button>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => handleDownload("pdf")}
          loading={downloadingPdf}
          disabled={downloadingExcel}
        >
          Download PDF
        </Button>
        <Button
          icon={<DownloadOutlined />}
          onClick={() => handleDownload("excel")}
          loading={downloadingExcel}
          disabled={downloadingPdf}
          style={{ background: "#1D6F42", color: "white", border: "none" }}
        >
          Download Excel
        </Button>
      </Space>
      <Table<UnconfirmedEmailStudentData>
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Spin>
  );
};

export default UnconfirmedEmailStudentsReport;
