import React from "react";
import { Button, Space, Table, Tag } from "antd";
import type { TableProps } from "antd";
import { EditOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";

export interface StudentType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

export const columns: TableProps<StudentType>["columns"] = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <a>{text}</a>,
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
    key: "tags",
    dataIndex: "tags",
    render: (_, { tags }) => (
      <>
        {tags.map((tag) => {
          let color = tag.length > 5 ? "geekblue" : "green";
          if (tag === "loser") {
            color = "volcano";
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: () => (
      <Space size="middle">
        <Button icon={<EyeOutlined />}>View Details</Button>
        <Button type="primary" icon={<EditOutlined />}>Edit</Button>
        <Button danger icon={<DeleteOutlined />}>Delete</Button>
      </Space>
    ),
  },
];

interface StudentListProps {
  data: StudentType[];
}

const StudentList: React.FC<StudentListProps> = ({ data }) => {
  return <Table columns={columns} dataSource={data} />;
};

export default StudentList;
