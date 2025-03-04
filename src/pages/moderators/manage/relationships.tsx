import React, { useState } from "react";
import {
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Progress,
  Tag,
  Statistic,
  Rate,
  Modal,
  Form,
  Select,
  message,
} from "antd";
import {
  BookOutlined,
  DashboardOutlined,
  RocketOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

// API-related code and data section
// Types
interface Assignment {
  id: number;
  tutor: string;
  student: string;
  subject: string;
  course: string;
  progress: number;
}

interface LearningPath {
  id: number;
  path: string;
  description: string;
  duration: string;
  status: string;
}

interface TutorAvailability {
  id: number;
  tutor: string;
  subjects: string[];
  availability: string;
  currentLoad: string;
}

// Sample data for dropdowns - In a real app, these would come from your API
const tutors = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Alice Johnson" },
  { id: 3, name: "Robert Smith" },
];

const students = [
  { id: 1, name: "Jane Smith" },
  { id: 2, name: "Michael Brown" },
  { id: 3, name: "Emily Davis" },
];

const subjects = [
  { id: 1, name: "Mathematics" },
  { id: 2, name: "Physics" },
  { id: 3, name: "Chemistry" },
  { id: 4, name: "Biology" },
];

const courses = [
  { id: 1, subjectId: 1, name: "Calculus I" },
  { id: 2, subjectId: 1, name: "Algebra" },
  { id: 3, subjectId: 2, name: "Mechanics" },
  { id: 4, subjectId: 2, name: "Electromagnetism" },
  { id: 5, subjectId: 3, name: "Organic Chemistry" },
  { id: 6, subjectId: 4, name: "Molecular Biology" },
];

const performanceData = [
  {
    id: 1,
    student: "Jane Smith",
    subject: "Mathematics",
    attendance: 90,
    completion: 85,
    satisfaction: 4.5,
  },
];

const initialAssignments: Assignment[] = [
  {
    id: 1,
    tutor: "John Doe",
    student: "Jane Smith",
    subject: "Mathematics",
    course: "Calculus I",
    progress: 75,
  },
];

const initialLearningPaths: LearningPath[] = [
  {
    id: 1,
    path: "Advanced Mathematics",
    description: "Comprehensive math curriculum from algebra to calculus",
    duration: "6 months",
    status: "Active",
  },
];

const initialTutorAvailability: TutorAvailability[] = [
  {
    id: 1,
    tutor: "John Doe",
    subjects: ["Mathematics", "Physics"],
    availability: "20 hours/week",
    currentLoad: "15 hours/week",
  },
];

//API functions - To be implemented with real API calls
// const fetchTutors = async () => tutors;
// const fetchStudents = async () => students;
// const fetchSubjects = async () => subjects;
// const fetchCourses = async () => courses;
// const fetchPerformanceData = async () => performanceData;
// const fetchAssignments = async () => initialAssignments;
// const fetchLearningPaths = async () => initialLearningPaths;
// const fetchTutorAvailability = async () => initialTutorAvailability;

const RelationshipManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<{
    id: number;
    tutor: string;
    student: string;
    subject: string;
    course: string;
    progress: number;
  } | null>(null);
  const [form] = Form.useForm();

  // Use the initialAssignments from the API section
  const [assignments, setAssignments] =
    useState<Assignment[]>(initialAssignments);

  // State for filtered courses based on selected subject
  const [filteredCourses, setFilteredCourses] = useState(courses);

  // Handle subject change to filter courses
  const handleSubjectChange = (subjectId: number) => {
    const filtered = courses.filter((course) => course.subjectId === subjectId);
    setFilteredCourses(filtered);
    form.setFieldsValue({ course: undefined }); // Reset course selection
  };

  // Show modal for new assignment
  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
    setFilteredCourses([]);
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Handle edit assignment
  const handleEdit = (record: {
    id: number;
    tutor: string;
    student: string;
    subject: string;
    course: string;
    progress: number;
  }) => {
    setSelectedAssignment(record);
    form.setFieldsValue({
      tutor: tutors.find((t) => t.name === record.tutor)?.id,
      student: students.find((s) => s.name === record.student)?.id,
      subject: subjects.find((s) => s.name === record.subject)?.id,
      course: courses.find((c) => c.name === record.course)?.id,
    });
    setEditModalVisible(true);
  };

  // Handle remove assignment
  const handleRemove = (record: {
    id: number;
    tutor: string;
    student: string;
    subject: string;
    course: string;
    progress: number;
  }) => {
    Modal.confirm({
      title: "Are you sure you want to remove this assignment?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        setAssignments((prev) => prev.filter((item) => item.id !== record.id));
        message.success("Assignment removed successfully");
      },
    });
  };

  // Handle edit submit
  const handleEditSubmit = () => {
    form.validateFields().then((values) => {
      const tutorName = tutors.find((t) => t.id === values.tutor)?.name;
      const studentName = students.find((s) => s.id === values.student)?.name;
      const subjectName = subjects.find((s) => s.id === values.subject)?.name;
      const courseName = courses.find((c) => c.id === values.course)?.name;

      if (!tutorName || !studentName || !subjectName || !courseName) {
        message.error(
          "Failed to update assignment: Missing required information"
        );
        return;
      }

      setAssignments((prev) =>
        prev.map((item) =>
          item.id === selectedAssignment?.id
            ? {
                ...item,
                tutor: tutorName,
                student: studentName,
                subject: subjectName,
                course: courseName,
              }
            : item
        )
      );

      setEditModalVisible(false);
      setSelectedAssignment(null);
      message.success("Assignment updated successfully!");
    });
  };

  // Handle submit for new assignment
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      // Get names instead of IDs for display
      const tutorName = tutors.find((t) => t.id === values.tutor)?.name;
      const studentName = students.find((s) => s.id === values.student)?.name;
      const subjectName = subjects.find((s) => s.id === values.subject)?.name;
      const courseName = courses.find((c) => c.id === values.course)?.name;

      // Validate that all required fields are present
      if (!tutorName || !studentName || !subjectName || !courseName) {
        message.error(
          "Failed to create assignment: Missing required information"
        );
        return;
      }

      // Create new assignment
      const newAssignment = {
        id: assignments.length + 1,
        tutor: tutorName,
        student: studentName,
        subject: subjectName,
        course: courseName,
        progress: 0, // New assignments start at 0% progress
      };

      // Add to assignments list
      setAssignments([...assignments, newAssignment]);

      // Close modal and show success message
      setIsModalVisible(false);
      message.success("New assignment created successfully!");
    });
  };

  // Subject/Course Assignment Management Section
  const AssignmentManagement = () => (
    <Card title="Subject/Course Assignments">
      <Button type="primary" className="mb-4" onClick={showModal}>
        New Assignment
      </Button>
      <Table
        dataSource={assignments}
        rowKey="id"
        columns={[
          { title: "Tutor", dataIndex: "tutor", key: "tutor" },
          { title: "Student", dataIndex: "student", key: "student" },
          { title: "Subject", dataIndex: "subject", key: "subject" },
          { title: "Course", dataIndex: "course", key: "course" },
          {
            title: "Progress",
            dataIndex: "progress",
            key: "progress",
            render: (progress: number) => (
              <Progress percent={progress} size="small" />
            ),
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
    </Card>
  );

  // Progress Tracking Dashboard Section
  const ProgressTracking = () => (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Average Progress"
              value={85}
              suffix="%"
              prefix={<DashboardOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Assignments"
              value={24}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={92}
              suffix="%"
              prefix={<RocketOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Card title="Student Progress Overview" className="mt-4">
        <Table
          dataSource={performanceData}
          rowKey="id"
          columns={[
            { title: "Student", dataIndex: "student", key: "student" },
            { title: "Subject", dataIndex: "subject", key: "subject" },
            {
              title: "Attendance",
              dataIndex: "attendance",
              key: "attendance",
              render: (value: number) => (
                <Progress percent={value} size="small" />
              ),
            },
            {
              title: "Completion",
              dataIndex: "completion",
              key: "completion",
              render: (value: number) => (
                <Progress percent={value} size="small" />
              ),
            },
            {
              title: "Satisfaction",
              dataIndex: "satisfaction",
              key: "satisfaction",
              render: (value: number) => <Rate disabled defaultValue={value} />,
            },
          ]}
        />
      </Card>
    </div>
  );

  // Learning Path Management Section
  const LearningPathManagement = () => (
    <Card title="Learning Paths">
      <Button type="primary" className="mb-4">
        Create Learning Path
      </Button>
      <Table
        dataSource={initialLearningPaths}
        rowKey="id"
        columns={[
          { title: "Path Name", dataIndex: "path", key: "path" },
          {
            title: "Description",
            dataIndex: "description",
            key: "description",
          },
          { title: "Duration", dataIndex: "duration", key: "duration" },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
              <Tag color={status === "Active" ? "green" : "orange"}>
                {status}
              </Tag>
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: () => (
              <Space>
                <Button type="link">Edit</Button>
                <Button type="link">View Details</Button>
                <Button type="link" danger>
                  Delete
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );

  // Resource Allocation Section
  const ResourceAllocation = () => (
    <Card title="Resource Allocation">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Tutor Availability">
            <Table
              dataSource={initialTutorAvailability}
              rowKey="id"
              columns={[
                { title: "Tutor", dataIndex: "tutor", key: "tutor" },
                {
                  title: "Subjects",
                  dataIndex: "subjects",
                  key: "subjects",
                  render: (subjects: string[]) => (
                    <>
                      {subjects.map((subject) => (
                        <Tag key={subject}>{subject}</Tag>
                      ))}
                    </>
                  ),
                },
                {
                  title: "Availability",
                  dataIndex: "availability",
                  key: "availability",
                },
                {
                  title: "Current Load",
                  dataIndex: "currentLoad",
                  key: "currentLoad",
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Resource Utilization">
            <div style={{ textAlign: "center" }}>
              <Progress
                type="circle"
                percent={75}
                format={(percent) => `${percent}% Utilized`}
              />
            </div>
          </Card>
        </Col>
      </Row>
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

          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: "Please select a subject" }]}
          >
            <Select
              placeholder="Select a subject"
              onChange={(value) => handleSubjectChange(value as number)}
            >
              {subjects.map((subject) => (
                <Select.Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="course"
            label="Course"
            rules={[{ required: true, message: "Please select a course" }]}
          >
            <Select
              placeholder="Select a course"
              disabled={filteredCourses.length === 0}
            >
              {filteredCourses.map((course) => (
                <Select.Option key={course.id} value={course.id}>
                  {course.name}
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

          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: "Please select a subject" }]}
          >
            <Select
              placeholder="Select a subject"
              onChange={(value) => handleSubjectChange(value as number)}
            >
              {subjects.map((subject) => (
                <Select.Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="course"
            label="Course"
            rules={[{ required: true, message: "Please select a course" }]}
          >
            <Select
              placeholder="Select a course"
              disabled={filteredCourses.length === 0}
            >
              {filteredCourses.map((course) => (
                <Select.Option key={course.id} value={course.id}>
                  {course.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "1",
            label: (
              <span>
                <BookOutlined />
                Assignments
              </span>
            ),
            children: <AssignmentManagement />,
          },
          {
            key: "2",
            label: (
              <span>
                <DashboardOutlined />
                Progress Tracking
              </span>
            ),
            children: <ProgressTracking />,
          },
          {
            key: "3",
            label: (
              <span>
                <RocketOutlined />
                Learning Paths
              </span>
            ),
            children: <LearningPathManagement />,
          },
          {
            key: "4",
            label: (
              <span>
                <DatabaseOutlined />
                Resource Allocation
              </span>
            ),
            children: <ResourceAllocation />,
          },
        ]}
      />
    </div>
  );
};

export default RelationshipManagement;
