import { Button, Card, Table, Skeleton } from "antd";
import Link from "next/link";
import React, { useState, useEffect } from "react";

interface Student {
  key: number;
  name: string;
  email: string;
  tutor: string;
  lastInteraction: string;
}

const InactiveStudentsPreview: React.FC = () => {
  const [inactiveStudents, setInactiveStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch to ensure consistency
    const fetchStudents = () => {
      const students: Student[] = Array.from({ length: 15 }, (_, i) => ({
        key: i + 1,
        name: `Student ${i + 1}`,
        email: `student${i + 1}@example.com`,
        tutor: `Tutor ${Math.ceil(Math.random() * 5)}`,
        lastInteraction: `${Math.ceil(Math.random() * 14)} days ago`,
      }));

      setInactiveStudents(students);
      setLoading(false);
    };

    fetchStudents();
  }, []);

  // Get the first 3 students for preview
  const previewStudents = inactiveStudents.slice(0, 3);

  // Define table columns
  const columns = [
    { title: "Student", dataIndex: "name", key: "name" },
    { title: "Tutor", dataIndex: "tutor", key: "tutor" },
    {
      title: "Last Interaction",
      dataIndex: "lastInteraction",
      key: "lastInteraction",
      render: (text: string) => <span className="text-red-500">{text}</span>,
    },
  ];

  return (
    <Card className="shadow-lg">
      <h2 className="text-xl font-bold text-gray-800">
        ⚠️ Students with No Interaction
      </h2>
      {loading ? (
        <Skeleton className="mt-4" active />
      ) : (
        <>
          <p className="text-gray-500 mb-4">
            Total: <strong>{inactiveStudents.length}</strong> students have not
            interacted with their tutors recently.
          </p>

          {/* Preview Table (First 3 Students) */}
          <Table
            columns={columns}
            dataSource={previewStudents}
            pagination={false}
            size="small"
          />

          {/* View More Button */}
          <div className="mt-4 text-right">
            <Link href="/admin/users/inactive-students">
              <Button type="primary" danger>
                View Full List
              </Button>
            </Link>
          </div>
        </>
      )}
    </Card>
  );
};

export default InactiveStudentsPreview;
