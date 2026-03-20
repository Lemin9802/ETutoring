import { Button, Card, Col, Row, Typography, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import StatisticalDataCard from "./components/dashboard/statisticalData";
import StatisticalCalendar from "./components/dashboard/calendarData";
import { PlusOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getMeetings, MeetingType, getUserNameById } from "@/lib/api/moderator";

interface DashboardStats {
  totalMeetings: { value: number; trend: number };
  totalStaff: { value: number; trend: number };
  studentCount: { value: number; trend: number };
  tutorCount: { value: number; trend: number };
  meetingCompletionRate: { value: number; trend: number };
}

const DashboardPage: React.FC = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalMeetings: { value: 0, trend: 0 },
    totalStaff: { value: 0, trend: 0 },
    studentCount: { value: 0, trend: 0 },
    tutorCount: { value: 0, trend: 0 },
    meetingCompletionRate: { value: 0, trend: 0 },
  });
  const [appointments, setAppointments] = useState<MeetingType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách meetings (vẫn dùng API của moderator)
        const meetings = await getMeetings();

        // Tính số meetings đã hoàn thành
        const completedMeetings = meetings.filter(
          (meeting) => meeting.status === "completed"
        ).length;

        // Gọi API dashboard để lấy số liệu total_students và total_tutors
        const dashboardResponse = await fetch("/api/dashboard/get-statictis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (!dashboardResponse.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }

        // Sử dụng các key từ response dạng snake_case
        const dashboardData = await dashboardResponse.json();
        // dashboardData: { total_students: number, total_tutors: number }

        // Tính toán trend (giả lập dựa trên dữ liệu cũ)
        const calculateTrend = (current: number, previous: number) => {
          if (previous === 0) return 0;
          return Math.round(((current - previous) / previous) * 100);
        };

        // Giả lập giá trị cũ (có thể thay thế bằng API sau này)
        const previousStats = {
          meetings: Math.floor(meetings.length * 0.9),
          staff: Math.floor((dashboardData.total_students + dashboardData.total_tutors) * 1.1),
          students: Math.floor(dashboardData.total_students * 0.95),
          tutors: Math.floor(dashboardData.total_tutors * 1.02),
          completion: meetings.length
            ? Math.floor((completedMeetings / meetings.length) * 90)
            : 0,
        };

        setStats({
          totalMeetings: {
            value: meetings.length,
            trend: calculateTrend(meetings.length, previousStats.meetings),
          },
          totalStaff: {
            value: dashboardData.total_students + dashboardData.total_tutors,
            trend: calculateTrend(
              dashboardData.total_students + dashboardData.total_tutors,
              previousStats.staff
            ),
          },
          studentCount: {
            value: dashboardData.total_students,
            trend: calculateTrend(dashboardData.total_students, previousStats.students),
          },
          tutorCount: {
            value: dashboardData.total_tutors,
            trend: calculateTrend(dashboardData.total_tutors, previousStats.tutors),
          },
          meetingCompletionRate: {
            value: meetings.length
              ? (completedMeetings / meetings.length) * 100
              : 0,
            trend: calculateTrend(
              meetings.length ? (completedMeetings / meetings.length) * 100 : 0,
              previousStats.completion
            ),
          },
        });

        setAppointments(meetings);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  const columns: ColumnsType<MeetingType> = [
    {
      title: "Tutor",
      dataIndex: "tutor_id",
      key: "tutor_id",
      render: (tutor_id: string) => getUserNameById(tutor_id),
    },
    {
      title: "Student",
      dataIndex: "student_id",
      key: "student_id",
      render: (student_id: string) => getUserNameById(student_id),
    },
    {
      title: "Date",
      dataIndex: "scheduled_date",
      key: "scheduled_date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Time",
      dataIndex: "scheduled_time",
      key: "scheduled_time",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "completed"
              ? "success"
              : status === "pending"
              ? "processing"
              : "default"
          }
        >
          {status?.toUpperCase()}
        </Tag>
      ),
    },
  ];

  const recentAppointments = appointments.slice(0, 5);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Welcome Section */}
      <Row className="mb-6">
        <Col span={24}>
          <Typography.Title level={2} className="flex items-center gap-2">
            <UserOutlined className="text-blue-500" />
            Welcome To Moderator Dashboard, {session?.user?.email || "User"}!
          </Typography.Title>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-6">
        <Col span={24}>
          <Card
            title="Quick Actions"
            className="shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <Space wrap>
              <Link href="/moderators/manage/appointments/new">
                <Button type="primary" icon={<PlusOutlined />} size="large">
                  New Appointment
                </Button>
              </Link>
              <Link href="/moderators/manage/users?type=student">
                <Button icon={<UserOutlined />} size="large">
                  Add Student
                </Button>
              </Link>
              <Link href="/moderators/manage/users?type=tutor">
                <Button icon={<TeamOutlined />} size="large">
                  Add Tutor
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <StatisticalDataCard
          bgColor="bg-blue-600"
          cardTitle="Total Meetings"
          value={stats.totalMeetings.value}
          trend={stats.totalMeetings.trend}
          description="Total number of scheduled meetings"
        />
        <StatisticalDataCard
          bgColor="bg-green-600"
          cardTitle="Meeting Completion"
          value={stats.meetingCompletionRate.value}
          trend={stats.meetingCompletionRate.trend}
          total={100}
          description="Percentage of successfully completed meetings"
        />
        <StatisticalDataCard
          bgColor="bg-red-600"
          cardTitle="Students"
          value={stats.studentCount.value}
          trend={stats.studentCount.trend}
          description="Total number of registered students"
        />
        <StatisticalDataCard
          bgColor="bg-yellow-500"
          cardTitle="Tutors"
          value={stats.tutorCount.value}
          trend={stats.tutorCount.trend}
          description="Total number of registered tutors"
        />
      </Row>

      {/* Recent Appointments and Calendar */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Recent Appointments"
            extra={<Link href="/moderators/manage/appointments">View All</Link>}
            className="shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <Table
              columns={columns}
              dataSource={recentAppointments}
              pagination={false}
              rowKey="id"
              className="overflow-x-auto"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Calendar Overview"
            className="shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex justify-center">
              <StatisticalCalendar
                width={350}
                title="Appointments"
                customStyle={{ margin: "0 auto" }}
                borderColor="#1890ff"
                onDateChange={(value, mode) => {
                  console.log(
                    "Selected date:",
                    value.format("YYYY-MM-DD"),
                    "Mode:",
                    mode
                  );
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
