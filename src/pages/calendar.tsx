import React from "react";
import { Card, Layout, Typography } from "antd";
import { MeetingCalendar } from "../components/Calendars";

const { Title } = Typography;
const { Content } = Layout;

const CalendarPage: React.FC = () => {
  return (
    <Content className="content-container" style={{ padding: "24px" }}>
      <Card className="h-full">
        <Title level={3}>My Calendar</Title>
        <p className="mb-6">View and manage your scheduled meetings and events.</p>

        <MeetingCalendar />
      </Card>
    </Content>
  );
};

export default CalendarPage;
