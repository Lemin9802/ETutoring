import React, { useEffect, useState } from "react";
import { Card, Button, Typography, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Calendar from "./Calendar";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import AddMeetingModal from "./AddMeetingModal";
import { Meeting } from "./types";
import axios from "axios";
interface MeetingCalendarProps {
  initalMeetings?: Meeting[];
}

const MeetingCalendar: React.FC<MeetingCalendarProps> = ({ initalMeetings }) => {
  const [meetings, setMeetings] = useState<Meeting[]>(initalMeetings ?? []);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);

  useEffect(() => {
    setMeetings(initalMeetings ?? []);
  }, [initalMeetings]);

  const handleAddMeeting = async (newMeeting: Omit<Meeting, "id">) => {
    const meeting = {
      ...newMeeting,
      id: Date.now().toString(), // Simple ID generation for demo purposes
    };

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
    } catch (error) {
      console.error("Error adding meeting:", error);
    }
    // setIsAddModalVisible(false);
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
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)}>
              Add Meeting
            </Button>
          </div>
        }
        bodyStyle={{ padding: "20px" }}
      >
        <Calendar
          meetings={meetings}
          onDateSelect={handleDateSelect}
          disabledDate={(date) => date.isBefore(dayjs().startOf("day"))}
        />
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
