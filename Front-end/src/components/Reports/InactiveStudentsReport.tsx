import React, { useState, useEffect } from "react";
import { Table, Button, Spin, Alert, message, InputNumber, Form } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";

interface InactiveStudentData {
  id: string;
  fullName: string;
  email: string;
  lastLoginTime?: string | null;
  daysInactive: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
}

// Interface for the raw data structure from the API (snake_case)
interface RawInactiveStudentData {
  id: string;
  full_name: string | null;
  email: string;
  last_login_time: string | null;
  days_inactive: number;
}

const InactiveStudentsReport: React.FC = () => {
  const [data, setData] = useState<InactiveStudentData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [downloadingExcel, setDownloadingExcel] = useState<boolean>(false);
  const [days, setDays] = useState<number>(7);
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
      const response = await fetch("/api/reports/inactive-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ days: currentDays }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch inactive students data"
        );
      }
      // The API response uses snake_case (days_inactive), need to map to camelCase (daysInactive)
      const result: ApiResponse<RawInactiveStudentData[]> =
        await response.json();
      if (result.success && result.data) {
        const mappedData: InactiveStudentData[] = result.data.map((item) => ({
          id: item.id,
          fullName: item.full_name || "", // Handle potential null/empty full_name
          email: item.email,
          lastLoginTime: item.last_login_time,
          daysInactive: item.days_inactive, // Map days_inactive to daysInactive
        }));
        setData(mappedData);
        if (mappedData.length === 0) {
          message.info("No inactive students found for the specified period.");
        }
      } else {
        throw new Error(
          result.message || "Failed to fetch inactive students data"
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
    const url = `/api/reports/inactive-students-${format}`;
    const filename = `InactiveStudentsReport_${days}days.${
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

  const columns: TableProps<InactiveStudentData>["columns"] = [
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
      title: "Last Login Time",
      dataIndex: "lastLoginTime",
      key: "lastLoginTime",
      render: (date) => (date ? new Date(date).toLocaleString() : "Never"),
      sorter: (a, b) =>
        a.lastLoginTime && b.lastLoginTime
          ? new Date(a.lastLoginTime).getTime() -
            new Date(b.lastLoginTime).getTime()
          : a.lastLoginTime
          ? -1
          : b.lastLoginTime
          ? 1
          : 0,
    },
    {
      title: "Days Inactive",
      dataIndex: "daysInactive",
      key: "daysInactive",
      sorter: (a, b) => (a.daysInactive ?? 0) - (b.daysInactive ?? 0),
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
          label="Inactive for (days)"
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
        <Table<InactiveStudentData>
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </>
  );
};

export default InactiveStudentsReport;
