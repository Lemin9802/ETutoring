import React, { useState } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Timeline, Typography, Modal, Card } from 'antd';
import dayjs from 'dayjs';

const events = [
  { date: '2025-02-17', title: 'Parent-Teacher Meeting', details: 'Discuss student progress and development at 3:00 PM' },
  { date: '2025-02-21', title: 'School Assembly', details: 'Weekly school-wide assembly at 8:00 AM in the main hall' },
  { date: '2025-02-28', title: 'Professional Development Workshop', details: 'Training session on digital learning tools at 2:00 PM' },
  { date: '2025-03-05', title: 'Exams Week Preparation', details: 'Teachers’ strategy meeting for upcoming exams at 10:00 AM' },
];

const getEventColor = (eventDate: string) => {
  const today = dayjs().startOf('day'); 
  const eventDay = dayjs(eventDate).startOf('day');
  const diffDays = eventDay.diff(today, 'day'); 

  if (diffDays <= 3) return '#FF8C00'; 
  if (diffDays <= 7) return '#FFD700'; 
  if (diffDays <= 14) return '#5DADE2'; 
  return '#58D68D'; 
};

const TimelineComponent: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const nextEvent = events[0]; 

  return (
    <div className="timeline-container">
      <Typography.Title level={4}>📅 Upcoming Events</Typography.Title>

      <Card
        style={{
          marginBottom: 16,
          borderLeft: `4px solid ${getEventColor(nextEvent.date)}`,
          padding: '10px',
          backgroundColor: '#1f1f1f',
        }}
      >
        <Typography.Text strong style={{ color: getEventColor(nextEvent.date) }}>
          {nextEvent.title}
        </Typography.Text>
        <br />
        <Typography.Text type="secondary">{nextEvent.date}</Typography.Text>
        <br />
        <Typography.Text>{nextEvent.details}</Typography.Text>
      </Card>

      <Timeline>
        {events.map((event, index) => (
          <Timeline.Item key={index} dot={<ClockCircleOutlined style={{ color: getEventColor(event.date) }} />} color={getEventColor(event.date)}>
            <div
              style={{ cursor: 'pointer', fontWeight: 'bold', color: getEventColor(event.date) }}
              onClick={() => setSelectedEvent(event)}
            >
              {event.date}: {event.title}
            </div>
          </Timeline.Item>
        ))}
      </Timeline>

      <Modal
        title={selectedEvent?.title}
        open={!!selectedEvent}
        onCancel={() => setSelectedEvent(null)}
        footer={null}
      >
        <p><strong>Date:</strong> {selectedEvent?.date}</p>
        <p>{selectedEvent?.details}</p>
      </Modal>
    </div>
  );
};

export default TimelineComponent;
