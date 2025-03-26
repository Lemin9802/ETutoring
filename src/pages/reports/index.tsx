import React from "react";
import { Tabs, Typography, Card } from "antd";
import { useSession } from "next-auth/react";
import TutorPerformanceReport from "@/components/Reports/TutorPerformanceReport";
import UnassignedStudentsReport from "@/components/Reports/UnassignedStudentsReport";
import InactiveStudentsReport from "@/components/Reports/InactiveStudentsReport";
import Head from "next/head";
// Re-add TabsProps import if needed for typing, but it wasn't used directly
// import type { TabsProps } from "antd";

// Ensure TabPane is not imported or used
const { Title } = Typography;

const ReportsPage: React.FC = () => {
  const { data: session, status } = useSession();

  // Basic check for moderator role - ideally use middleware or layout protection
  if (status === "loading") {
    return <p>Loading session...</p>; // Or a spinner component
  }

  if (
    status === "unauthenticated" ||
    !session?.user?.roles?.includes("Moderator")
  ) {
    return (
      <Card>
        <Title level={3} style={{ color: "red" }}>
          Access Denied
        </Title>
        <p>
          You do not have permission to view this page. Access is restricted to
          Moderators.
        </p>
      </Card>
    );
  }

  return (
    <>
      <Head>
        <title>Reports - ETutoring</title>
      </Head>
      <Title level={2} style={{ marginBottom: "24px" }}>
        System Reports
      </Title>
      <Card>
        {/* Ensure Tabs uses the 'items' prop */}
        <Tabs
          defaultActiveKey="tutor-performance"
          items={[
            {
              label: "Tutor Performance",
              key: "tutor-performance",
              children: <TutorPerformanceReport />,
            },
            {
              label: "Unassigned Students",
              key: "unassigned-students",
              children: <UnassignedStudentsReport />,
            },
            {
              label: "Inactive Students",
              key: "inactive-students",
              children: <InactiveStudentsReport />,
            },
          ]}
          // Ensure no TabPane components are used below
        />
      </Card>
    </>
  );
};

export default ReportsPage;
