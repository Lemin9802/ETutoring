import React from "react";
//import StudentList from "../components/manage/studentsList";
import Appointments, { AppointmentType } from "../components/managelist/appointmentList";

const appointmentsData: AppointmentType[] = [
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
  }
];

const ManageAppointmentsPage: React.FC = () => {
  return (
    <div>
      <Appointments data={appointmentsData} />
    </div>
  );
};

export default ManageAppointmentsPage;
