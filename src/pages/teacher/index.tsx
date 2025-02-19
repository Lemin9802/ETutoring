import React from "react";
import SmallCalendar from "@/pages/teacher/small-calendar"; 
import MessagesPieChart from '@/pages/teacher/message-dashboard';
import MessagesBarChart from '@/pages/teacher/student-message';
import Timeline from '@/pages/teacher/timeline';
import { Roboto } from "next/font/google";

const funnel = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "700"], 
  display: "swap",
});
const DashboardPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">  
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-8">
        {/* The chart occupies 2 columns in the center */}
        <div className="col-span-1 md:col-span-2 flex justify-center">
          <div className="w-full">
          <div className={funnel.className}>
            <h1 className="text-2xl font-bold mb-4 text-center fontfont">
              Number of Messages in the last 7 Days
            </h1>
          </div>
            <MessagesPieChart />
            <MessagesBarChart />
          </div>
        </div>
        {/* The calendar occupies 1 column on the right */}
        <div className="col-span-1 flex flex-col gap-4">
          <SmallCalendar /> 
          <Timeline />
        </div>
        
      </div>
    </div>
  );
};

export default DashboardPage;
