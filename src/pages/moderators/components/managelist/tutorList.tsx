import React, { useState, useMemo } from "react";
import { Table, Input, Card, Space, Button, Tag, TableProps } from "antd";
import { EditOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import AssignTutorButton from "@/components/Admin/Users/AssignTutorButton";
import SendEmailButton from "@/components/Admin/Users/SendEmailButton";
import { UserListType } from "@/types/Users";

export interface TutorType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

type TableRowSelection<T extends object = object> =
  TableProps<T>["rowSelection"];
  

const tutorsData: TutorType[] = Array.from({ length: 50 }).map<TutorType>(
  (_, i) => ({
    key: crypto.randomUUID(),
    name: `Tutor ${i}`,
    age: 25 + (i % 10),
    address: `City ${i}`,
    tags: i % 2 === 0 ? ["experienced"] : ["newbie"],
  })
);

const TutorPage: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const selectedUsers = useMemo<UserListType[]>(() => {
    return tutorsData
      .filter((tutor) => selectedRowKeys.includes(tutor.key))
      .map((tutor) => ({
        id: tutor.key, 
        name: tutor.name,
        role: "tutor",
        email: `${tutor.name.toLowerCase().replace(/\s/g, "")}@example.com`,
        address: "test"
      }));
  }, [selectedRowKeys]);

  const allUsers: UserListType[] = useMemo(() => {
    return tutorsData.map((tutor) => ({
      id: tutor.key,  
      name: tutor.name,
      role: "tutor",  
      email: `${tutor.name.toLowerCase().replace(/\s/g, "")}@example.com`, 
      address: tutor.address,  
    }));
  }, [tutorsData]);
  

  const filteredTutors = useMemo(() => {
    return tutorsData.filter(
      (tutor) =>
        tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys.map(String));
  };

  const rowSelection: TableRowSelection<TutorType> = {
    selectedRowKeys,
    onChange: onSelectChange,
    preserveSelectedRowKeys: true,
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (_: unknown, record: { tags: string[] }) => (
        <>
          {record.tags.map((tag) => (
            <Tag color={tag === "experienced" ? "geekblue" : "green"} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          ))}
        </>
      ),      
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Space>
          <Button icon={<EyeOutlined />}>View</Button>
          <Button type="primary" icon={<EditOutlined />}>
            Edit
          </Button>
          <Button danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="shadow-lg mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          ⚡ Bulk Actions
        </h2>
        <Input
          placeholder="Search by name or address..."
          allowClear
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        <Space>
          <AssignTutorButton selectedUsers={selectedUsers} />
          <SendEmailButton selectedUsers={selectedUsers} allUsers={allUsers}/> 
        </Space>
      </Card>
      <Table<TutorType>
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredTutors}
        pagination={{ pageSize: 10 }}
        rowKey="key"
      />
    </div>
  );
};

export default TutorPage;
