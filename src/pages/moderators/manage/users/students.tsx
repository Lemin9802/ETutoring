import React, { useState } from "react";
import { message } from "antd";
import { initialStudentsData, associateTutorsWithStudent } from "@/lib/api/moderator";
import UserList from "@/components/moderator/userList";
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

  return (
    <div>
      <UserList 
        data={studentsData} 
        onAssociateUsers={handleAssociateUsers}
        role="student"
      />
    </div>
  );
};

export default ManageStudentPage;
