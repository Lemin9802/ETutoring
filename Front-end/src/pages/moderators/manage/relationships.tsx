import React, { useState, useEffect } from "react";
import { Button, Card, Form, Modal, Select, Space, Table, Typography, message, Spin } from "antd";
import { useSession } from "next-auth/react";
const { Title } = Typography;

// API-related code and data section
// Types
interface Tutor {
  id: string;
  name: string;
  email?: string;
}

interface Student {
  id: string;
  name: string;
  email?: string;
}

interface Assignment {
  id: string;
  tutor: string;
  student: string;
  tutorId?: string;
  studentId?: string;
  tutorEmail?: string;
  studentEmail?: string;
}

// API service functions
const api = {
  // Fetch all tutors
  getTutors: async (page: number, size: number): Promise<Tutor[]> => {
    try {
      const response = await fetch("/api/moderators/users/get-all-tutors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page, size }),
      });
      const result = await response.json();
      if (response.ok) {
        const users = result.data;
        const data = users.map((user: { full_name: string; id: string; email: string }) => ({
          id: user.id,
          name: user.full_name || user.email,
          email: user.email,
        }));
        return data;
      } else {
        console.error("Error fetching tutors:", result.error);
        return [];
      }
    } catch (error) {
      console.error("Network error:", error);
      return [];
    }
  },

  // Fetch all students
  getStudents: async (page: number, size: number): Promise<Student[]> => {
    try {
      const response = await fetch("/api/moderators/users/get-all-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page, size }),
      });
      const result = await response.json();
      if (response.ok) {
        const users = result.data;
        const data = users.map((user: { full_name: string; id: string; email: string }) => ({
          id: user.id,
          name: user.full_name || user.email,
          email: user.email,
        }));
        return data;
      } else {
        console.error("Error fetching students:", result.error);
        return [];
      }
    } catch (error) {
      console.error("Network error:", error);
      return [];
    }
  },

  // Fetch all assignments
  getAssignments: async (page_number: number, page_size: number): Promise<Assignment[]> => {
    try {
      const response = await fetch("/api/moderators/users/get-all-chatrooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page_number, page_size }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error("Error fetching assignments:", result.message);
        return [];
      }
      return result.data.map(
        (assignment: {
          room_id: number;
          tutor_id: string;
          student_id: string;
          tutor_name: string;
          student_name: string;
          tutor_email?: string;
          student_email?: string;
        }) => ({
          id: assignment.room_id,
          tutorId: assignment.tutor_id,
          studentId: assignment.student_id,
          tutor: assignment.tutor_name,
          student: assignment.student_name,
          tutorEmail: assignment.tutor_email,
          studentEmail: assignment.student_email,
        })
      );
    } catch (error) {
      console.error("Network error:", error);
      return [];
    }
  },

  // Create a new assignment
  createAssignment: async (assignment: {
    tutor_id: string;
    student_id: string;
  }): Promise<Assignment | null> => {
    try {
      const response = await fetch("/api/moderators/users/assign-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignment),
      });
      const result = await response.json();
      return response.ok ? { id: result.id, ...assignment, tutor: "", student: "" } : null;
    } catch (error) {
      console.error("Network error:", error);
      return null;
    }
  },

  // Update an existing assignment
  updateAssignment: async (assignment: Assignment): Promise<Assignment> => {
    try {
      const response = await fetch("/api/moderators/users/update-assignment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_id: assignment.id,
          new_tutor_id: assignment.tutorId,
          new_student_id: assignment.studentId,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        return {
          ...assignment,
          tutorId: result.data.TutorId,
          studentId: result.data.StudentId,
        };
      } else {
        throw new Error(result.message || "Failed to update assignment");
      }
    } catch (error) {
      console.error("Update assignment error:", error);
      throw error;
    }
  },

  // Delete an assignment
  deleteAssignment: async (room_id: string): Promise<void> => {
    try {
      const response = await fetch("/api/moderators/users/delete-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to delete assignment");
      }
    } catch (error) {
      console.error("Delete assignment error:", error);
      throw error;
    }
  },
};

const RelationshipManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [form] = Form.useForm();
  const { data: session } = useSession();

  // State for data and loading
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Show modal for new assignment
  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Handle edit assignment
  const handleEdit = (record: Assignment) => {
    setSelectedAssignment(record);
    form.setFieldsValue({
      tutor: tutors.find((t) => t.id === record.tutorId)?.id,
      student: students.find((s) => s.id === record.studentId)?.id,
    });
    setEditModalVisible(true);
  };

  // Fetch data on component mount
  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tutorsData, studentsData, assignmentsData] = await Promise.all([
          api.getTutors(1, 100),
          api.getStudents(1, 100),
          api.getAssignments(1, 10),
        ]);
        setTutors(tutorsData);
        setStudents(studentsData);
        setAssignments(assignmentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);

  // Handle remove assignment
  const handleRemove = (record: Assignment) => {
    Modal.confirm({
      title: "Are you sure you want to remove this assignment?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await api.deleteAssignment(record.id);
          setAssignments((prev) => prev.filter((item) => item.id !== record.id));
          message.success("Assignment removed successfully");
        } catch (error) {
          console.error("Error removing assignment:", error);
          message.error("Failed to remove assignment. Please try again.");
        }
      },
    });
  };

  // Handle edit submit
  const handleEditSubmit = () => {
    form.validateFields().then(async (values) => {
      const tutorName = tutors.find((t) => t.id === values.tutor)?.name;
      const studentName = students.find((s) => s.id === values.student)?.name;

      if (!tutorName || !studentName || !selectedAssignment) {
        message.error("Failed to update assignment: Missing required information");
        return;
      }

      try {
        const updatedAssignment: Assignment = {
          ...selectedAssignment,
          tutor: tutorName,
          student: studentName,
          tutorId: values.tutor,
          studentId: values.student,
        };

        const response = await api.updateAssignment(updatedAssignment);
        setAssignments((prev) => prev.map((item) => (item.id === selectedAssignment.id ? response : item)));
        setEditModalVisible(false);
        setSelectedAssignment(null);
        message.success("Assignment updated successfully!");
      } catch (error) {
        console.error("Error updating assignment:", error);
        message.error("Failed to update assignment. Please try again.");
      }
    });
  };

  // Handle submit for new assignment
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const tutor = tutors.find((t) => t.id === values.tutor);
      const student = students.find((s) => s.id === values.student);

      if (!tutor || !student) {
        message.error("Please select a valid tutor and student.");
        return;
      }

      const newAssignment = await api.createAssignment({
        tutor_id: tutor.id,
        student_id: student.id,
      });

      if (newAssignment) {
        setAssignments([...assignments, { ...newAssignment, tutor: tutor.name, student: student.name }]);
        message.success("Assignment created successfully!");
        setIsModalVisible(false);
        form.resetFields();
      } else {
        message.error("Failed to create assignment.");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      message.error("An error occurred. Please try again.");
    }
  };

  // Subject/Course Assignment Management Section
  const AssignmentManagement = () => (
    <Card title="Subject/Course Assignments">
      <Button type="primary" className="mb-4" onClick={showModal}>
        New Assignment
      </Button>
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          dataSource={assignments}
          rowKey="id"
          columns={[
            {
              title: "Tutor",
              key: "tutor",
              render: (_, record) => record.tutor || record.tutorEmail || "N/A",
            },
            {
              title: "Student",
              key: "student",
              render: (_, record) => record.student || record.studentEmail || "N/A",
            },
            {
              title: "Actions",
              key: "actions",
              render: (_, record) => (
                <Space>
                  <Button type="link" onClick={() => handleEdit(record)}>
                    Edit
                  </Button>
                  <Button type="link" danger onClick={() => handleRemove(record)}>
                    Remove
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      )}
    </Card>
  );

  return (
    <div className="p-6">
      <Title level={2}>Tutor-Student Chatting Rooms Management</Title>

      {/* Edit Assignment Modal */}
      <Modal
        title="Edit Assignment"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedAssignment(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setEditModalVisible(false);
              setSelectedAssignment(null);
            }}
          >
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleEditSubmit}>
            Save Changes
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="tutor"
            label="Tutor"
            rules={[{ required: true, message: "Please select a tutor" }]}
          >
            <Select placeholder="Select a tutor">
              {tutors.map((tutor) => (
                <Select.Option key={tutor.id} value={tutor.id}>
                  {tutor.name || tutor.email}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="student"
            label="Student"
            rules={[{ required: true, message: "Please select a student" }]}
          >
            <Select placeholder="Select a student">
              {students.map((student) => (
                <Select.Option key={student.id} value={student.id}>
                  {student.name || student.email}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* New Assignment Modal */}
      <Modal
        title="Create New Assignment"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            Create Assignment
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="tutor"
            label="Tutor"
            rules={[{ required: true, message: "Please select a tutor" }]}
          >
            <Select placeholder="Select a tutor">
              {tutors.map((tutor) => (
                <Select.Option key={tutor.id} value={tutor.id}>
                  {tutor.name || tutor.email}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="student"
            label="Student"
            rules={[{ required: true, message: "Please select a student" }]}
          >
            <Select placeholder="Select a student">
              {students.map((student) => (
                <Select.Option key={student.id} value={student.id}>
                  {student.name || student.email}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <AssignmentManagement />
    </div>
  );
};

export default RelationshipManagement;
