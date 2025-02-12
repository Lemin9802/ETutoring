import React from "react";
//import StudentList from "../components/manage/studentsList";
import { columns,data } from "../components/managelist/studentList";
import { Table } from 'antd';


const ManageStudentPage: React.FC = () => {
  return (
    <div>
        <Table columns={columns} dataSource={data} />;
    </div>
  );
};

export default ManageStudentPage;
