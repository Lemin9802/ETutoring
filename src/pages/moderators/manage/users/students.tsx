<<<<<<< Updated upstream:src/pages/moderators/manage/students.tsx
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
=======
import React, { useState } from "react";
import { message } from "antd";
import { initialStudentsData, associateTutorsWithStudent, getStudents } from "@/pages/moderators/data/API";
import UserList from "@/pages/moderators/components/managelist/userList";
import { UserListType } from "@/types/Users";

const ManageStudentPage: React.FC = () => {
  const [studentsData, setStudentsData] = useState<UserListType[]>(initialStudentsData);

  const handleAssociateUsers = async (selectedTutorIds: string[], studentId: string) => {
    try {
      await associateTutorsWithStudent(selectedTutorIds, studentId);
      
      // Update the local state to reflect the changes
      setStudentsData(prevData => 
        prevData.map(student => {
          if (student.id === studentId) {
            return student;
          }
          return student;
        })
      );

      message.success('Successfully associated tutors with student');
    } catch (error) {
      message.error('Failed to associate tutors with student');
      console.error('Error associating tutors:', error);
    }
  };

>>>>>>> Stashed changes:src/pages/moderators/manage/users/students.tsx
  return (
    <div>
      <StudentList data={studentsData} />
    </div>
  );
};

export default ManageStudentPage;
