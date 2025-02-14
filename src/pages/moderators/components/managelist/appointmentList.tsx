import React from "react";
import type { TableProps } from "antd";
import { Table } from "antd";

export interface AppointmentType {
  key: string;
  tutorName: string;
  studentName: string;
  date: string;
  time: string;
}

export const columns: TableProps<AppointmentType>["columns"] = [
  {
    title: "Tutor Name",
    dataIndex: "tutorName",
    key: "tutorName",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Student Name",
    dataIndex: "studentName",
    key: "studentName",
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Time",
    dataIndex: "time",
    key: "time",
  },
];

interface AppointmentsProps {
  data: AppointmentType[];
}

const Appointments: React.FC<AppointmentsProps> = ({ data }) => {
  return <Table columns={columns} dataSource={data} />;
};

export default Appointments;
