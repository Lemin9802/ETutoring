import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  Card,
  Avatar,
  Descriptions,
  Breadcrumb,
  Tabs,
  Spin,
  Button,
  Empty,
  message,
} from "antd";
import {
  UserOutlined,
  HomeOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Head from "next/head";
import { Student } from "@/types/Students";
import dayjs from "dayjs";
import ScheduleSessionModal from "@/components/ScheduleSessionModal";

const { TabPane } = Tabs;

const StudentProfile = () => {
  const router = useRouter();
  const { id } = router.query;
  const [student, setStudent] = useState<Student | null>(null);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const session = useSession();
  const token = session?.data?.user?.accessToken;

  useEffect(() => {
    if (!id) return;

    const fetchStudentDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5142/api/users/profile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id }),
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setStudent(null);
          } else {
            throw new Error(
              `Failed to fetch student details. Status: ${response.status}`
            );
          }
        } else {
          const data = await response.json();
          setStudent(data);
        }
      } catch (error: unknown) {
        console.error("Error fetching student details:", error);
        message.error("Failed to load student details");
        setStudent(null); // Set student to null in case of error
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [id, token]);

  const handleMessageStudent = () => {
    if (!student) return;
    router.push(`/messages?studentId=${student.id}`);
  };

  if (!id) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          {student?.full_name || "Student Profile"} | E-Tutoring Platform
        </title>
        <meta name="description" content="Student profile details" />
      </Head>

      <div className="p-6">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item>
            <Link href="/tutors">
              <HomeOutlined className="mr-1" />
              <span>Dashboard</span>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/tutors/students">
              <TeamOutlined className="mr-1" />
              <span>My Students</span>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <UserOutlined className="mr-1" />
            <span>{student?.full_name || "Student Profile"}</span>
          </Breadcrumb.Item>
        </Breadcrumb>

        <Spin spinning={loading}>
          {student ? (
            <>
              <Card className="mb-6 shadow-md">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <Avatar
                    src={student.profile_picture}
                    icon={<UserOutlined />}
                    size={120}
                  />
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-2">
                      {student.full_name}
                    </h1>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <MailOutlined className="mr-2" />
                        {student.email}
                      </div>
                      {student.phone_number && (
                        <div className="flex items-center text-gray-600">
                          <PhoneOutlined className="mr-2" />
                          {student.phone_number}
                        </div>
                      )}
                      {student.created_at && (
                        <div className="flex items-center text-gray-600">
                          <CalendarOutlined className="mr-2" />
                          Joined{" "}
                          {dayjs(student.created_at).format("MMMM D, YYYY")}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="primary"
                        icon={<MailOutlined />}
                        onClick={handleMessageStudent}
                      >
                        Message Student
                      </Button>
                      <Button onClick={() => setScheduleModalVisible(true)}>Schedule Session</Button>
                      {scheduleModalVisible && student && (
                        <ScheduleSessionModal
                          studentId={student.id}
                          onClose={() => setScheduleModalVisible(false)}
                          onSessionScheduled={() => {
                            // Handle successful session scheduling (e.g., refresh session history)
                            message.success('Session scheduled successfully!');
                            setScheduleModalVisible(false);
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <Tabs
                defaultActiveKey="profile"
                className="shadow-md bg-white rounded-lg"
              >
                <TabPane tab="Profile Information" key="profile">
                  <Card bordered={false}>
                    <Descriptions
                      title="Student Details"
                      bordered
                      column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
                    >
                      <Descriptions.Item label="Full Name">
                        {student.full_name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {student.email}
                      </Descriptions.Item>
                      <Descriptions.Item label="Phone">
                        {student.phone_number || "Not provided"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Gender">
                        {student.gender || "Not specified"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Date of Birth">
                        {student.date_of_birth
                          ? dayjs(student.date_of_birth).format("MMMM D, YYYY")
                          : "Not provided"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Nationality">
                        {student.nationality || "Not provided"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Address" span={3}>
                        {student.address || "Not provided"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Login">
                        {student.last_login_time
                          ? dayjs(student.last_login_time).format(
                            "MMMM D, YYYY, h:mm A"
                          )
                          : "Never logged in"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Account Created">
                        {dayjs(student.created_at).format("MMMM D, YYYY")}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </TabPane>

                <TabPane tab="Learning Progress" key="progress">
                  <Card bordered={false}>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No progress data available yet"
                    />
                  </Card>
                </TabPane>

                <TabPane tab="Session History" key="sessions">
                  <Card bordered={false}>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No session history available"
                    />
                  </Card>
                </TabPane>

                <TabPane tab="Documents" key="documents">
                  <Card bordered={false}>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No documents available"
                    />
                  </Card>
                </TabPane>
              </Tabs>
            </>
          ) : (
            !loading && (
              <Card>
                <Empty
                  description="Student not found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <div className="flex justify-center mt-4">
                  <Button
                    type="primary"
                    onClick={() => router.push("/tutors/students")}
                  >
                    Back to Student List
                  </Button>
                </div>
              </Card>
            )
          )}
        </Spin>
      </div>
    </>
  );
};

export default StudentProfile;
