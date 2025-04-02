import React, { useState, useEffect } from "react";
import { Table, Button, Spin, Alert, message, InputNumber, Form } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";

// Assuming a similar data structure to InactiveStudentData, adjust if needed based on actual API response
interface StudentInteractionData {
  id: string;
  fullName: string;
  email: string;
  lastInteractionTime?: string | null; // Or similar field name from backend
  daysSinceLastInteraction: number; // Or similar field name from backend
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
}

// Interface for the raw data structure from the API (snake_case), adjust if needed
interface RawStudentInteractionData {
  id: string;
  full_name: string | null;
  email: string;
  last_interaction_time: string | null; // Adjust field name if necessary
  days_since_last_interaction: number; // Adjust field name if necessary
}

const StudentsWithoutInteractionReport: React.FC = () => {
  const [data, setData] = useState<StudentInteractionData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [downloadingExcel, setDownloadingExcel] = useState<boolean>(false);
  const [days, setDays] = useState<number>(7); // Default days
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData(days);
  }, []);

  const fetchData = async (currentDays: number) => {
    if (currentDays <= 0) {
      message.error("Please enter a positive number of days.");
      return;
    }
    setLoading(true);
    setError(null);
    setData([]);
    try {
      const response = await fetch("/api/reports/students-no-interaction", {
        // Updated API endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ days: currentDays }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch students without interaction data"
        );
      }
      // Adjust mapping based on actual API response structure (snake_case to camelCase)
      const result: ApiResponse<RawStudentInteractionData[]> =
        await response.json();
      if (result.success && result.data) {
        const mappedData: StudentInteractionData[] = result.data.map(
          (item) => ({
            id: item.id,
            fullName: item.full_name || "",
            email: item.email,
            lastInteractionTime: item.last_interaction_time, // Adjust field name
            daysSinceLastInteraction: item.days_since_last_interaction, // Adjust field name
          })
        );
        setData(mappedData);
        if (mappedData.length === 0) {
          message.info(
            "No students found without interaction for the specified period."
          );
        }
      } else {
        throw new Error(
          result.message || "Failed to fetch students without interaction data"
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

  const onFinish = (values: { days: number }) => {
    setDays(values.days);
    fetchData(values.days);
  };

  const handleDownload = async (format: "pdf" | "excel") => {
    if (days <= 0) {
      message.error(
        "Please enter a positive number of days before downloading."
      );
      return;
    }
    const url = `/api/reports/students-no-interaction-${format}`; // Updated API endpoint
    const filename = `StudentsWithoutInteractionReport_${days}days.${
      // Updated filename
      format === "pdf" ? "pdf" : "xlsx"
    }`;
    const setLoadingState =
      format === "pdf" ? setDownloadingPdf : setDownloadingExcel;

    setLoadingState(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ days }),
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
  const columns: TableProps<StudentInteractionData>["columns"] = [
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
      title: "Last Interaction Time", // Adjust title if needed
      dataIndex: "lastInteractionTime",
      key: "lastInteractionTime",
      render: (date) => (date ? new Date(date).toLocaleString() : "Never"),
      sorter: (a, b) =>
        a.lastInteractionTime && b.lastInteractionTime
          ? new Date(a.lastInteractionTime).getTime() -
            new Date(b.lastInteractionTime).getTime()
          : a.lastInteractionTime
          ? -1
          : b.lastInteractionTime
          ? 1
          : 0,
    },
    {
      title: "Days Since Last Interaction", // Adjust title if needed
      dataIndex: "daysSinceLastInteraction",
      key: "daysSinceLastInteraction",
      sorter: (a, b) =>
        (a.daysSinceLastInteraction ?? 0) - (b.daysSinceLastInteraction ?? 0),
      render: (days) => days ?? "N/A",
    },
  ];

  return (
    <>
      <Form
        form={form}
        layout="inline"
        onFinish={onFinish}
        initialValues={{ days: 7 }}
        style={{ marginBottom: 16 }}
      >
        <Form.Item
          name="days"
          label="No interaction for (days)" // Updated label
          rules={[
            { required: true, message: "Please input number of days!" },
            {
              type: "number",
              min: 1,
              message: "Days must be a positive number",
            },
          ]}
        >
          <InputNumber min={1} style={{ width: 100 }} />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SearchOutlined />}
            loading={loading}
          >
            Fetch Report
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload("pdf")}
            loading={downloadingPdf}
            disabled={downloadingExcel}
          >
            Download PDF
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleDownload("excel")}
            loading={downloadingExcel}
            disabled={downloadingPdf}
            style={{ background: "#1D6F42", color: "white", border: "none" }}
          >
            Download Excel
          </Button>
        </Form.Item>
      </Form>

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
        <Table<StudentInteractionData>
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </>
  );
};

export default StudentsWithoutInteractionReport;
