import React from "react";
import { Breadcrumb } from "antd";
import SmallCalendar from "@/pages/teacher/small-calendar"; // Đảm bảo đúng đường dẫn

const DashboardPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb className="flex justify-between w-full px-0" separator=">" items={[{ title: "Dashboard" }]} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SmallCalendar />
      </div>
    </div>
  );
};

export default DashboardPage;
