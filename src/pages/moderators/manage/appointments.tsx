import React, { useState, useEffect } from "react";
//import StudentList from "../components/manage/studentsList";
import AppointmentList from "@/components/moderator/appointmentList";
import { getMeetings, MeetingType, deleteMeeting } from "@/lib/api/moderator";
import { message } from "antd";

const ManageAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<MeetingType[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const meetings = await getMeetings();
        setAppointments(meetings);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        message.error("Failed to load appointments");
      }
    };

    fetchAppointments();
  }, []);

  const handleViewMeeting = (meeting: MeetingType) => {
    // Implement view logic
    console.log("Viewing meeting:", meeting);
  };

  const handleEditMeeting = (meeting: MeetingType) => {
    // Implement edit logic
    console.log("Editing meeting:", meeting);
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      await deleteMeeting(meetingId);
      setAppointments(prev => prev.filter(meeting => meeting.id !== meetingId));
      message.success("Meeting deleted successfully");
    } catch (error) {
      console.error("Error deleting meeting:", error);
      message.error("Failed to delete meeting");
    }
  };

  return (
    <div>
      <AppointmentList 
        data={appointments}
        onViewMeeting={handleViewMeeting}
        onEditMeeting={handleEditMeeting}
        onDeleteMeeting={handleDeleteMeeting}
      />
    </div>
  );
};

export default ManageAppointmentsPage;
