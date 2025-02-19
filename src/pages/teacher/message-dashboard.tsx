'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

const COLORS = ['#E74C3C', '#F28B30', '#F2E638', '#2ECC71', '#3498DB', '#9B59B6', '#F26398'];

interface DataItem {
  name: string;
  value: number;
}

const MessagesPieChart = () => {
  // Specify the type for state data
  const [data, setData] = useState<DataItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const fakeData: DataItem[] = [
        { name: 'Monday', value: 30 },
        { name: 'Tuesday', value: 50 },
        { name: 'Wednesday', value: 20 },
        { name: 'Thursday', value: 40 },
        { name: 'Friday', value: 35 },
        { name: 'Saturday', value: 25 },
        { name: 'Sunday', value: 45 },
      ];
      setData(fakeData);
    };
    fetchData();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg flex flex-col md:flex-row justify-center items-center gap-6 border border-gray-200">
      <div className="w-full md:w-2/3 flex justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={110} label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Note */}
      <div className="w-full md:w-1/3 flex flex-col items-start">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Message Distribution</h2>
        <ul className="space-y-2">
          {data.map((entry, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              <span className="text-gray-600">{entry.name}: {entry.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MessagesPieChart;
