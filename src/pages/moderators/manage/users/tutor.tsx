import React, { useState } from "react";
import UserList from "@/components/moderator/userList";
import { message } from "antd";
import { initialTutorsData, associateStudentsWithTutor } from "@/lib/api/moderator";
import { UserListType } from "@/types/Users";

const TutorPage: React.FC = () => {
  const [tutorsData, setTutorsData] = useState<UserListType[]>(initialTutorsData);

  const handleAssociateUsers = async (selectedStudentIds: string[], tutorId: string) => {
    try {
      await associateStudentsWithTutor(selectedStudentIds, tutorId);
      
      // Update the local state to reflect the changes
      setTutorsData(prevData => 
        prevData.map(tutor => {
          if (tutor.id === tutorId) {
            return tutor;
          }
          return tutor;
        })
      );

      message.success('Successfully associated students with tutor');
    } catch (error) {
      message.error('Failed to associate students with tutor');
      console.error('Error associating students:', error);
    }
  };

  return (
    <div>
      <UserList 
        data={tutorsData} 
        onAssociateUsers={handleAssociateUsers}
        role="tutor"
      />
    </div>
  );
};

export default TutorPage;
