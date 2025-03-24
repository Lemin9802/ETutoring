import { NextPage } from "next";
import Head from "next/head";
import StudentList from "@/components/Tutors/StudentList";
import { Card, Typography, Breadcrumb } from "antd";
import { TeamOutlined, HomeOutlined, UserOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title } = Typography;

const TutorStudentsPage: NextPage = () => (
  <>
    <Head>
      <title>My Students | E-Tutoring Platform</title>
      <meta name="description" content="View and manage your students" />
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
          <TeamOutlined className="mr-1" />
          <span>My Students</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <Title level={2} className="m-0 flex items-center">
          <TeamOutlined className="mr-2" />
          My Students
        </Title>
      </div>

      <Card className="shadow-md border-0 overflow-hidden p-0">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center">
            <UserOutlined className="text-blue-500 mr-2 text-lg" />
            <span className="font-medium">Students Assigned to You</span>
          </div>
          <p className="text-gray-500 text-sm mt-1 mb-0">
            Here you can view and manage all students assigned to you.
          </p>
        </div>
        <StudentList pageSize={10} />
      </Card>
    </div>
  </>
);

export default TutorStudentsPage;
