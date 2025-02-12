import { Row, Typography } from "antd";
// import Title from "antd/es/skeleton/Title";
// import { Metadata } from "next";
import React from "react";
import StatisticalDataCard from "./components/dashboard/statisticalData";

// export const metadata: Metadata = {
//   title: "Next.js Chart | TailAdmin - Next.js Dashboard Template",
//   description:
//     "This is Next.js Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
// };

const DashboardPage: React.FC = () => {
  return (
    <div>
      <Row>
        <Typography.Title level={2}>
          Welcome To Moderator Dashboard Hoang Truong!
        </Typography.Title>
      </Row>
      <Row gutter={16}>
        <StatisticalDataCard bgColor="blue-600" cardTitle="Total Meeting" />
        <StatisticalDataCard bgColor="green-600" cardTitle="Total Staff" />
        <StatisticalDataCard bgColor="red-600" cardTitle="Student Number" />
        <StatisticalDataCard bgColor="yellow-500" cardTitle="Tutor Number" />
      </Row>
    </div>
  );
};

export default DashboardPage;
