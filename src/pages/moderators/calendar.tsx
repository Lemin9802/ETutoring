import React, { useEffect, useState } from "react";
import { Card, Layout, Typography, Tabs, message } from "antd";
import { MeetingCalendar } from "../../components/Calendars";
import axios from "axios";
import { useSession } from "next-auth/react";

const { Title } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;

const ModeratorCalendarPage: React.FC = () => {
  const [meetings, setMeetings] = useState([]);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchAllMeetings = async () => {
      try {
        const response = await axios.post("/api/meetings/all");

        if (response.status !== 200) {
          message.error("Error fetching meetings. Please try again.");
          return;
        }

        const data = await response.data.data;
        setMeetings(data);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };
    fetchAllMeetings();
  }, []);

  return (
    <Content className="content-container" style={{ padding: "24px" }}>
      <Card className="h-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={3}>Calendar Management</Title>
            <p>Manage all scheduled meetings and events across the platform.</p>
          </div>
        </div>

        <Tabs defaultActiveKey="overview" className="mb-6">
          <TabPane tab="Overview Calendar" key="overview">
            <MeetingCalendar initalMeetings={meetings} currentUserRole={session?.user.roles} />
          </TabPane>
        </Tabs>
      </Card>
    </Content>
  );
};

export default ModeratorCalendarPage;
