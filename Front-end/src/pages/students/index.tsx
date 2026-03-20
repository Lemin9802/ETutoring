import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Calendar,
  Card,
  Col,
  Image,
  List,
  Modal,
  Progress,
  Row,
  Table,
  Timeline,
} from "antd";
import Title from "antd/es/typography/Title";
import { Dayjs } from "dayjs";
import React, { useState } from "react";
import Link from "next/link";

const eventsData = [
  {
    title: "Math Exam",
    date: "2025-02-20",
    description: "Prepare your notes for the exam.",
  },
  {
    title: "Science Presentation",
    date: "2025-02-25",
    description: "Prepare slides and rehearse.",
  },
  {
    title: "Group Project Submission",
    date: "2025-03-01",
    description: "Finalizing and submitting the project.",
  },
  {
    title: "Homework Deadline",
    date: "2025-02-20",
    description: "Submit your homework on time.",
  },
];

const newsData = [
  { title: "Understanding React Hooks", date: "2025-02-12" },
  { title: "10 Tips for Better UX Design", date: "2025-02-11" },
  { title: "JavaScript ES2022 Features", date: "2025-02-10" },
];

const DashboardPage: React.FC = () => {
  const [pendingTasks, setPendingTasks] = useState([
    { title: "Submit your final assignment", status: "Pending" },
    { title: "Prepare for the upcoming exam", status: "Pending" },
    { title: "Attend the group meeting", status: "Pending" },
  ]);

  const [recentSubmissions] = useState([
    { title: "Submit your final assignment", status: "Checked" },
    { title: "Complete the survey for course feedback", status: "Checked" },
    { title: "Prepare your presentation for class", status: "Pending" },
  ]);

  const [, setSelectedDate] = useState<Dayjs | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    title: string;
    date: string;
    description: string;
  } | null>(null);

  const [weather] = useState<{ temperature: number; condition: string }>({
    temperature: 25,
    condition: "Sunny",
  });

  const columns = [
    { title: "Task Title", dataIndex: "title", key: "title" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) =>
        status === "Checked" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <ClockCircleOutlined style={{ color: "orange" }} />
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (text: string, record: { title: string; status: string }) => (
        <Button
          type="primary"
          onClick={() => markTaskCompleted(record.title)}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Complete
        </Button>
      ),
    },
  ];

  const markTaskCompleted = (title: string) => {
    const newTasks = pendingTasks.map((task) =>
      task.title === title ? { ...task, status: "Checked" } : task
    );
    setPendingTasks(newTasks);
  };

  const handleDateClick = (date: Dayjs) => {
    const filteredEvents = eventsData.filter(
      (event) => event.date === date.format("YYYY-MM-DD")
    );
    setSelectedEvent(filteredEvents.length > 0 ? filteredEvents[0] : null);
    setSelectedDate(date);
    setIsModalVisible(true);
  };

  const dateCellRender = (date: Dayjs) => {
    const dayEvents = eventsData.filter(
      (event) => event.date === date.format("YYYY-MM-DD")
    );
    return (
      <ul>
        {dayEvents.length > 0 && <li className="text-red-500">•</li>}
      </ul>
    );
  };

  const daysStudied = 2;
  const totalDays = 30;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto p-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card className="shadow-lg rounded-lg p-6 mb-4">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={8} sm={6}>
                  <Image
                    width={120}
                    src="https://img.freepik.com/premium-vector/student-avatar-illustration-user-profile-icon-youth-avatar_118339-4405.jpg"
                    alt="User Profile"
                    className="rounded-full"
                  />
                </Col>
                <Col xs={16} sm={18}>
                  <Title level={4} className="m-0 flex items-center">
                    <UserOutlined className="mr-2" />
                    John Doe
                  </Title>
                  <p className="text-sm text-gray-600 mb-1">
                    Web Development | Student
                  </p>
                  <p className="text-sm text-gray-600">Location: New York</p>
                </Col>
              </Row>
            </Card>

            <Card className="shadow-lg rounded-lg p-6 bg-blue-50">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12}>
                  <Title level={4} className="flex items-center">
                    <CloudOutlined className="mr-2" />
                    Current Weather
                  </Title>
                  <p className="text-gray-600 mb-1">
                    Location: Ho Chi Minh City
                  </p>
                  <p className="text-gray-600 mb-1">
                    Temperature: {weather.temperature}°C
                  </p>
                  <p className="text-gray-600 mb-0">
                    Condition: {weather.condition}
                  </p>
                </Col>
                {/* Divider dọc chỉ hiện ở màn hình trung bình trở lên */}
                <Col xs={0} sm={1} className="flex justify-center items-center">
                  <div className="border-l-2 h-16 mx-2"></div>
                </Col>
                <Col xs={24} sm={11} className="flex flex-col space-y-2">
                  <Title level={5} className="text-center m-0">
                    Days Studied
                  </Title>
                  <div className="flex justify-center">
                    <Progress
                      type="circle"
                      width={80}
                      percent={(daysStudied / totalDays) * 100}
                      format={() => `${daysStudied} / ${totalDays}`}
                      strokeColor="#4caf50"
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Col phải: Calendar */}
          <Col xs={24} md={12}>
            <Card className="shadow-lg rounded-lg p-6">
              <Title level={4} className="mb-4">
                My Calendar
              </Title>
              <div className="w-full overflow-auto">
                <Calendar
                  onSelect={handleDateClick}
                  dateCellRender={dateCellRender}
                  fullscreen={false}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Row thứ hai: Tasks và Submissions */}
        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} md={12}>
            <Card
              title="Pending Tasks"
              className="shadow-md rounded-lg bg-red-50"
            >
              <Table
                dataSource={pendingTasks}
                columns={columns}
                rowKey="title"
                pagination={false}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="Recent Submissions"
              className="shadow-md rounded-lg bg-blue-50"
            >
              <Table
                dataSource={recentSubmissions}
                columns={columns}
                rowKey="title"
                pagination={false}
              />
            </Card>
          </Col>
        </Row>

        {/* Row thứ ba: Community Groups và Latest News */}
        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} md={12}>
            <Card className="shadow-lg rounded-lg p-6 bg-yellow-50">
              <Title level={4}>Community Groups</Title>
              <List
                dataSource={[
                  "Design Community, USA",
                  "UX Hunters",
                  "Frontend Developers",
                ]}
                renderItem={(item) => <List.Item>{item}</List.Item>}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="shadow-lg rounded-lg p-6 bg-gray-100">
              <Title level={4}>Latest News</Title>
              <List
                dataSource={newsData}
                renderItem={(item) => (
                  <List.Item className="flex justify-between items-center">
                    <Title level={5} className="text-blue-500 m-0">
                      {item.title}
                    </Title>
                    <span className="text-sm text-gray-600">{item.date}</span>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* Modal hiển thị chi tiết event */}
        <Modal
          title={selectedEvent ? selectedEvent.title : "Event Details"}
          visible={isModalVisible}
          onOk={() => setIsModalVisible(false)}
          onCancel={() => setIsModalVisible(false)}
          className="event-modal"
          style={{ borderRadius: "8px" }}
        >
          <Timeline>
            <Timeline.Item>
              <Title level={4}>{selectedEvent?.title}</Title>
              <p>{selectedEvent?.description}</p>
            </Timeline.Item>
          </Timeline>
        </Modal>

        {/* Dashboard Cards khác */}
        <div className="mt-8">
          <h1 className="text-2xl font-bold mb-4">Students Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/documents/document-list" className="block">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold mb-2">Documents</h2>
                <p className="text-gray-600">View and manage your documents</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
