import React from "react";
//import StudentList from "../components/manage/studentsList";
import { columns,data } from "../components/managelist/tutorList";
import { Table } from 'antd';


const TutorPage: React.FC = () => {
  return (
    <div>
        <Table columns={columns} dataSource={data} />;
    </div>
  );
};

export default TutorPage;
