import React, { useEffect, useState } from "react";
import { Card, Button, Typography, message } from "antd";
import { PlusOutlined, ClockCircleOutlined } from "@ant-design/icons";
import Calendar from "./Calendar";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import AddMeetingModal from "./AddMeetingModal";
import RequestMeetingModal from "./RequestMeetingModal";
import PendingMeetingsModal from "./PendingMeetingsModal";
import { Meeting } from "./types";
import axios from "axios";

interface MeetingCalendarProps {
  initalMeetings?: Meeting[];
  currentUserRole: string | undefined;
  currentUserEmail?: string;
}

const MeetingCalendar: React.FC<MeetingCalendarProps> = ({
  initalMeetings,
  currentUserRole,
  currentUserEmail,
}) => {
  const [meetings, setMeetings] = useState<Meeting[]>(initalMeetings ?? []);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [isRequestMeetingModalVisible, setIsRequestMeetingModalVisible] = useState<boolean>(false);
  const [isPendingMeetingsModalVisible, setIsPendingMeetingsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    setMeetings(initalMeetings ?? []);
  }, [initalMeetings]);

  if (!currentUserRole) {
    return null;
  }

  const handleAddMeeting = async (newMeeting: Omit<Meeting, "id">) => {
    const meeting = {
      ...newMeeting,
      id: Date.now().toString(), // Simple ID generation for demo purposes
    };

    if (currentUserRole === "Student") {
      // Add user email to participants
      meeting.participants = [
        ...meeting.participants,
        {
          email: currentUserEmail ?? "",
          full_name: "Student", // Doens't matter
        },
      ];
    }

    const bodyData = {
      meeting: {
        title: meeting.title,
        description: meeting.description,
        start_time: meeting.start_time,
        end_time: meeting.end_time,
        participants: meeting.participants.map((attendee) => attendee),
      },
    };

    try {
      const response = await axios.post(`/api/meetings/create`, bodyData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        message.error("Error creating meeting. Please try again.");
        return;
      }

      message.success("Meeting created successfully!");
      setMeetings([...meetings, meeting]);
      setIsAddModalVisible(false);
      setIsRequestMeetingModalVisible(false);
    } catch (error) {
      console.error("Error adding meeting:", error);
      message.error("Failed to create meeting. Please try again.");
    }
  };

  // Function to handle meeting status changes
  const handleMeetingStatusChange = async (meetingId: string, newStatus: number) => {
    try {
      const response = await axios.post(`/api/meetings/change-status`, {
        meeting_id: meetingId,
        status: newStatus,
      });

      if (response.status !== 200) {
        message.error("Error updating meeting status. Please try again.");
        return false;
      }

      // Update the meeting status in the local state
      const updatedMeetings = meetings.map((meeting) => {
        if (meeting.id === meetingId) {
          return { ...meeting, status: newStatus };
        }
        return meeting;
      });

      setMeetings(updatedMeetings);
      message.success(`Meeting ${newStatus === 1 ? "approved" : "rejected"} successfully!`);
      return true;
    } catch (error) {
      console.error("Error updating meeting status:", error);
      message.error("Failed to update meeting status. Please try again.");
      return false;
    }
  };

  // Function to handle date selection
  const handleDateSelect = (date: Dayjs) => {
    // Prevent selecting dates in the past
    const now = dayjs().startOf("day");
    if (date.isBefore(now)) {
      console.error("Cannot create meetings in the past");
      return;
    }

    setSelectedDate(date);
    if (currentUserRole === "student") {
      setIsRequestMeetingModalVisible(true);
    } else {
      setIsAddModalVisible(true);
    }
  };

  const isTeacher = currentUserRole === "Tutor";

  return (
    <div className="meeting-calendar-container">
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography.Title level={4} style={{ margin: 0 }}>
              Meeting Calendar
            </Typography.Title>
            <div>
              {isTeacher && (
                <Button
                  type="default"
                  icon={<ClockCircleOutlined />}
                  onClick={() => setIsPendingMeetingsModalVisible(true)}
                  style={{ marginRight: 8 }}
                >
                  Pending Requests
                </Button>
              )}

              {(currentUserRole === "Admin" || currentUserRole === "Moderator") && (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)}>
                  Add Meeting
                </Button>
              )}

              {currentUserRole === "Student" && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsRequestMeetingModalVisible(true)}
                >
                  Request Meeting
                </Button>
              )}
            </div>
          </div>
        }
      >
        <Calendar
          meetings={meetings}
          onDateSelect={handleDateSelect}
          disabledDate={(date) => date.isBefore(dayjs().startOf("day"))}
        />
      </Card>

      {/* Admin/Moderator Meeting Modal */}
      {(currentUserRole === "Admin" || currentUserRole === "Moderator" || currentUserRole === "Tutor") && (
        <AddMeetingModal
          visible={isAddModalVisible}
          onCancel={() => setIsAddModalVisible(false)}
          onAdd={handleAddMeeting}
          initialDate={selectedDate}
        />
      )}

      {/* Student Meeting Request Modal */}
      {currentUserRole === "Student" && (
        <RequestMeetingModal
          visible={isRequestMeetingModalVisible}
          onCancel={() => setIsRequestMeetingModalVisible(false)}
          onAdd={handleAddMeeting}
          initialDate={selectedDate}
        />
      )}

      {/* Teacher Pending Meetings Modal */}
      {isTeacher && (
        <PendingMeetingsModal
          visible={isPendingMeetingsModalVisible}
          onCancel={() => setIsPendingMeetingsModalVisible(false)}
          onStatusChange={handleMeetingStatusChange}
          teacherEmail={currentUserEmail}
          meetings={meetings}
        />
      )}
    </div>
  );
};

export default MeetingCalendar;
