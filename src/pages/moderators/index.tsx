import { Button, Card, Col, Row, Typography, Space } from "antd";
// import Title from "antd/es/skeleton/Title";
// import { Metadata } from "next";
import React, { useEffect, useState } from "react";
import StatisticalDataCard from "./components/dashboard/statisticalData";
import StatisticalCalendar from "./components/dashboard/calendarData";
import { Table } from "antd";
import { PlusOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getStudents, getTutors, getMeetings, MeetingType, getUserNameById } from "@/lib/api/moderator";

// export const metadata: Metadata = {
//   title: "Next.js Chart | TailAdmin - Next.js Dashboard Template",
//   description:
//     "This is Next.js Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
// };

const DashboardPage: React.FC = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalStaff: 0,
    studentCount: 0,
    tutorCount: 0
  });
  const [appointments, setAppointments] = useState<MeetingType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [students, tutors, meetings] = await Promise.all([
          getStudents(),
          getTutors(),
          getMeetings()
        ]);

        setStats({
          totalMeetings: meetings.length,
          totalStaff: students.length + tutors.length,
          studentCount: students.length,
          tutorCount: tutors.length
        });

        setAppointments(meetings);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: 'Tutor',
      dataIndex: 'tutor_id',
      key: 'tutor_id',
      render: (tutor_id: string) => getUserNameById(tutor_id)
    },
    {
      title: 'Student',
      dataIndex: 'student_id',
      key: 'student_id',
      render: (student_id: string) => getUserNameById(student_id)
    },
    {
      title: 'Date',
      dataIndex: 'scheduled_date',
      key: 'scheduled_date',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Time',
      dataIndex: 'scheduled_time',
      key: 'scheduled_time'
    }
  ];

  const recentAppointments = appointments.slice(0, 5);

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <Row className="mb-6">
        <Col span={24}>
          <Typography.Title level={2}>
            Welcome To Moderator Dashboard, {session?.user?.email || "User"}!
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
      <Row gutter={[16, 16]} className="mb-6">
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
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Recent Appointments" extra={<Link href="/moderators/manage/appointments">View All</Link>}>
            <Table 
              columns={columns} 
              dataSource={recentAppointments}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Calendar Overview">
            <div className="flex justify-center">
              <StatisticalCalendar
                width={350}
                title="Appointments"
                customStyle={{ margin: '0 auto' }}
                borderColor="#1890ff"
                onDateChange={(value, mode) => {
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
