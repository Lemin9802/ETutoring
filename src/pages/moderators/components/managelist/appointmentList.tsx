import React from "react";
import type { TableProps } from "antd";
import { Table } from "antd";

interface AppointmentType {
  key: string;
  tutorName: string;
  studentName: string;
  date: string; // You might want to use a Date object instead of a string for more flexibility
  time: string; // Again, you might want to use a Time object
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

export const appointmentsData: AppointmentType[] = [
  {
    key: "1",
    tutorName: "Tutor A",
    studentName: "Student B",
    date: "2023-04-05",
    time: "10:00",
  },
  {
    key: "2",
    tutorName: "Tutor B",
    studentName: "Student A",
    date: "2023-04-10",
    time: "14:00",
  },
  {
    key: "3",
    tutorName: "Tutor C",
    studentName: "Student D",
    date: "2023-04-15",
    time: "16:00",
  },
  {
    key: "4",
    tutorName: "Tutor E",
    studentName: "Student F",
    date: "2023-04-20",
    time: "18:00",
  },
  {
    key: "5",
    tutorName: "Tutor G",
    studentName: "Student H",
    date: "2023-04-25",
    time: "20:00",
  },
  {
    key: "6",
    tutorName: "Tutor I",
    studentName: "Student J",
    date: "2023-05-01",
    time: "22:00",
  },
  {
    key: "7",
    tutorName: "Tutor K",
    studentName: "Student L",
    date: "2023-05-06",
    time: "00:30",
  },
  // Add more appointments as needed...
];

const Appointments: React.FC = () => {
  return <Table columns={columns} dataSource={appointmentsData} />;
};

export default Appointments;
