import React, { useEffect } from "react";
import { Card, Layout, message, Typography } from "antd";
import { Meeting, MeetingCalendar } from "../components/Calendars";
import axios from "axios";
import { useSession } from "next-auth/react";

const { Title } = Typography;
const { Content } = Layout;

const CalendarPage: React.FC = () => {
  const [meeting, setMeeting] = React.useState<Meeting[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await axios.post("/api/meetings/user");

        if (response.status !== 200) {
          message.error("Failed to fetch meetings");
          return;
        }

        const data = await response.data.data;
        setMeeting(data);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    fetchMeetings();
  }, []);

  return (
    <Content className="content-container" style={{ padding: "24px" }}>
      <Card className="h-full">
        <Title level={3}>My Calendar</Title>
        <p className="mb-6">View and manage your scheduled meetings and events.</p>

        <MeetingCalendar initalMeetings={meeting} currentUserRole={session?.user.roles} currentUserEmail={session?.user.email} />
      </Card>
    </Content>
  );
};

export default CalendarPage;
