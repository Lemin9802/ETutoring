import React from "react";
import { Card, Layout, Typography, Tabs, Button, Select, Space } from "antd";
import { MeetingCalendar } from "../../components/Calendars";
import { FilterOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;

const ModeratorCalendarPage: React.FC = () => {
  return (
    <Content className="content-container" style={{ padding: "24px" }}>
      <Card className="h-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={3}>Calendar Management</Title>
            <p>Manage all scheduled meetings and events across the platform.</p>
          </div>

          <Space>
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              placeholder="Filter by type"
            >
              <Option value="all">All Events</Option>
              <Option value="tutoring">Tutoring Sessions</Option>
              <Option value="meeting">Staff Meetings</Option>
              <Option value="other">Other Events</Option>
            </Select>

            <Button icon={<FilterOutlined />}>More Filters</Button>
          </Space>
        </div>

        <Tabs defaultActiveKey="overview" className="mb-6">
          <TabPane tab="Overview Calendar" key="overview">
            <MeetingCalendar userRole="moderator" />
          </TabPane>
          <TabPane tab="Tutor Schedules" key="tutors">
            <Card title="Tutor Availability" className="shadow-sm">
              <p>View and manage tutor schedules and availability.</p>
            </Card>
          </TabPane>
          <TabPane tab="Student Sessions" key="students">
            <Card title="Student Session Overview" className="shadow-sm">
              <p>Overview of all student sessions and their status.</p>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </Content>
  );
};

export default ModeratorCalendarPage;
