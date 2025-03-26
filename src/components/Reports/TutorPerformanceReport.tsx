import React, { useState } from "react";
import { Table, Button, Spin, Alert, Space, message, Statistic } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";

interface TutorPerformanceData {
  tutorId: string;
  tutorName: string;
  messageCount: number;
}

interface AverageMessagesResponse {
  averageMessages: number;
  tutorPerformances: TutorPerformanceData[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
}

const TutorPerformanceReport: React.FC = () => {
  const [data, setData] = useState<TutorPerformanceData[]>([]);
  const [averageMessages, setAverageMessages] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [downloadingExcel, setDownloadingExcel] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    setData([]);
    setAverageMessages(null);
    setError(null);
    try {
      const response = await fetch("/api/reports/tutor-performance", {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch tutor performance data"
        );
      }
      const result: ApiResponse<AverageMessagesResponse> =
        await response.json();
      if (result.success && result.data) {
        setData(result.data.tutorPerformances || []);
        setAverageMessages(result.data.averageMessages);
        if ((result.data.tutorPerformances || []).length === 0) {
          message.info("No tutor performance data found.");
        }
      } else {
        throw new Error(
          result.message || "Failed to fetch tutor performance data"
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
    const url = `/api/reports/tutor-performance-${format}`;
    const filename = `TutorPerformanceReport.${
      format === "pdf" ? "pdf" : "xlsx"
    }`;
    const setLoadingState =
      format === "pdf" ? setDownloadingPdf : setDownloadingExcel;

    setLoadingState(true);
    setError(null);

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

  const columns: TableProps<TutorPerformanceData>["columns"] = [
    {
      title: "Tutor Name",
      dataIndex: "tutorName",
      key: "tutorName",
      sorter: (a, b) => a.tutorName.localeCompare(b.tutorName),
    },
    {
      title: "Message Count",
      dataIndex: "messageCount",
      key: "messageCount",
      sorter: (a, b) => a.messageCount - b.messageCount,
      render: (count) => count,
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
      {averageMessages !== null && (
        <Statistic
          title="Average Messages Per Tutor"
          value={averageMessages}
          precision={2}
          style={{ marginBottom: 16 }}
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
      <Table<TutorPerformanceData>
        columns={columns}
        dataSource={data}
        rowKey="tutorId"
        pagination={{ pageSize: 10 }}
      />
    </Spin>
  );
};

export default TutorPerformanceReport;
