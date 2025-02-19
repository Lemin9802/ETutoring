import { Badge, Calendar, Modal, Popover, Timeline } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';

// Helper function to get task data based on date
const getListData = (value: dayjs.Dayjs) => {
  let listData: Array<{ type: 'warning' | 'success'; content: string; description: string }> = [];
  switch (value.date()) {
    case 8:
      listData = [
        { type: 'warning', content: 'Math Homework', description: 'Complete exercises from chapter 5.' },
        { type: 'success', content: 'Science Project', description: 'Finish the project presentation.' },
      ];
      break;
    case 10:
      listData = [
        { type: 'warning', content: 'History Essay', description: 'Write about the French Revolution.' },
        { type: 'success', content: 'Art Class', description: 'Submit your painting for review.' },
      ];
      break;
    case 15:
      listData = [
        { type: 'warning', content: 'Physics Lab', description: 'Prepare for the experiment tomorrow.' },
        { type: 'success', content: 'Chemistry Quiz', description: 'Revise chapters 3 and 4.' },
      ];
      break;
    default:
      listData = [];
  }
  return listData || [];
};

// Render tasks inside each date cell
const dateCellRender = (value: dayjs.Dayjs) => {
  const listData = getListData(value);
  return (
    <ul className="events">
      {listData.map((item, index) => (
        <li key={index} className="mb-1">
          <Popover content={<div>{item.description}</div>} title={item.content} trigger="hover">
            <Badge
              status={item.type}
              text={item.content}
              className={`rounded-full text-xs font-medium mr-1 ${item.type === 'warning' ? 'bg-yellow-400' : 'bg-green-400'}`}
            />
          </Popover>
        </li>
      ))}
    </ul>
  );
};

const CalendarComponent: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  // Handle date selection
  const onSelect = (value: dayjs.Dayjs) => {
    setSelectedDate(value);
    setIsModalVisible(true);
  };

  // Handle modal Ok action
  const handleOk = () => {
    setIsModalVisible(false);
  };

  // Handle modal Cancel action
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Sample tasks with time range
  const tasks = [
    {
      id: '1',
      name: 'Math Homework',
      start: new Date('2025-02-08 09:00'),
      end: new Date('2025-02-08 10:00'),
    },
    {
      id: '2',
      name: 'Science Project',
      start: new Date('2025-02-08 10:30'),
      end: new Date('2025-02-08 12:00'),
    },
    {
      id: '3',
      name: 'History Essay',
      start: new Date('2025-02-10 08:00'),
      end: new Date('2025-02-10 09:30'),
    },
    {
      id: '4',
      name: 'Art Class',
      start: new Date('2025-02-10 10:00'),
      end: new Date('2025-02-10 11:30'),
    },
    {
      id: '5',
      name: 'Physics Lab',
      start: new Date('2025-02-15 14:00'),
      end: new Date('2025-02-15 16:00'),
    },
    {
      id: '6',
      name: 'Chemistry Quiz',
      start: new Date('2025-02-15 16:30'),
      end: new Date('2025-02-15 17:30'),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Calendar</h1>
      <Calendar
        dateCellRender={dateCellRender}
        onSelect={onSelect}
        fullscreen={true}
        mode="month"
        className="rounded-lg shadow-lg"
      />
      <Modal title="Activities" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} width={800}>
        {selectedDate && (
          <>
            <h2 className="text-xl font-bold mb-4">Activities on {selectedDate.format('YYYY-MM-DD')}</h2>

            {/* Timeline view for tasks on the selected date */}
            <Timeline className="mb-4">
              {tasks
                .filter((task) => dayjs(task.start).isSame(selectedDate, 'day'))
                .map((task) => (
                  <Timeline.Item key={task.id} color="green">
                    <div className="font-semibold">{task.name}</div>
                    <div>{dayjs(task.start).format('HH:mm')} - {dayjs(task.end).format('HH:mm')}</div>
                  </Timeline.Item>
                ))}
            </Timeline>

            {/* Display tasks with start and end times */}
            <div>
              {tasks
                .filter((task) => dayjs(task.start).isSame(selectedDate, 'day'))
                .map((task) => (
                  <div key={task.id} className="mb-4 p-4 border rounded-lg shadow-md">
                    <div className="font-semibold">{task.name}</div>
                    <div className="text-gray-500">
                      {dayjs(task.start).format('HH:mm')} - {dayjs(task.end).format('HH:mm')}
                    </div>
                    <div>Progress: {Math.floor(Math.random() * 100)}%</div>
                  </div>
                ))}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default CalendarComponent;
