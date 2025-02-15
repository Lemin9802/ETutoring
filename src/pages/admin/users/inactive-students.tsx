import React, { useState, useEffect } from "react";
import { Table, Checkbox, Button, Space, Pagination, Skeleton } from "antd";
import { ColumnsType } from "antd/es/table";
import { FaEnvelope } from "react-icons/fa";

interface Student {
  key: number;
  name: string;
  email: string;
  tutor: string;
  lastInteraction: string;
}

const InactiveStudentsPage: React.FC = () => {
  // State for Students Data
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API Fetch
    const fetchStudents = () => {
      const students: Student[] = Array.from({ length: 50 }, (_, i) => ({
        key: i + 1,
        name: `Student ${i + 1}`,
        email: `student${i + 1}@example.com`,
        tutor: `Tutor ${(i % 5) + 1}`,
        lastInteraction: `${(i % 14) + 1} days ago`,
      }));

      setAllStudents(students);
      setLoading(false);
    };

    fetchStudents();
  }, []);

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = allStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  // Selection Handler
  const onSelectChange = (selectedRowKeys: React.Key[]) => {
    setSelectedStudents(selectedRowKeys.map(Number));
  };

  // Send Reminder Email
  const sendReminderEmails = () => {
    alert(`Reminder emails sent to ${selectedStudents.length} students.`);
    setSelectedStudents([]); // Clear selection after action
  };

  // Define Table Columns
  const columns: ColumnsType<Student> = [
    {
      title: "Student",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Tutor",
      dataIndex: "tutor",
      key: "tutor",
    },
    {
      title: "Last Interaction",
      dataIndex: "lastInteraction",
      key: "lastInteraction",
      render: (text) => <span className="text-red-500">{text}</span>,
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        ⚠️ Inactive Students
      </h1>

      <div className="bg-white shadow-lg rounded-lg p-6">
        {/* Loading State */}
        {loading ? (
          <Skeleton active />
        ) : (
          <>
            {/* Bulk Actions */}
            <Space className="mb-4 flex justify-between">
              <Checkbox
                onChange={(e) =>
                  setSelectedStudents(
                    e.target.checked ? currentStudents.map((s) => s.key) : []
                  )
                }
                checked={selectedStudents.length === currentStudents.length}
              >
                Select All
              </Checkbox>
              {selectedStudents.length > 0 && (
                <Button
                  type="primary"
                  icon={<FaEnvelope />}
                  onClick={sendReminderEmails}
                >
                  Send Reminder Emails
                </Button>
              )}
            </Space>

            {/* Table */}
            <Table
              columns={columns}
              dataSource={currentStudents}
              rowSelection={{
                selectedRowKeys: selectedStudents,
                onChange: onSelectChange,
              }}
              pagination={false} // Using separate Pagination component
            />

            {/* Pagination Controls */}
            <Pagination
              current={currentPage}
              total={allStudents.length}
              pageSize={studentsPerPage}
              onChange={setCurrentPage}
              className="mt-4 text-center"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default InactiveStudentsPage;
