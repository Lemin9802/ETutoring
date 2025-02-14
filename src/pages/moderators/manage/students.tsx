import React from "react";
//import StudentList from "../components/manage/studentsList";
import StudentList, { StudentType } from "../components/managelist/studentList";

const studentsData: StudentType[] = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
    tags: ["nice", "developer"],
  },
  {
    key: "2",
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
    tags: ["loser"],
  },
  {
    key: "3",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  }
];

const ManageStudentPage: React.FC = () => {
  return (
    <div>
      <StudentList data={studentsData} />
    </div>
  );
};

export default ManageStudentPage;
