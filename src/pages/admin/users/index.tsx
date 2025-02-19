import React, { useState, useMemo } from "react";
import {
  Table,
  type TableColumnsType,
  type TableProps,
  Card,
  Space,
  Input,
} from "antd";
import Link from "next/link";
import AssignTutorButton from "@/components/Admin/Users/AssignTutorButton";
import ScheduleMeetingButton from "@/components/Admin/Users/ScheduleMeetingButton";
import SendEmailButton from "@/components/Admin/Users/SendEmailButton";
import { UserListType } from "@/types/Users";

type TableRowSelection<T extends object = object> =
  TableProps<T>["rowSelection"];

// ✅ Generate UUID for each user
const dataSource: UserListType[] = Array.from({ length: 50 }).map<UserListType>(
  (_, i) => ({
    id: crypto.randomUUID(), // ✅ Ensure ID is a unique UUID
    name: `User ${i}`,
    role: i % 3 === 0 ? "tutor" : i % 2 === 0 ? "student" : "moderator",
    email: `user${i}@example.com`,
    address: `London, Park Lane no. ${i}`,
  })
);

const AdminUserListPage = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]); // ✅ Store as UUID `string[]`
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ✅ Ensure selected users are correctly mapped from UUIDs
  const selectedUsers = useMemo(() => {
    return dataSource.filter((user) => selectedRowKeys.includes(user.id));
  }, [selectedRowKeys]);

  console.log("✅ Selected Users (UUIDs):", selectedUsers);

  // ✅ Search only filters displayed data, not selected users
  const filteredUsers = useMemo(() => {
    return dataSource.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // ✅ Convert `selectedRowKeys` to `UUID` when updating
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    const updatedKeys = newSelectedRowKeys.map(String); // ✅ Convert to `UUID` (string[])
    console.log("🔹 Selected Row Keys (UUIDs):", updatedKeys);
    setSelectedRowKeys(updatedKeys);
  };

  // ✅ Custom `rowSelection` to persist selections across pages
  const rowSelection: TableRowSelection<UserListType> = {
    selectedRowKeys,
    onChange: onSelectChange,
    preserveSelectedRowKeys: true, // ✅ Keeps selections across pagination
  };

  // ✅ Define table columns
  const columns: TableColumnsType<UserListType> = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Role",
      dataIndex: "role",
      filters: [
        { text: "Students", value: "student" },
        { text: "Tutors", value: "tutor" },
        { text: "Moderators", value: "moderator" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Address",
      dataIndex: "address",
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      render: (_text, record) => (
        <Link href={`/admin/users/${record.id}`}>Details</Link>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="shadow-lg mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          ⚡ Bulk Actions
        </h2>

        {/* Search Input for Filtering */}
        <Input
          placeholder="Search by name or email..."
          allowClear
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />

        {/* ✅ Pass Correct `selectedUsers` */}
        <Space>
          <AssignTutorButton selectedUsers={selectedUsers} />
          <SendEmailButton
            selectedUsers={selectedUsers}
            allUsers={dataSource}
          />
          <ScheduleMeetingButton selectedUsers={selectedUsers} />
        </Space>
      </Card>

      <Table<UserListType>
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredUsers}
        pagination={{ pageSize: 10 }}
        rowKey="id" // ✅ Tell Table to use `id` (UUID) as key
      />
    </div>
  );
};

export default AdminUserListPage;
