"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Select } from "antd";
import { Roboto } from "next/font/google";

const funnel = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

const StudentsMessagesStats = () => {
  // Declare data with the appropriate type
  const [data, setData] = useState<{ student: string; messages: number }[]>([]);
  const [filteredData, setFilteredData] = useState<
    { student: string; messages: number }[]
  >([]);

  useEffect(() => {
    // Fake API Data
    const fetchData = async () => {
      const fakeData = [
        { student: "Alice Nguyen", messages: 50 },
        { student: "Bob Tran", messages: 70 },
        { student: "Charlie Le", messages: 40 },
        { student: "David Ho", messages: 65 },
        { student: "Emma Pham", messages: 55 },
      ];
      setData(fakeData);
      setFilteredData(fakeData); // Initialize filteredData with full data
    };
    fetchData();
  }, []);

  const handleFilterChange = (value: string) => {
    let sortedData = [...data];
    if (value === "most") {
      sortedData = sortedData.sort((a, b) => b.messages - a.messages); // Sort descending
    } else if (value === "less") {
      sortedData = sortedData.sort((a, b) => a.messages - b.messages); // Sort ascending
    }
    setFilteredData(sortedData); // Update filteredData with the sorted data
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className={funnel.className}>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Average Messages per Student
        </h2>
      </div>

      {/* Filter Dropdown - Align to the right */}
      <div className="flex justify-end mb-4">
        <Select
          defaultValue="most"
          onChange={handleFilterChange}
          style={{ width: 120 }}
        >
          <Select.Option value="most">Most</Select.Option>
          <Select.Option value="less">Less</Select.Option>
        </Select>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={filteredData}>
            <XAxis dataKey="student" stroke="#555" />
            <YAxis stroke="#555" />
            <Tooltip />
            <Legend />
            <Bar dataKey="messages" fill="#E74C3C" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudentsMessagesStats;
