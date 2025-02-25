import { Timeline, Typography, Modal, Card } from 'antd';
import { useState } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const events = [
  { date: '2025-02-26', title: 'Parent-Teacher Meeting', details: 'Discuss student progress and development at 3:00 PM' },
  { date: '2025-02-28', title: 'Midterm Exams Start', details: 'Midterm exams begin for all subjects' },
  { date: '2025-03-03', title: 'School Assembly', details: 'Weekly school-wide assembly at 8:00 AM in the main hall' },
  { date: '2025-03-07', title: 'Science Fair', details: 'Annual Science Fair showcasing student projects' },
  { date: '2025-03-12', title: 'Teacher Training Workshop', details: 'Professional development workshop for teachers' },
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
    <div className="timeline-container" style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
      <Typography.Title level={4} style={{ textAlign: 'center' }}>📅 Upcoming Events</Typography.Title>

      <Card
        style={{
          marginBottom: 16,
          borderLeft: `6px solid ${getEventColor(nextEvent.date)}`,
          padding: '15px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Typography.Text strong style={{ color: getEventColor(nextEvent.date), fontSize: '16px' }}>
          {nextEvent.title}
        </Typography.Text>
        <br />
        <Typography.Text type="secondary" style={{ fontSize: '14px' }}>{nextEvent.date}</Typography.Text>
        <br />
        <Typography.Text style={{ fontSize: '14px' }}>{nextEvent.details}</Typography.Text>
      </Card>

      <Timeline>
        {events.map((event, index) => (
          <Timeline.Item key={index} dot={<ClockCircleOutlined style={{ color: getEventColor(event.date) }} />} color={getEventColor(event.date)}>
            <div
              style={{ cursor: 'pointer', fontWeight: 'bold', color: getEventColor(event.date), fontSize: '14px' }}
              onClick={() => setSelectedEvent(event)}
            >
              {event.title} - {event.date}
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
