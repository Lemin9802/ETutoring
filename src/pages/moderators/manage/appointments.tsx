import React from "react";
//import StudentList from "../components/manage/studentsList";
import {
  columns,
  appointmentsData,
} from "../components/managelist/appointmentList";
import { Table } from "antd";

const ManageStudentPage: React.FC = () => {
  return (
    <div>
      <Table columns={columns} dataSource={appointmentsData} />;
    </div>
  );
};

export default ManageStudentPage;
