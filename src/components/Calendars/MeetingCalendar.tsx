import React, { useState, useEffect } from "react";
import { Card, Button, Typography, Empty, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Calendar from "./Calendar";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import AddMeetingModal from "./AddMeetingModal";
import { Meeting } from "./types";

// Sample data - in a real app this would come from an API
const SAMPLE_MEETINGS: Meeting[] = [
  {
    id: "1",
    title: "Mathematics Tutoring Session",
    description: "Algebra and calculus concepts review session.",
    startTime: dayjs().add(1, "day").hour(10).minute(0).second(0).toISOString(),
    endTime: dayjs().add(1, "day").hour(11).minute(30).second(0).toISOString(),
    attendees: [
      { name: "Jane Smith", email: "jane.smith@example.com" },
      { name: "John Doe", email: "john.doe@example.com" },
    ],
    location: "Online - Zoom",
  },
  {
    id: "2",
    title: "Physics Lab Discussion",
    description:
      "Review of last week's physics lab results and preparation for the next experiment.",
    startTime: dayjs().add(2, "day").hour(14).minute(0).second(0).toISOString(),
    endTime: dayjs().add(2, "day").hour(15).minute(30).second(0).toISOString(),
    attendees: [
      { name: "Alex Johnson", email: "alex.j@example.com" },
      { name: "Sarah Williams", email: "sarah.w@example.com" },
      { name: "Michael Brown", email: "michael.b@example.com" },
    ],
    location: "Science Building, Room 105",
  },
  {
    id: "3",
    title: "Student Progress Review",
    description: "Monthly review of student progress and academic performance.",
    startTime: dayjs().add(5, "day").hour(9).minute(0).second(0).toISOString(),
    endTime: dayjs().add(5, "day").hour(10).minute(0).second(0).toISOString(),
    attendees: [
      { name: "Emma Wilson", email: "emma.w@example.com" },
      { name: "David Miller", email: "david.m@example.com" },
    ],
  },
];

interface MeetingCalendarProps {
  userId?: string;
  userRole: string;
}

const MeetingCalendar: React.FC<MeetingCalendarProps> = ({
  // userId,
  // userRole = "student",
}) => {
  const [meetings, setMeetings] = useState<Meeting[]>(SAMPLE_MEETINGS);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);

  // In a real application, you would fetch meetings from an API
  useEffect(() => {
    // Simulating API call
    setLoading(true);
    setTimeout(() => {
      setMeetings(SAMPLE_MEETINGS);
      setLoading(false);
    }, 500);
  }, []);

  // Function to handle adding a new meeting
  const handleAddMeeting = (newMeeting: Omit<Meeting, "id">) => {
    // Validate that meeting is not in the past
    const now = dayjs();
    const meetingStart = dayjs(newMeeting.startTime);

    if (meetingStart.isBefore(now)) {
      // You might want to show a notification or alert here in a real application
      console.error("Cannot create meetings in the past");
      return;
    }

    const meeting: Meeting = {
      ...newMeeting,
      id: Date.now().toString(), // Simple ID generation for demo purposes
    };

    setMeetings([...meetings, meeting]);
    setIsAddModalVisible(false);
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
    setIsAddModalVisible(true);
  };

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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
            >
              Add Meeting
            </Button>
          </div>
        }
        bodyStyle={{ padding: "20px" }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "40px",
            }}
          >
            <Spin size="large" />
          </div>
        ) : meetings.length === 0 ? (
          <Empty description="No meetings scheduled" />
        ) : (
          <Calendar
            meetings={meetings}
            onDateSelect={handleDateSelect}
            disabledDate={(date) => date.isBefore(dayjs().startOf("day"))}
          />
        )}
      </Card>

      <AddMeetingModal
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onAdd={handleAddMeeting}
        initialDate={selectedDate}
      />
    </div>
  );
};

export default MeetingCalendar;
