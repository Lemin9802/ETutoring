import {
  Button,
  Card,
  Input,
  message,
  Space,
  Table,
  TableColumnsType,
  TableProps,
} from "antd";
import moment from "moment";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, useState } from "react";

export interface AllocationsListType {
  student_id: string;
  student_name: string | null;
  tutor_id: string;
  tutor_name: string | null;
  assigned_by: string | null;
  assigned_by_name: string | null;
  assigned_at: string | null;
}

const AllocationsList = () => {
  const { data: session } = useSession();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allocations, setAllocations] = useState<AllocationsListType[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchAllocations = async (page_number: number, page_size: number) => {
    setLoading(true);
    try {
      const response = await fetch("/api/moderators/users/get-allocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_number, page_size }),
      });
      const result = await response.json();
      if (response.ok) {
        setAllocations(result?.data);
        setTotal(result?.meta.total_items);
        setCurrent(result?.meta.page_number);
        setPageSize(result?.meta.page_size);
      } else {
        console.error("Error fetching allocations:", result.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session) fetchAllocations(1, 5);
  }, [session]);

  const filteredAllocations = useMemo(() => {
    return allocations.filter(
      (allocation) =>
        allocation.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        allocation.tutor_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allocations]);

  const handleRemove = async (tutor_id: string, student_id: string) => {
    try {
      const response = await fetch("/api/moderators/users/remove-allocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_ids: [student_id], tutor_id }),
      });
      const result = await response.json();
      if (result.success) {
        message.success("Removed successfully");
        fetchAllocations(current, pageSize);
      } else {
        message.error("Remove failed");
      }
    } catch (error) {
      console.log("Error: ", error)
      message.error("Network error");
    }
  };

  const handleRemoveSelect = async () => {
    if (!selectedRowKeys.length) {
      message.warning("Please select at least one allocation to remove.");
      return;
    }
    try {
      const allocationsToRemove = allocations.filter((allocation) =>
        selectedRowKeys.includes(allocation.student_id)
      );
      const response = await fetch("/api/moderators/users/remove-allocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allocationsToRemove),
      });
      const result = await response.json();
      if (result.success) {
        message.success("Allocations removed successfully!");
        setSelectedRowKeys([]);
        fetchAllocations(current, pageSize);
      } else {
        message.error("Failed to remove allocations.");
      }
    } catch (error) {
      console.log("Error: ", error)
      message.error("Network error.");
    }
  };

  const rowSelection: TableProps<AllocationsListType>["rowSelection"] = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys.map(String)),
    preserveSelectedRowKeys: true,
  };

  const columns: TableColumnsType<AllocationsListType> = [
    { title: "Student", dataIndex: "student_name" },
    { title: "Tutor", dataIndex: "tutor_name" },
    { title: "Assigned By", dataIndex: "assigned_by_name" },
    {
      title: "Assigned At",
      dataIndex: "assigned_at",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY HH:mm") : "N/A"),
    },
    {
      title: "Action",
      render: (_, record) => (
        <a onClick={() => handleRemove(record.tutor_id, record.student_id)} className="text-red-600">
          Remove
        </a>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="shadow-lg mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ Bulk Actions</h2>
        <Input
          placeholder="Search by student or tutor name..."
          allowClear
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        <Space>
          <Button type="primary" danger onClick={handleRemoveSelect}>
            Remove Selected
          </Button>
        </Space>
      </Card>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredAllocations}
        loading={loading}
        pagination={{
          total,
          current,
          pageSize,
          onChange: (page, size) => fetchAllocations(page, size),
        }}
        rowKey="student_id"
      />
    </div>
  );
};

export default AllocationsList;