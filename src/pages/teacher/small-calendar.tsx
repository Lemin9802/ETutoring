'use client';

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '@/styles/small-calendar.module.css'; // Custom CSS để tạo style giống hình

export default function CustomCalendar() {
  const currentDate = new Date();
  const [value, setValue] = useState(currentDate);
  const [mounted, setMounted] = useState(false);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth());
  const [viewMode, setViewMode] = useState('month');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDateChange = (date) => {
    setValue(date);
  };

  const handleYearChange = (event) => {
    setYear(Number(event.target.value));
  };

  const handleMonthChange = (event) => {
    setMonth(Number(event.target.value));
  };

  return (
    <div className="absolute right-4 top-20 shadow-lg p-4 rounded-lg w-80 bg-white font-sans text-gray-700">
      <div className="flex justify-between items-center mb-2 space-x-2">
        <select value={year} onChange={handleYearChange} className="border p-1 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {[...Array(10)].map((_, i) => (
            <option key={i} value={2020 + i}>{2020 + i}</option>
          ))}
        </select>
        <select value={month} onChange={handleMonthChange} className="border p-1 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>
        <div className="flex space-x-1">
          <button 
            className={`border px-3 py-1 rounded text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${viewMode === 'month' ? 'border-blue-500 text-blue-600' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
          <button 
            className={`border px-3 py-1 rounded text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${viewMode === 'year' ? 'border-blue-500 text-blue-600' : ''}`}
            onClick={() => setViewMode('year')}
          >
            Year
          </button>
        </div>
      </div>
      {mounted && (
        <Calendar
          onChange={handleDateChange}
          value={value}
          locale="en"
          activeStartDate={new Date(year, month, 1)}
          view={viewMode === 'year' ? 'year' : 'month'}
          navigationLabel={({ date }) => (
            <div className="bg-blue-500 text-white py-2 text-center font-bold w-full">{date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</div>
          )}
          nextLabel={null}        // Ẩn nút ">"
          prevLabel={null}        // Ẩn nút "<"
          next2Label={null}       // Ẩn nút "»"
          prev2Label={null}       // Ẩn nút "«"
          formatShortWeekday={(locale, date) => date.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase()} // Loại bỏ chấm dưới ngày
          tileClassName={({ date, view }) => {
            if (view === 'month' && date.getMonth() !== month) {
              return 'text-gray-400';
            }
            if (view === 'month' && date.toDateString() === currentDate.toDateString()) {
              return 'bg-blue-500 text-white rounded-full';
            }
          }}
        />
      )}
    </div>
  );
}
