import { CheckCircleOutlined, ClockCircleOutlined, CloudOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Calendar, Card, Col, Image, List, Modal, Progress, Row, Table, Timeline } from "antd";
import Title from "antd/es/typography/Title";
import { Dayjs } from "dayjs";
import React, { useState } from "react";

const eventsData = [
  { title: 'Math Exam', date: '2025-02-20', description: 'Prepare your notes for the exam.' },
  { title: 'Science Presentation', date: '2025-02-25', description: 'Prepare slides and rehearse.' },
  { title: 'Group Project Submission', date: '2025-03-01', description: 'Finalizing and submitting the project.' },
  { title: 'Homework Deadline', date: '2025-02-20', description: 'Submit your homework on time.' },
];

const newsData = [
  { title: 'Understanding React Hooks', date: '2025-02-12' },
  { title: '10 Tips for Better UX Design', date: '2025-02-11' },
  { title: 'JavaScript ES2022 Features', date: '2025-02-10' },
];

const DashboardPage: React.FC = () => {
  const [pendingTasks, setPendingTasks] = useState([
    { title: 'Submit your final assignment', status: 'Pending' },
    { title: 'Prepare for the upcoming exam', status: 'Pending' },
    { title: 'Attend the group meeting', status: 'Pending' },
  ]);

  const [recentSubmissions] = useState([
    { title: 'Submit your final assignment', status: 'Checked' },
    { title: 'Complete the survey for course feedback', status: 'Checked' },
    { title: 'Prepare your presentation for class', status: 'Pending' },
  ]);

  const [, setSelectedDate] = useState<Dayjs | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ title: string; date: string; description: string } | null>(null);

  const [weather, ] = useState<{ temperature: number; condition: string }>({ temperature: 25, condition: 'Sunny' });

  const columns = [
    { title: 'Task Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (status === 'Checked' ? <CheckCircleOutlined style={{ color: 'green' }} /> : <ClockCircleOutlined style={{ color: 'orange' }} />),
    },
    {
      title: 'Action',
      key: 'action',
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
      task.title === title ? { ...task, status: 'Checked' } : task
    );
    setPendingTasks(newTasks);
  };

  const handleDateClick = (date:Dayjs) => {
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
        {dayEvents.length > 0 && (
          <li className="text-red-500">•</li> // Red dot for events on the day
        )}
      </ul>
    );
  };
  const daysStudied = 2;  // Example: 2 days studied
  const totalDays = 30;   // Example: total 30 days
  
  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <Card className="mt-4">
        <Row gutter={[24, 24]}>
          {/* Left Section: User Info & Weather */}
          <Col xs={24} sm={16} md={15}>
            <Card className="shadow-lg rounded-lg p-6 bg-white mb-3">
              <Row gutter={[16, 16]} className="flex items-center">
                <Col xs={8} sm={6}>
                  <Image
                    width={120}
                    src="https://img.freepik.com/premium-vector/student-avatar-illustration-user-profile-icon-youth-avatar_118339-4405.jpg"
                    alt="User Profile"
                    className="rounded-full"
                  />
                </Col>
                <Col xs={16} sm={18}>
                  <Title level={4}><UserOutlined /> John Doe</Title>
                  <p className="text-sm text-gray-600">Web Development | Student</p>
                  <p className="text-sm text-gray-600">Location: New York</p>
                </Col>
              </Row>
            </Card>
            <Card className="shadow-lg rounded-lg p-6 bg-blue-50">
              <Row gutter={[16, 16]} className="flex items-center">
                {/* Left Section: Weather */}
                <Col xs={24} sm={12} className="flex flex-col space-y-2">
                  <Title level={4} className="flex items-center">
                    <CloudOutlined /> Current Weather
                  </Title>
                  <p className="text-gray-600">Location: Ho Chi Minh City</p>
                  <p className="text-gray-600">Temperature: {weather.temperature}°C</p>
                  <p className="text-gray-600">Condition: {weather.condition}</p>
                </Col>
  
                {/* Vertical Divider */}
                <Col className="flex justify-center items-center" xs={24} sm={1}>
                  <div className="border-l-2 h-24 mx-4"></div>
                </Col>
  
                {/* Right Section: Days Studied */}
                <Col xs={24} sm={11} className="flex flex-col space-y-4">
                  <Title level={5} className="text-center">Days Studied</Title>
  
                  {/* Progress Bar to show Study and Rest Days */}
                  <div className="flex flex-col items-center space-y-2">
                    <Progress
                      type="circle"
                      width={80}
                      percent={(daysStudied / totalDays) * 100}
                      format={() => `${daysStudied} / ${totalDays}`}
                      strokeColor="#4caf50"  // Green for study days
                    />
                  </div>
                </Col>
  
              </Row>
            </Card>
          </Col>
  
          <Col xs={24} sm={8} md={9} className="flex justify-center items-center">
            <Card className="shadow-lg rounded-lg p-6 bg-white w-full max-w-lg">
              <Title level={4} className="mb-4">My Calendar</Title>
              <div className="w-full h-80">
                <Calendar onSelect={handleDateClick} dateCellRender={dateCellRender} fullscreen={false} />
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
  
      {/* Tasks and Submissions */}
      <Card className="mt-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Pending Tasks" className="shadow-md rounded-lg bg-red-50">
              <Table
                dataSource={pendingTasks}
                columns={columns}
                rowKey="title"
                pagination={false}
              />
            </Card>
          </Col>
  
          <Col xs={24} md={12}>
            <Card title="Recent Submissions" className="shadow-md rounded-lg bg-blue-50">
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
  
      {/* Latest News and Community Groups */}
      <Row gutter={[24, 24]} className="mt-8">
        <Col span={24}>
          <Card className="shadow-lg rounded-lg p-6 bg-yellow-50">
            <Title level={4}>Community Groups</Title>
            <List
              dataSource={["Design Community, USA", "UX Hunters", "Frontend Developers"]}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Card>
        </Col>
  
        <Col span={24}>
          <Card className="shadow-lg rounded-lg p-6 bg-gray-100">
            <Title level={4}>Latest News</Title>
            <List
              dataSource={newsData}
              renderItem={item => (
                <List.Item>
                  <Title level={5} className="text-blue-500">{item.title}</Title>
                  <span className="text-sm text-gray-600 float-right">{item.date}</span>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
  
      {/* Event Details Modal */}
      <Modal
        title={selectedEvent ? selectedEvent.title : 'Event Details'}
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        className="event-modal"
        style={{ borderRadius: '8px' }}
      >
        <Timeline>
          <Timeline.Item>
            <Title level={4}>{selectedEvent?.title}</Title>
            <p>{selectedEvent?.description}</p>
          </Timeline.Item>
        </Timeline>
      </Modal>
    </div>
  );  
};

export default DashboardPage;