<<<<<<< Updated upstream:src/pages/moderators/manage/tutor.tsx
import React from "react";
import TutorList, { TutorType } from "../components/managelist/tutorList";

const tutorsData: TutorType[] = [
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
  },
  {
    key: "4",
    name: "New Guy",
    age: 25,
    address: "Some Address",
    tags: ["new tag"],
  }
];

const TutorPage: React.FC = () => {
=======
import React, { useState } from "react";
import UserList from "@/pages/moderators/components/managelist/userList";
import { message } from "antd";
import { initialTutorsData, associateStudentsWithTutor, getTutors } from "@/pages/moderators/data/API";
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

>>>>>>> Stashed changes:src/pages/moderators/manage/users/tutor.tsx
  return (
    <div>
      <TutorList data={tutorsData} />
    </div>
  );
};

export default TutorPage;
