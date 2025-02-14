import BlogActivityChart from "@/components/Admin/Dashboard/BlogActivityChart";
import InactiveStudentsPreview from "@/components/Admin/Dashboard/InactiveStudentsPreview";

import Statistics from "@/components/Admin/Dashboard/Statistics";
import UnassignedStudentsChart from "@/components/Admin/Dashboard/UnassignedStudentsChart";

const AdminPage = () => {
  return (
    <div className="space-y-6">
      <Statistics />
      <div className="flex flex-col xl:flex-row gap-4 w-full">
        <div className="w-full xl:w-1/2">
          <InactiveStudentsPreview />
        </div>
        <div className="w-full xl:w-1/2">
          <BlogActivityChart />
        </div>
      </div>

      <UnassignedStudentsChart />
    </div>
  );
};

export default AdminPage;
