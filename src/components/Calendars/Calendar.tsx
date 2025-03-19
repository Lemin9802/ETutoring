import { MailOutlined } from "@ant-design/icons";
import {
  Calendar as AntCalendar,
  Avatar,
  Badge,
  Divider,
  Modal,
  Typography
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import React, { useState } from "react";
import { Meeting } from "./types";

interface CalendarComponentProps {
  meetings?: Meeting[];
  onMeetingClick?: (meeting: Meeting) => void;
  onDateSelect?: (date: Dayjs) => void;
  disabledDate?: (date: Dayjs) => boolean;
}

// Helper to determine the color based on meeting type or time
const getMeetingColor = (meeting: Meeting) => {
  const now = dayjs();
  const meetingStart = dayjs(meeting.startTime);

  // Past meetings
  if (meetingStart.isBefore(now, "day")) {
    return "#8c8c8c"; // Gray for past meetings
  }

  // Today's meetings
  if (meetingStart.isSame(now, "day")) {
    return "#f5222d"; // Red for today's meetings
  }

  // This week's meetings
  if (meetingStart.isBefore(now.add(7, "day"))) {
    return "#fa8c16"; // Orange for this week
  }

  // This month's meetings
  if (meetingStart.isBefore(now.add(1, "month"))) {
    return "#52c41a"; // Green for this month
  }

  // Far future meetings
  return "#1890ff"; // Blue for future meetings
};

// Main Calendar component
const Calendar: React.FC<CalendarComponentProps> = ({
  meetings = [],
  onMeetingClick,
  onDateSelect,
  disabledDate,
}) => {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // Function to get meetings for a specific date
  const getMeetingsForDate = (date: Dayjs) => {
    const dateString = date.format("YYYY-MM-DD");
    return meetings.filter((meeting) => {
      const meetingDate = dayjs(meeting.startTime).format("YYYY-MM-DD");
      return meetingDate === dateString;
    });
  };

  // Cell renderer for dates with meetings
  const dateCellRender = (value: Dayjs) => {
    const dateMeetings = getMeetingsForDate(value);

    return (
      <div className="meeting-cell">
        {dateMeetings.length > 0 && (
          <div className="meeting-indicators">
            {dateMeetings.map((meeting) => (
              <Badge
                key={meeting.id}
                color={getMeetingColor(meeting)}
                text={meeting.title}
                className="meeting-badge"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMeeting(meeting);
                  if (onMeetingClick) onMeetingClick(meeting);
                }}
                style={{
                  cursor: "pointer",
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: "2px",
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Handler for date selection
  const handleSelect = (date: Dayjs) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Format meeting time for display
  const formatMeetingTime = (start: string, end: string) => {
    const startTime = dayjs(start);
    const endTime = dayjs(end);

    return `${startTime.format("MMM DD, YYYY HH:mm")} - ${endTime.format(
      "HH:mm"
    )}`;
  };

  return (
    <div className="calendar-container">
      <AntCalendar
        dateCellRender={dateCellRender}
        onSelect={handleSelect}
        disabledDate={disabledDate}
      />

      {/* Meeting Details Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <Badge
              color={
                selectedMeeting ? getMeetingColor(selectedMeeting) : "#1890ff"
              }
            />
            <span style={{ marginLeft: "8px" }}>
              {selectedMeeting?.title || "Meeting Details"}
            </span>
          </div>
        }
        open={!!selectedMeeting}
        onCancel={() => setSelectedMeeting(null)}
        footer={null}
        width={600}
      >
        {selectedMeeting && (
          <div className="meeting-details">
            <Typography.Paragraph>
              <strong>Time:</strong>{" "}
              {formatMeetingTime(
                selectedMeeting.startTime,
                selectedMeeting.endTime
              )}
            </Typography.Paragraph>

            {selectedMeeting.location && (
              <Typography.Paragraph>
                <strong>Location:</strong> {selectedMeeting.location}
              </Typography.Paragraph>
            )}

            <Typography.Paragraph>
              <strong>Description:</strong>
            </Typography.Paragraph>

            <Typography.Paragraph style={{ whiteSpace: "pre-line" }}>
              {selectedMeeting.description}
            </Typography.Paragraph>

            <Divider orientation="left">Attendees</Divider>

            <div className="attendees-list">
              {selectedMeeting.attendees.map((attendee, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <Avatar src={attendee.avatar}>
                    {attendee.name.charAt(0)}
                  </Avatar>
                  <div style={{ marginLeft: "12px" }}>
                    <div>{attendee.name}</div>
                    <div>
                      <MailOutlined style={{ marginRight: "4px" }} />
                      <Typography.Text type="secondary">
                        {attendee.email}
                      </Typography.Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Calendar;
