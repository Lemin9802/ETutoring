import React, { useState } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Timeline, Typography, Modal, Card } from 'antd';
import dayjs from 'dayjs';

interface Event {
  date: string;
  title: string;
  details: string;
}

// Upcoming events for a teacher
const events: Event[] = [
  { date: '2025-02-17', title: 'Parent-Teacher Meeting', details: 'Discuss student progress and development at 3:00 PM' },
  { date: '2025-02-21', title: 'School Assembly', details: 'Weekly school-wide assembly at 8:00 AM in the main hall' },
  { date: '2025-02-28', title: 'Professional Development Workshop', details: 'Training session on digital learning tools at 2:00 PM' },
  { date: '2025-03-05', title: 'Exams Week Preparation', details: 'Teachers’ strategy meeting for upcoming exams at 10:00 AM' },
];

const getEventColor = (eventDate: string) => {
  const today = dayjs();
  const diffDays = dayjs(eventDate).diff(today, 'day');

  if (diffDays <= 1) return '#A569BD'; // 🟣 Purple (today or tomorrow)
  if (diffDays <= 7) return '#5DADE2'; // 🔵 Blue (within 7 days)
  return '#58D68D'; // 🟢 Green (more than 7 days away)
};

const TimelineComponent: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const nextEvent = events[0]; // The nearest upcoming event

  return (
    <div className="timeline-container">
      <Typography.Title level={4}>Upcoming Events</Typography.Title>

      {/* Next Event Section */}
      <Card style={{ marginBottom: 16, borderLeft: `4px solid ${getEventColor(nextEvent.date)}` }}>
        <Typography.Text strong style={{ color: getEventColor(nextEvent.date) }}>
          Next Event: {nextEvent.title}
        </Typography.Text>
        <br />
        <Typography.Text type="secondary">{nextEvent.date}</Typography.Text>
        <br />
        <Typography.Text>{nextEvent.details}</Typography.Text>
      </Card>

      {/* Upcoming Events Timeline */}
      <Timeline>
        {events.map((event, index) => (
          <Timeline.Item key={index} dot={<ClockCircleOutlined />} color={getEventColor(event.date)}>
            <div
              style={{ cursor: 'pointer', fontWeight: 'bold', color: getEventColor(event.date) }}
              onClick={() => setSelectedEvent(event)}
            >
              {event.date}: {event.title}
            </div>
          </Timeline.Item>
        ))}
      </Timeline>

      {/* Modal for event details */}
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
