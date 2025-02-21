import React from "react";
import TutorList from "../components/managelist/tutorList";
// import TutorList, { TutorType } from "../components/managelist/tutorList";

// const tutorsData: TutorType[] = [
//   {
//     key: "1",
//     name: "John Brown",
//     age: 32,
//     address: "New York No. 1 Lake Park",
//     tags: ["nice", "developer"],
//   },
//   {
//     key: "2",
//     name: "Jim Green",
//     age: 42,
//     address: "London No. 1 Lake Park",
//     tags: ["loser"],
//   },
//   {
//     key: "3",
//     name: "Joe Black",
//     age: 32,
//     address: "Sydney No. 1 Lake Park",
//     tags: ["cool", "teacher"],
//   },
//   {
//     key: "4",
//     name: "New Guy",
//     age: 25,
//     address: "Some Address",
//     tags: ["new tag"],
//   }
// ];

const TutorPage: React.FC = () => {
  return (
    <div>
      <TutorList />
    </div>
  );
};

export default TutorPage;
