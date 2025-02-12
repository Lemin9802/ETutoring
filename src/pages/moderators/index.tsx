import { Breadcrumb } from "antd";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Chart | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const DashboardPage: React.FC = () => {
  return (
    <Breadcrumb
      className="flex justify-between w-full px-0"
      separator=">"
      items={[{ title: "Dashboard Morderator" }]}
    />
  );
};

export default DashboardPage;
