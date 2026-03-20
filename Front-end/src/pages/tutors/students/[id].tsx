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
  FileOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Head from "next/head";
import { Student } from "@/types/Students";
import dayjs from "dayjs";
import ScheduleSessionModal from "@/components/ScheduleSessionModal";
import DocumentList from "@/components/Documents/DocumentList";

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

      <div className="p-6 bg-gray-50 min-h-screen">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item>
            <Link href="/tutors" className="hover:text-blue-500 transition-colors">
              <HomeOutlined className="mr-1" />
              <span>Dashboard</span>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/tutors/students" className="hover:text-blue-500 transition-colors">
              <TeamOutlined className="mr-1" />
              <span>My Students</span>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <UserOutlined className="mr-1" />
            <span className="font-medium">{student?.full_name || "Student Profile"}</span>
          </Breadcrumb.Item>
        </Breadcrumb>

        <Spin spinning={loading}>
          {student ? (
            <>
              <Card className="mb-6 shadow-lg rounded-lg overflow-hidden border-0">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div className="relative">
                      <Avatar
                        src={student.profile_picture}
                        icon={<UserOutlined />}
                        size={120}
                        className="border-4 border-white shadow-md"
                      />
                      {student.last_login_time && (
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                          Active
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2 text-gray-800">
                        {student.full_name}
                      </h1>
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
                          <MailOutlined className="mr-2 text-blue-500" />
                          {student.email}
                        </div>
                        {student.phone_number && (
                          <div className="flex items-center text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
                            <PhoneOutlined className="mr-2 text-blue-500" />
                            {student.phone_number}
                          </div>
                        )}
                        {student.created_at && (
                          <div className="flex items-center text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
                            <CalendarOutlined className="mr-2 text-blue-500" />
                            Joined {dayjs(student.created_at).format("MMMM D, YYYY")}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-4">
                        <Button
                          type="primary"
                          icon={<MailOutlined />}
                          onClick={handleMessageStudent}
                          size="large"
                          className="shadow-sm"
                        >
                          Message Student
                        </Button>
                        <Button
                          onClick={() => setScheduleModalVisible(true)}
                          size="large"
                          className="shadow-sm"
                          icon={<CalendarOutlined />}
                        >
                          Schedule Session
                        </Button>
                        {scheduleModalVisible && student && (
                          <ScheduleSessionModal
                            studentId={student.id}
                            onClose={() => setScheduleModalVisible(false)}
                            onSessionScheduled={() => {
                              message.success('Session scheduled successfully!');
                              setScheduleModalVisible(false);
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Tabs
                defaultActiveKey="profile"
                className="shadow-lg bg-white rounded-lg overflow-hidden"
                type="card"
                size="large"
              >
                <TabPane
                  tab={<span className="px-2 py-1"><UserOutlined className="mr-2" />Profile Information</span>}
                  key="profile"
                >
                  <Card bordered={false} className="p-4">
                    <Descriptions
                      title={<span className="text-xl font-semibold text-gray-800">Student Details</span>}
                      bordered
                      column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
                      className="bg-white rounded-lg overflow-hidden"
                      labelStyle={{ fontWeight: 500, backgroundColor: '#f5f8ff' }}
                      contentStyle={{ backgroundColor: 'white' }}
                      size="middle"
                    >
                      <Descriptions.Item label="Full Name" className="font-medium">
                        <span className="font-medium">{student.full_name}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        <a href={`mailto:${student.email}`} className="text-blue-500 hover:underline">{student.email}</a>
                      </Descriptions.Item>
                      <Descriptions.Item label="Phone">
                        {student.phone_number ? (
                          <a href={`tel:${student.phone_number}`} className="text-blue-500 hover:underline">{student.phone_number}</a>
                        ) : (
                          <span className="text-gray-500 italic">Not provided</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Gender">
                        {student.gender ? (
                          <span>{student.gender}</span>
                        ) : (
                          <span className="text-gray-500 italic">Not specified</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Date of Birth">
                        {student.date_of_birth ? (
                          <span>{dayjs(student.date_of_birth).format("MMMM D, YYYY")}</span>
                        ) : (
                          <span className="text-gray-500 italic">Not provided</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Nationality">
                        {student.nationality ? (
                          <span>{student.nationality}</span>
                        ) : (
                          <span className="text-gray-500 italic">Not provided</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Address" span={3}>
                        {student.address ? (
                          <span>{student.address}</span>
                        ) : (
                          <span className="text-gray-500 italic">Not provided</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Login">
                        {student.last_login_time ? (
                          <span className="text-green-600">
                            {dayjs(student.last_login_time).format("MMMM D, YYYY, h:mm A")}
                          </span>
                        ) : (
                          <span className="text-orange-500">Never logged in</span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Account Created">
                        <span>{dayjs(student.created_at).format("MMMM D, YYYY")}</span>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </TabPane>

                <TabPane
                  tab={<span className="px-2 py-1"><FileOutlined className="mr-2" />Documents</span>}
                  key="documents"
                >
                  <Card bordered={false} className="p-4">
                    <DocumentList studentId={student.id || ''} />
                  </Card>
                </TabPane>
              </Tabs>
            </>
          ) : (
            !loading && (
              <Card className="shadow-lg rounded-lg border-0 p-8 text-center">
                <Empty
                  description={<span className="text-lg text-gray-600 font-medium">Student not found</span>}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className="my-8"
                />
                <div className="flex justify-center mt-6">
                  <Button
                    type="primary"
                    size="large"
                    icon={<TeamOutlined />}
                    onClick={() => router.push("/tutors/students")}
                    className="shadow-sm px-6"
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
