import { Button, Card, Col, Row, Typography, Space } from "antd";
// import Title from "antd/es/skeleton/Title";
// import { Metadata } from "next";
import React from "react";
import StatisticalDataCard from "./components/dashboard/statisticalData";
import StatisticalCalendar from "./components/dashboard/calendarData";
import { columns, appointmentsData } from "./components/managelist/appointmentList";
import { Table } from "antd";
import { PlusOutlined, UserOutlined, CalendarOutlined, TeamOutlined } from "@ant-design/icons";
import Link from "next/link";

// export const metadata: Metadata = {
//   title: "Next.js Chart | TailAdmin - Next.js Dashboard Template",
//   description:
//     "This is Next.js Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
// };

const DashboardPage: React.FC = () => {
  // In a real application, these would come from an API
  const stats = {
    totalMeetings: 58,
    totalStaff: 12,
    studentCount: 156,
    tutorCount: 24
  };

  const recentAppointments = appointmentsData.slice(0, 5); // Show only 5 most recent appointments

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <Row className="mb-6">
        <Col span={24}>
          <Typography.Title level={2}>
            Welcome To Moderator Dashboard, Hoang Truong!
          </Typography.Title>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-6">
        <Col span={24}>
          <Card title="Quick Actions" className="mb-6">
            <Space>
              <Button type="primary" icon={<PlusOutlined />}>
                New Appointment
              </Button>
              <Button icon={<UserOutlined />}>Add Student</Button>
              <Button icon={<TeamOutlined />}>Add Tutor</Button>
              <Button icon={<CalendarOutlined />}>View Schedule</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <StatisticalDataCard 
          bgColor="bg-blue-600" 
          cardTitle="Total Meeting" 
          value={stats.totalMeetings}
        />
        <StatisticalDataCard 
          bgColor="bg-green-600" 
          cardTitle="Total Staff" 
          value={stats.totalStaff}
        />
        <StatisticalDataCard 
          bgColor="bg-red-600" 
          cardTitle="Student Number" 
          value={stats.studentCount}
        />
        <StatisticalDataCard 
          bgColor="bg-yellow-500" 
          cardTitle="Tutor Number" 
          value={stats.tutorCount}
        />
      </Row>

      {/* Recent Appointments and Calendar */}
      <Row gutter={16}>
        <Col span={16}>
          <Card title="Recent Appointments" extra={<Link href="/moderators/manage/appointments">View All</Link>}>
            <Table 
              columns={columns} 
              dataSource={recentAppointments}
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Calendar Overview">
            <div className="flex justify-center">
              <StatisticalCalendar
                width={350}
                title="Appointments"
                customStyle={{ margin: '0 auto' }}
                borderColor="#1890ff"
                onDateChange={(value, mode) => {
                  // Handle date changes here
                  console.log('Selected date:', value.format('YYYY-MM-DD'), 'Mode:', mode);
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
