// import AssignTutorButton from "@/components/Admin/Users/AssignTutorButton";
// import ScheduleMeetingButton from "@/components/Admin/Users/ScheduleMeetingButton";
// import SendEmailButton from "@/components/Admin/Users/SendEmailButton";
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
import React, { useEffect, useState } from "react";
export type UserRole = "student" | "tutor" | "moderator";
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page_number, page_size }),
      });

      const result = await response.json();
      if (response.ok) {
        setAllocations(result?.data);
        // Sử dụng thông tin phân trang từ meta
        setTotal(result?.meta.total_items);
        setCurrent(result?.meta.page_number);
        setPageSize(result?.meta.page_size);
      } else {
        console.error("Error fetching users:", result.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!session) return;
    fetchAllocations(1, 5);
  }, [session]);

  //   const selectedUsers = useMemo(() => {
  //     return allocations.filter((allocation) =>
  //       selectedRowKeys.includes(allocation.student_id)
  //     );
  //   }, [selectedRowKeys, allocations]);

  //   const filteredUsers = useMemo(() => {
  //     return users.filter(
  //       (user) =>
  //         user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //   }, [searchQuery, users]);

  const handleRemove = async (tutor_id: string, student_id: string) => {
    console.log("search query: ", searchQuery);
    try {
      const body = {
        student_ids: [student_id],
        tutor_id: tutor_id,
      };
      const response = await fetch("/api/moderators/users/remove-allocation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (result.success == true) {
        message.success("Remove allocation succesfully");
        await fetchAllocations(current, pageSize);
      } else {
        console.error("Error fetching users:", result.errors);
        message.error("Remove allocation error");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys.map(String));
  };

  const rowSelection: TableProps<AllocationsListType>["rowSelection"] = {
    selectedRowKeys,
    onChange: onSelectChange,
    preserveSelectedRowKeys: true,
  };

  const columns: TableColumnsType<AllocationsListType> = [
    {
      title: "Student",
      dataIndex: "student_name",
      render: (text) => text || "N/A",
    },
    {
      title: "Tutor",
      dataIndex: "tutor_name",
    },
    {
      title: "Assign By",
      dataIndex: "assigned_by_name",
    },
    {
      title: "Assign At",
      dataIndex: "assigned_at",
      render: (date) =>
        date ? moment(date).format("DD/MM/YYYY HH:mm") : "N/A",
    },
    {
      title: "Action",
      render: (_text, record) => (
        <a
          onClick={() => handleRemove(record.tutor_id, record.student_id)}
          className="text-red-600"
        >
          Remove
        </a>
      ),
    },
  ];

  const handleRemoveSelect = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one allocation to remove.");
      return;
    }

    // Lọc danh sách allocations dựa trên các selectedRowKeys
    try {
      const allocationsToRemove = allocations
        .filter((allocation) => selectedRowKeys.includes(allocation.student_id))
        .map((allocation) => ({
          student_id: allocation.student_id,
          tutor_id: allocation.tutor_id,
        }));

      const response = await fetch("/api/moderators/users/remove-allocations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(allocationsToRemove), // Gửi trực tiếp mảng JSON
      });

      const result = await response.json();
      if (result.success) {
        message.success("Allocations removed successfully!");
        setSelectedRowKeys([]); // Xóa selection sau khi xóa thành công
        await fetchAllocations(current, pageSize); // Cập nhật danh sách
      } else {
        console.error("Error removing allocations:", result.errors);
        message.error(result.message || "Failed to remove allocations.");
      }
    } catch (error) {
      console.error("Network error:", error);
      message.error("Network error. Please try again.");
    }
  };

  // const handleViewDetails = async (userId: string) => {
  //   try {
  //     const response = await fetch("/api/moderators/users/profile", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ id: userId }),
  //     });

  //     const result = await response.json();

  //     if (response.ok) {
  //       setUserDetails(result);
  //       setIsModalVisible(true);
  //     } else {
  //       console.error("Error fetching user details:", result.error);
  //     }
  //   } catch (error) {
  //     console.error("Network error:", error);
  //   }
  // };

  //   const handleModalCancel = () => {
  //     setIsModalVisible(false);
  //   };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrent(page);
    setPageSize(pageSize);
    fetchAllocations(page, pageSize);
  };
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="shadow-lg mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          ⚡ Bulk Actions
        </h2>
        <Input
          placeholder="Search users..."
          allowClear
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        {/* <Space>
          <AssignTutorButton selectedUsers={selectedUsers} />
          <SendEmailButton
            selectedUsers={selectedUsers}
            allUsers={allocations}
          />
          <ScheduleMeetingButton selectedUsers={selectedUsers} />
        </Space> */}
        <Space>
          <Button type="primary" danger onClick={() => handleRemoveSelect()}>
            Remove Selected
          </Button>
        </Space>
      </Card>
      {/* <Table rowSelection={rowSelection} columns={columns} dataSource={filteredUsers} loading={loading} pagination={{ */}
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={allocations}
        loading={loading}
        pagination={{
          total: total,
          current: current,
          pageSize: pageSize,
          onChange: handlePaginationChange,
        }}
        rowKey="student_id"
      />
    </div>
  );
};

export default AllocationsList;
