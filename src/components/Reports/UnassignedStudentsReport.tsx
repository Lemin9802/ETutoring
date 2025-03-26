import React, { useState } from "react"; // Removed useEffect
import { Table, Button, Spin, Alert, Space, message } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons"; // Added SearchOutlined
import type { TableProps } from "antd";

// Data structure matching Backend's UnassignedStudentResponse
interface UnassignedStudentData {
  id: string; // Guid from backend
  fullName: string;
  email: string;
  registrationDate?: string | null; // DateTime? from backend
}

// Backend ApiResponse structure
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
}

const UnassignedStudentsReport: React.FC = () => {
  const [data, setData] = useState<UnassignedStudentData[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Changed initial loading to false
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [downloadingExcel, setDownloadingExcel] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setData([]); // Clear previous data
    try {
      const apiUrl = "/api/reports/unassigned-students";
      const response = await fetch(apiUrl, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch unassigned students data"
        );
      }
      const result: ApiResponse<UnassignedStudentData[]> =
        await response.json();
      if (result.success && result.data) {
        setData(result.data);
        if (result.data.length === 0) {
          message.info("No unassigned students found.");
        }
      } else {
        throw new Error(
          result.message || "Failed to fetch unassigned students data"
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

  // Removed useEffect hook

  const handleDownload = async (format: "pdf" | "excel") => {
    // Corrected download API endpoints based on ReportController.cs
    const url = `/api/reports/unassigned-students-${format}`; // CORRECTED
    const filename = `UnassignedStudentsReport.${
      format === "pdf" ? "pdf" : "xlsx"
    }`;
    const setLoadingState =
      format === "pdf" ? setDownloadingPdf : setDownloadingExcel;

    setLoadingState(true);
    setError(null); // Clear previous errors

    try {
      const response = await fetch(url, {
        method: "POST",
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

  const columns: TableProps<UnassignedStudentData>["columns"] = [
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
      title: "Registration Date",
      dataIndex: "registrationDate",
      key: "registrationDate",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
      sorter: (a, b) =>
        a.registrationDate && b.registrationDate
          ? new Date(a.registrationDate).getTime() -
            new Date(b.registrationDate).getTime()
          : a.registrationDate
          ? -1
          : b.registrationDate
          ? 1
          : 0,
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
      <Table<UnassignedStudentData>
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Spin>
  );
};

export default UnassignedStudentsReport;
