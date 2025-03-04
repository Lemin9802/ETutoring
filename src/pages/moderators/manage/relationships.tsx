import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Form,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message,
  Spin,
} from "antd";

const { Title } = Typography;

// API-related code and data section
// Types
interface Tutor {
  id: number;
  name: string;
}

interface Student {
  id: number;
  name: string;
}

interface Assignment {
  id: number;
  tutor: string;
  student: string;
  tutorId?: number;
  studentId?: number;
}

// API service functions
const api = {
  // Fetch all tutors
  getTutors: async (): Promise<Tutor[]> => {
    // TODO: Replace with actual API call
    // Example: return await fetch('/api/tutors').then(res => res.json());
    return [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Alice Johnson" },
      { id: 3, name: "Robert Smith" },
    ];
  },

  // Fetch all students
  getStudents: async (): Promise<Student[]> => {
    // TODO: Replace with actual API call
    // Example: return await fetch('/api/students').then(res => res.json());
    return [
      { id: 1, name: "Jane Smith" },
      { id: 2, name: "Michael Brown" },
      { id: 3, name: "Emily Davis" },
    ];
  },

  // Fetch all assignments
  getAssignments: async (): Promise<Assignment[]> => {
    // TODO: Replace with actual API call
    // Example: return await fetch('/api/assignments').then(res => res.json());
    return [
      {
        id: 1,
        tutor: "John Doe",
        student: "Jane Smith",
        tutorId: 1,
        studentId: 1,
      },
    ];
  },

  // Create a new assignment
  createAssignment: async (
    assignment: Omit<Assignment, "id">
  ): Promise<Assignment> => {
    // TODO: Replace with actual API call
    // Example: return await fetch('/api/assignments', { method: 'POST', body: JSON.stringify(assignment) }).then(res => res.json());
    return {
      id: Math.floor(Math.random() * 1000), // Simulating server-generated ID
      ...assignment,
    };
  },

  // Update an existing assignment
  updateAssignment: async (assignment: Assignment): Promise<Assignment> => {
    // TODO: Replace with actual API call
    // Example: return await fetch(`/api/assignments/${assignment.id}`, { method: 'PUT', body: JSON.stringify(assignment) }).then(res => res.json());
    return assignment;
  },

  // Delete an assignment
  //deleteAssignment: async (id: number): Promise<void> => {     //also uncomment line 173
  deleteAssignment: async (): Promise<void> => {
    // TODO: Replace with actual API call
    // Example: return await fetch(`/api/assignments/${id}`, { method: 'DELETE' }).then(res => res.json());
    return Promise.resolve();
  },
};

const RelationshipManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [form] = Form.useForm();

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
      tutor: tutors.find((t) => t.name === record.tutor)?.id,
      student: students.find((s) => s.name === record.student)?.id,
    });
    setEditModalVisible(true);
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tutorsData, studentsData, assignmentsData] = await Promise.all([
          api.getTutors(),
          api.getStudents(),
          api.getAssignments(),
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
  }, []);

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
          // await api.deleteAssignment(record.id);
          setAssignments((prev) =>
            prev.filter((item) => item.id !== record.id)
          );
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
        message.error(
          "Failed to update assignment: Missing required information"
        );
        return;
      }

      try {
        const updatedAssignment = {
          ...selectedAssignment,
          tutor: tutorName,
          student: studentName,
          tutorId: values.tutor,
          studentId: values.student,
        };

        await api.updateAssignment(updatedAssignment);

        setAssignments((prev) =>
          prev.map((item) =>
            item.id === selectedAssignment.id ? updatedAssignment : item
          )
        );

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
  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      // Get names instead of IDs for display
      const tutorName = tutors.find((t) => t.id === values.tutor)?.name;
      const studentName = students.find((s) => s.id === values.student)?.name;

      // Validate that all required fields are present
      if (!tutorName || !studentName) {
        message.error(
          "Failed to create assignment: Missing required information"
        );
        return;
      }

      try {
        // Create new assignment payload
        const assignmentPayload = {
          tutor: tutorName,
          student: studentName,
          tutorId: values.tutor,
          studentId: values.student,
        };

        // Call API to create assignment
        const newAssignment = await api.createAssignment(assignmentPayload);

        // Add to assignments list
        setAssignments([...assignments, newAssignment]);

        // Close modal and show success message
        setIsModalVisible(false);
        message.success("New assignment created successfully!");
      } catch (error) {
        console.error("Error creating assignment:", error);
        message.error("Failed to create assignment. Please try again.");
      }
    });
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
            { title: "Tutor", dataIndex: "tutor", key: "tutor" },
            { title: "Student", dataIndex: "student", key: "student" },
            {
              title: "Actions",
              key: "actions",
              render: (_, record) => (
                <Space>
                  <Button type="link" onClick={() => handleEdit(record)}>
                    Edit
                  </Button>
                  <Button
                    type="link"
                    danger
                    onClick={() => handleRemove(record)}
                  >
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
      <Title level={2}>Tutor-Student Relationship Management</Title>

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
                  {tutor.name}
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
                  {student.name}
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
                  {tutor.name}
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
                  {student.name}
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
