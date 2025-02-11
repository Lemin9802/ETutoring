import { Button, Calendar, Card, Col, Image, Progress, Row, Table } from "antd";
import Title from "antd/es/typography/Title";
import { Metadata } from "next";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import React, { useState } from "react";

export const metadata: Metadata = {
  title: "Next.js Chart | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const DashboardPage: React.FC = () => {
  const [pendingTasks] = useState([
    { title: 'Submit the assignment for Hindi', subject: 'Hindi', points: 10, status: 'Pending' },
    { title: 'Complete the project report', subject: 'English', points: 15, status: 'Pending' },
    { title: 'Make correction in assignment', subject: 'Maths', points: 20, status: 'Pending' },
  ]);

  const recentSubmissions = [
    { title: 'Submit the assignment for Hindi', subject: 'Hindi', points: 10, status: 'Checked' },
    { title: 'Complete the project report', subject: 'English', points: 15, status: 'Checked' },
    { title: 'Make correction in assignment', subject: 'Maths', points: 20, status: 'Pending' },
  ];

  const columns = [
    { title: 'Worksheet Title', dataIndex: 'title', key: 'title' },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Points', dataIndex: 'points', key: 'points' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (status === 'Checked' ? <CheckCircleOutlined /> : <ClockCircleOutlined />),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <Button type="primary">Start</Button>,
    },
  ];

  return (
    <Card className="rounded-lg shadow-md p-6">
      <Row gutter={[16, 16]}>
        {/* User Info Section */}
        <Col span={16} className="flex flex-col items-center">
          {/* User Information */}
          <Card className="w-full flex shadow-md rounded-lg p-4">
            <Row gutter={[16, 16]} align="middle">
              <Col span={8} className="flex flex-col items-center">
                <Image
                  width={150}
                  src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                  alt="User"
                  className="rounded-full"
                />
              </Col>
              <Col span={12}>
                <div className="flex flex-col justify-center">
                  <Title level={3}>Welcome, Ananya Sharma</Title>
                  <p className="text-sm text-gray-500">Thursday, May 6, 2021</p>
                </div>
              </Col>
              <Col span={4} className="flex justify-center items-center">
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500">My Total Points</p>
                  <Title level={2}>291</Title>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Course Progress Section */}
          <Card title="My Course Progress" className="shadow-md rounded-lg w-full mt-6">
            <Row className="flex items-center justify-center">
              <Col span={6} className="mt-4">
                <Progress type="circle" percent={75} />
              </Col>
              <Col span={16} className="mt-4">
                <Title level={4}>Your Progress</Title>
                <Progress
                  percent={76}
                  strokeColor="blue"
                  format={(percent) => `Hindi ${percent}%`}
                  className="mb-2"
                />
                <Progress
                  percent={90}
                  strokeColor="green"
                  format={(percent) => `English ${percent}%`}
                  className="mb-2"
                />
                <Progress
                  percent={83}
                  strokeColor="orange"
                  format={(percent) => `Maths ${percent}%`}
                  className="mb-2"
                />
                <Progress
                  percent={70}
                  strokeColor="purple"
                  format={(percent) => `Science ${percent}%`}
                  className="mb-2"
                />
                <Progress
                  percent={46}
                  strokeColor="red"
                  format={(percent) => `SST ${percent}%`}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Calendar Section */}
        <Col span={8} className="mt-6 md:mt-0">
          <Card title="My Calendar" className="shadow-md rounded-lg">
            <div className=" overflow-hidden">
              <Calendar fullscreen={false} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Pending Worksheets and Recent Submissions */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col span={24} md={12}>
          <Card title="Pending Worksheets" className="shadow-md rounded-lg">
            <Table
              dataSource={pendingTasks}
              columns={columns}
              rowKey="title"
              pagination={false}
            />
          </Card>
        </Col>

        <Col span={24} md={12}>
          <Card title="Recent Worksheets Submissions" className="shadow-md rounded-lg">
            <Table
              dataSource={recentSubmissions}
              columns={columns}
              rowKey="title"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default DashboardPage;
