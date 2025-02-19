import { CloudOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Calendar, Card, Col, Image, List, Modal, Progress, Row, Timeline } from "antd";
import Title from "antd/es/typography/Title";
import React, { useState } from "react";
import dayjs from "dayjs";

interface Event {
  title: string;
  date: string;
  description: string;
}

interface Task {
  title: string;
  status: "Pending" | "Checked";
}

const eventsData: Event[] = [
  { title: 'Math Exam', date: '2025-02-20', description: 'Prepare your notes for the exam.' },
  { title: 'Science Presentation', date: '2025-02-25', description: 'Prepare slides and rehearse.' },
  { title: 'Group Project Submission', date: '2025-03-01', description: 'Finalizing and submitting the project.' },
  { title: 'Homework Deadline', date: '2025-02-20', description: 'Submit your homework on time.' },
];

const DashboardPage: React.FC = () => {
  const [pendingTasks, setPendingTasks] = useState<Task[]>([  
    { title: 'Submit your final assignment', status: 'Pending' },
    { title: 'Prepare for the upcoming exam', status: 'Pending' },
    { title: 'Attend the group meeting', status: 'Pending' },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const weather = { temperature: 25, condition: 'Sunny' };

  const markTaskCompleted = (title: string) => {
    setPendingTasks(prevTasks => prevTasks.map(task => 
      task.title === title ? { ...task, status: 'Checked' } : task
    ));
  };

  const handleDateClick = (date: dayjs.Dayjs) => {
    const filteredEvents = eventsData.find(event => event.date === date.format("YYYY-MM-DD"));
    setSelectedEvent(filteredEvents || null);
    setIsModalVisible(true);
  };

  const dateCellRender = (date: dayjs.Dayjs) => {
    const hasEvent = eventsData.some(event => event.date === date.format("YYYY-MM-DD"));
    return hasEvent ? <span className="text-red-500">•</span> : null;
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <Card>
        <Row gutter={[24, 24]}>
          <Col span={16}>
            <Card>
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <Image width={120} src="https://img.freepik.com/avatar.jpg" alt="User Profile" />
                </Col>
                <Col span={18}>
                  <Title level={4}><UserOutlined /> John Doe</Title>
                  <p>Web Development | Student</p>
                </Col>
              </Row>
            </Card>
            <Card>
              <Row>
                <Col span={12}>
                  <Title level={4}><CloudOutlined /> Current Weather</Title>
                  <p>Temperature: {weather.temperature}°C</p>
                  <p>Condition: {weather.condition}</p>
                </Col>
                <Col span={12}>
                  <Title level={5}>Days Studied</Title>
                  <Progress type="circle" width={80} percent={(2 / 30) * 100} format={() => `2 / 30`} />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Title level={4}>My Calendar</Title>
              <Calendar onSelect={handleDateClick} dateCellRender={dateCellRender} fullscreen={false} />
            </Card>
            <Card>
              <Title level={4}>Pending Tasks</Title>
              <List
                dataSource={pendingTasks}
                renderItem={(task) => (
                  <List.Item>
                    {task.title} - {task.status}
                    {task.status === "Pending" && (
                      <Button type="link" onClick={() => markTaskCompleted(task.title)}>Complete</Button>
                    )}
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Card>
      <Modal title={selectedEvent?.title || 'Event Details'} open={isModalVisible} onOk={() => setIsModalVisible(false)} onCancel={() => setIsModalVisible(false)}>
        <Timeline>
          {selectedEvent && <Timeline.Item>{selectedEvent.description}</Timeline.Item>}
        </Timeline>
      </Modal>
    </div>
  );
};
export default DashboardPage;

