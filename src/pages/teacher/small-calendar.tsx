import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Calendar, Modal, Tooltip } from 'antd';
import { Dayjs } from 'dayjs';

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

const SmallCalendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const dateCellRender = (value: Dayjs) => {
    const formattedDate = value.format('YYYY-MM-DD');
    const event = events.find((e) => e.date === formattedDate);

    return event ? (
      <Tooltip title={event.title}>
        <div
          onClick={() => setSelectedEvent(event)}
          style={{
            cursor: 'pointer',
            width: '100%',
            height: '100%',
            backgroundColor: getEventColor(event.date),
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          {value.date()}
        </div>
      </Tooltip>
    ) : null;
  };

  return (
    <div>
      <Calendar fullscreen={false} dateCellRender={dateCellRender} />
      
      {/* Event Detail Modal */}
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

export default SmallCalendar;
