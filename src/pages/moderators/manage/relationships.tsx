import React, { useState } from "react";
import {
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Progress,
  Tag,
  Statistic,
  Rate,
} from "antd";
import {
  BookOutlined,
  DashboardOutlined,
  RocketOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { TabPane } = Tabs;

const RelationshipManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("1");

  // Sample data - In a real app, this would come from your API
  const assignments = [
    {
      id: 1,
      tutor: "John Doe",
      student: "Jane Smith",
      subject: "Mathematics",
      course: "Calculus I",
      progress: 75,
    },
  ];

  const performanceData = [
    {
      id: 1,
      student: "Jane Smith",
      subject: "Mathematics",
      attendance: 90,
      completion: 85,
      satisfaction: 4.5,
    },
  ];

  // Subject/Course Assignment Management Section
  const AssignmentManagement = () => (
    <Card title="Subject/Course Assignments">
      <Button type="primary" className="mb-4">
        New Assignment
      </Button>
      <Table
        dataSource={assignments}
        columns={[
          { title: "Tutor", dataIndex: "tutor", key: "tutor" },
          { title: "Student", dataIndex: "student", key: "student" },
          { title: "Subject", dataIndex: "subject", key: "subject" },
          { title: "Course", dataIndex: "course", key: "course" },
          {
            title: "Progress",
            dataIndex: "progress",
            key: "progress",
            render: (progress: number) => (
              <Progress percent={progress} size="small" />
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: () => (
              <Space>
                <Button type="link">Edit</Button>
                <Button type="link" danger>
                  Remove
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );

  // Progress Tracking Dashboard Section
  const ProgressTracking = () => (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Average Progress"
              value={85}
              suffix="%"
              prefix={<DashboardOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Assignments"
              value={24}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={92}
              suffix="%"
              prefix={<RocketOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Card title="Student Progress Overview" className="mt-4">
        <Table
          dataSource={performanceData}
          columns={[
            { title: "Student", dataIndex: "student", key: "student" },
            { title: "Subject", dataIndex: "subject", key: "subject" },
            {
              title: "Attendance",
              dataIndex: "attendance",
              key: "attendance",
              render: (value: number) => (
                <Progress percent={value} size="small" />
              ),
            },
            {
              title: "Completion",
              dataIndex: "completion",
              key: "completion",
              render: (value: number) => (
                <Progress percent={value} size="small" />
              ),
            },
            {
              title: "Satisfaction",
              dataIndex: "satisfaction",
              key: "satisfaction",
              render: (value: number) => <Rate disabled defaultValue={value} />,
            },
          ]}
        />
      </Card>
    </div>
  );

  // Learning Path Management Section
  const LearningPathManagement = () => (
    <Card title="Learning Paths">
      <Button type="primary" className="mb-4">
        Create Learning Path
      </Button>
      <Table
        dataSource={[
          {
            id: 1,
            path: "Advanced Mathematics",
            description:
              "Comprehensive math curriculum from algebra to calculus",
            duration: "6 months",
            status: "Active",
          },
        ]}
        columns={[
          { title: "Path Name", dataIndex: "path", key: "path" },
          {
            title: "Description",
            dataIndex: "description",
            key: "description",
          },
          { title: "Duration", dataIndex: "duration", key: "duration" },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
              <Tag color={status === "Active" ? "green" : "orange"}>
                {status}
              </Tag>
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: () => (
              <Space>
                <Button type="link">Edit</Button>
                <Button type="link">View Details</Button>
                <Button type="link" danger>
                  Delete
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );

  // Resource Allocation Section
  const ResourceAllocation = () => (
    <Card title="Resource Allocation">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Tutor Availability">
            <Table
              dataSource={[
                {
                  tutor: "John Doe",
                  subjects: ["Mathematics", "Physics"],
                  availability: "20 hours/week",
                  currentLoad: "15 hours/week",
                },
              ]}
              columns={[
                { title: "Tutor", dataIndex: "tutor", key: "tutor" },
                {
                  title: "Subjects",
                  dataIndex: "subjects",
                  key: "subjects",
                  render: (subjects: string[]) => (
                    <>
                      {subjects.map((subject) => (
                        <Tag key={subject}>{subject}</Tag>
                      ))}
                    </>
                  ),
                },
                {
                  title: "Availability",
                  dataIndex: "availability",
                  key: "availability",
                },
                {
                  title: "Current Load",
                  dataIndex: "currentLoad",
                  key: "currentLoad",
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Resource Utilization">
            <div style={{ textAlign: "center" }}>
              <Progress
                type="circle"
                percent={75}
                format={(percent) => `${percent}% Utilized`}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div className="p-6">
      <Title level={2}>Tutor-Student Relationship Management</Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <BookOutlined />
              Assignments
            </span>
          }
          key="1"
        >
          <AssignmentManagement />
        </TabPane>
        <TabPane
          tab={
            <span>
              <DashboardOutlined />
              Progress Tracking
            </span>
          }
          key="2"
        >
          <ProgressTracking />
        </TabPane>
        <TabPane
          tab={
            <span>
              <RocketOutlined />
              Learning Paths
            </span>
          }
          key="3"
        >
          <LearningPathManagement />
        </TabPane>
        <TabPane
          tab={
            <span>
              <DatabaseOutlined />
              Resource Allocation
            </span>
          }
          key="4"
        >
          <ResourceAllocation />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RelationshipManagement;
