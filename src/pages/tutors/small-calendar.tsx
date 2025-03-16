import React, { useState } from 'react';
import { Badge, Calendar, Modal, Input, Button, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
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

const getListData = (value: Dayjs) => {
  return events
    .filter(event => event.date === value.format('YYYY-MM-DD'))
    .map(event => ({ ...event, color: getEventColor(event.date) }));
};

const SmallCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [tempNote, setTempNote] = useState<string>('');

  const handleSaveNote = () => {
    if (selectedDate) {
      const dateKey = selectedDate.format('YYYY-MM-DD');
      if (tempNote.trim() === '') {
        const updatedNotes = { ...notes };
        delete updatedNotes[dateKey];
        setNotes(updatedNotes);
      } else {
        setNotes(prev => ({ ...prev, [dateKey]: tempNote }));
      }
      setSelectedDate(null);
    }
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    const hasNote = !!notes[value.format('YYYY-MM-DD')];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        {hasNote && <Badge color="#FF69B4" style={{ width: '6px', height: '6px', borderRadius: '50%' }} />}
        {listData.map((event, index) => (
          <Badge
            key={index}
            color={event.color}
            style={{ width: '6px', height: '6px', borderRadius: '50%' }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
      <Typography.Title level={4} style={{ textAlign: 'center' }}>📆 Monthly Overview</Typography.Title>
      <Calendar
        fullscreen={false}
        style={{ fontSize: '14px', backgroundColor: '#ffffff', borderRadius: '8px', padding: '10px' }}
        dateCellRender={dateCellRender}
        onSelect={(value) => {
          setSelectedDate(value);
          setTempNote(notes[value.format('YYYY-MM-DD')] || '');
        }}
      />

      <Modal
        title={`📅 Notes for ${selectedDate?.format('YYYY-MM-DD')}`}
        open={!!selectedDate}
        onCancel={() => setSelectedDate(null)}
        footer={[
          <Button key="cancel" onClick={() => setSelectedDate(null)}>Cancel</Button>,
          <Button key="save" type="primary" onClick={handleSaveNote}>Save</Button>,
        ]}
      >
        {selectedDate && getListData(selectedDate).length > 0 && (
          <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
            <strong>📌 Events:</strong>
            <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
              {getListData(selectedDate).map((event, index) => (
                <li key={index} style={{ color: event.color }}>
                  <strong>{event.title}</strong> - {event.details}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Input.TextArea
          rows={4}
          placeholder="Write your notes here..."
          value={tempNote}
          onChange={(e) => setTempNote(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default SmallCalendar;
