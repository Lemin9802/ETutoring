import { Button, Card, Col, Row, Typography, Space } from "antd";
// import Title from "antd/es/skeleton/Title";
// import { Metadata } from "next";
import React from "react";
import StatisticalDataCard from "./components/dashboard/statisticalData";
import StatisticalCalendar from "./components/dashboard/calendarData";
import { columns, AppointmentType } from "./components/managelist/appointmentList";
import { Table } from "antd";
import { PlusOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useSession } from "next-auth/react";

// export const metadata: Metadata = {
//   title: "Next.js Chart | TailAdmin - Next.js Dashboard Template",
//   description:
//     "This is Next.js Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
// };

const DashboardPage: React.FC = () => {
  const { data: session } = useSession();
  // In a real application, these would come from an API
  const stats = {
    totalMeetings: 58,
    totalStaff: 12,
    studentCount: 69,
    tutorCount: 24
  };

  const appointmentsData: AppointmentType[] = [
    {
      key: "1",
      tutorName: "Tutor A",
      studentName: "Student B",
      date: "2023-04-05",
      time: "10:00",
    },
    {
      key: "2",
      tutorName: "Tutor B",
      studentName: "Student A",
      date: "2023-04-10",
      time: "14:00",
    },
    {
      key: "3",
      tutorName: "Tutor C",
      studentName: "Student D",
      date: "2023-04-15",
      time: "16:00",
    },
    {
      key: "4",
      tutorName: "Tutor E",
      studentName: "Student F",
      date: "2023-04-20",
      time: "18:00",
    },
    {
      key: "5",
      tutorName: "Tutor G",
      studentName: "Student H",
      date: "2023-04-25",
      time: "20:00",
    }
  ];

  const recentAppointments = appointmentsData.slice(0, 5); // Show only 5 most recent appointments

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <Row className="mb-6">
        <Col span={24}>
          <Typography.Title level={2}>
            Welcome To Moderator Dashboard, {session?.user?.email || "User"}! {/*this is the best i got for now*/}
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
