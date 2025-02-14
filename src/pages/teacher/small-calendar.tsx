import React, { useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import { Calendar, Col, Radio, Row, Select, theme, Typography, Input, Modal, Radio as AntdRadio } from 'antd';
import { CalendarProps } from 'antd';
import { Dayjs } from 'dayjs';
import dayLocaleData from 'dayjs/plugin/localeData';

dayjs.extend(dayLocaleData);

const App: React.FC = () => {
  const { token } = theme.useToken();
  const [notes, setNotes] = useState<{ [key: string]: { note: string; color: string } }>({}); // Save notes and colors
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null); // Selected date
  const [noteInput, setNoteInput] = useState<string>(''); // Input note content
  const [noteColor, setNoteColor] = useState<string>('blue'); // Note color

  const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
    console.log(value.format('YYYY-MM-DD'), mode);
  };

  const handleDateClick = (date: Dayjs) => {
    setSelectedDate(date);
    setNoteInput(notes[date.format('YYYY-MM-DD')]?.note || ''); // Get existing note if available
    setNoteColor(notes[date.format('YYYY-MM-DD')]?.color || 'blue'); // Get existing color if available
  };

  const handleSaveNote = () => {
    if (selectedDate) {
      const newNotes = { 
        ...notes, 
        [selectedDate.format('YYYY-MM-DD')]: { note: noteInput, color: noteColor }
      };
      setNotes(newNotes); // Save note and color to state
      setSelectedDate(null); // Close modal after saving
      setNoteInput(''); // Reset input content
      setNoteColor('blue'); // Reset color
    }
  };

  const dateCellRender = (value: Dayjs) => {
    const formattedDate = value.format('YYYY-MM-DD');
    return (
      <div onClick={() => handleDateClick(value)} style={{ cursor: 'pointer', padding: '5px', height: '100%' }}>
        {notes[formattedDate] && (
          <div style={{ color: notes[formattedDate].color, fontSize: '12px', lineHeight: 1.2 }}>
            {notes[formattedDate].note}
          </div>
        )}
      </div>
    );
  };

  const renderNoteInput = () => {
    return (
      <Modal
        title={`Note for ${selectedDate?.format('YYYY-MM-DD')}`}
        visible={selectedDate !== null} // Show modal if a date is selected
        onCancel={() => setSelectedDate(null)} // Close modal when canceled
        onOk={handleSaveNote} // Save note when OK is clicked
      >
        <Input.TextArea
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)} // Update note content while typing
          placeholder="Enter note"
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
        <div style={{ marginTop: '10px' }}>
          <Typography.Text>Note Color:</Typography.Text>
          <Radio.Group
            value={noteColor}
            onChange={(e) => setNoteColor(e.target.value)} // Update note color
          >
            <Row gutter={16}>
              <Col>
                <AntdRadio value="blue">Blue</AntdRadio>
              </Col>
              <Col>
                <AntdRadio value="green">Green</AntdRadio>
              </Col>
              <Col>
                <AntdRadio value="red">Red</AntdRadio>
              </Col>
              <Col>
                <AntdRadio value="orange">Orange</AntdRadio>
              </Col>
            </Row>
          </Radio.Group>
        </div>
      </Modal>
    );
  };

  const wrapperStyle: React.CSSProperties = {
    width: 300,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
  };

  return (
    <div style={wrapperStyle}>
      <Calendar
        fullscreen={false}
        dateCellRender={dateCellRender} // Display notes in the date cell
        headerRender={({ value, type, onChange, onTypeChange }) => {
          const start = 0;
          const end = 12;
          const monthOptions = [];

          let current = value.clone();
          const localeData = value.localeData();
          const months = [];
          for (let i = 0; i < 12; i++) {
            current = current.month(i);
            months.push(localeData.monthsShort(current));
          }

          for (let i = start; i < end; i++) {
            monthOptions.push(
              <Select.Option key={i} value={i} className="month-item">
                {months[i]}
              </Select.Option>,
            );
          }

          const year = value.year();
          const month = value.month();
          const options = [];
          for (let i = year - 10; i < year + 10; i += 1) {
            options.push(
              <Select.Option key={i} value={i} className="year-item">
                {i}
              </Select.Option>,
            );
          }
          return (
            <div style={{ padding: 8 }}>
              <Typography.Title level={4}>Calendar</Typography.Title>
              <Row gutter={8}>
                <Col>
                  <Radio.Group
                    size="small"
                    onChange={(e) => onTypeChange(e.target.value)}
                    value={type}
                  >
                    <Radio.Button value="month">Month</Radio.Button>
                    <Radio.Button value="year">Year</Radio.Button>
                  </Radio.Group>
                </Col>
                <Col>
                  <Select
                    size="small"
                    popupMatchSelectWidth={false}
                    className="my-year-select"
                    value={year}
                    onChange={(newYear) => {
                      const now = value.clone().year(newYear);
                      onChange(now);
                    }}
                  >
                    {options}
                  </Select>
                </Col>
                <Col>
                  <Select
                    size="small"
                    popupMatchSelectWidth={false}
                    value={month}
                    onChange={(newMonth) => {
                      const now = value.clone().month(newMonth);
                      onChange(now);
                    }}
                  >
                    {monthOptions}
                  </Select>
                </Col>
              </Row>
            </div>
          );
        }}
        onPanelChange={onPanelChange}
      />
      {renderNoteInput()} {/* Display modal to input note */}
    </div>
  );
};

export default App;
