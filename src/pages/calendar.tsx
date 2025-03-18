import React from "react";
import { Card, Layout, Typography } from "antd";
import { MeetingCalendar } from "../components/Calendars";
import { useSession } from "next-auth/react";

const { Title } = Typography;
const { Content } = Layout;

const CalendarPage: React.FC = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.roles || "student";

  return (
    <Content className="content-container" style={{ padding: "24px" }}>
      <Card className="h-full">
        <Title level={3}>My Calendar</Title>
        <p className="mb-6">
          View and manage your scheduled meetings and events.
        </p>

        <MeetingCalendar
          userRole={userRole ?? "student"}
          userId={session?.user?.id}
        />
      </Card>
    </Content>
  );
};

export default CalendarPage;
