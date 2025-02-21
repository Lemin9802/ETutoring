import React from "react";
import { Button, Space, Table, Tag } from "antd";
import type { TableProps } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { MeetingType } from "../../data/API";

interface AppointmentListProps {
  data: MeetingType[];
  onViewMeeting?: (meeting: MeetingType) => void;
  onEditMeeting?: (meeting: MeetingType) => void;
  onDeleteMeeting?: (meetingId: string) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ 
  data,
  onViewMeeting,
  onEditMeeting,
  onDeleteMeeting
}) => {
  const columns: TableProps<MeetingType>["columns"] = [
    {
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Date",
      dataIndex: "scheduled_date",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime(),
    },
    {
      title: "Time",
      dataIndex: "scheduled_time",
      key: "time",
    },
    {
      title: "Duration",
      dataIndex: "duration_minutes",
      key: "duration",
      render: (minutes) => `${minutes} minutes`,
    },
    {
      title: "Mode",
      dataIndex: "mode",
      key: "mode",
      render: (mode) => (
        <Tag color={mode === 'online' ? 'green' : 'blue'}>
          {mode.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = 
          status === 'scheduled' ? 'blue' :
          status === 'completed' ? 'green' : 'red';
        return (
          <Tag color={color}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (location, record) => 
        record.mode === 'online' ? 
          <a href={location} target="_blank" rel="noopener noreferrer">{location}</a> : 
          location,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => onViewMeeting?.(record)}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEditMeeting?.(record)}
            disabled={record.status === 'completed' || record.status === 'cancelled'}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDeleteMeeting?.(record.id)}
            disabled={record.status === 'completed'}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table<MeetingType>
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default AppointmentList;
