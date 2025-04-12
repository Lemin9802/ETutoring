import { Card, Statistic, Spin } from "antd";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaExclamationTriangle,
  FaUserTimes,
} from "react-icons/fa";
import { useState, useEffect } from "react";

interface DashboardStats {
  total_students: number;
  total_tutors: number;
  inactive_students: number;
  unassigned_students: number;
}

const Statistics: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats>({
    total_students: 0,
    total_tutors: 0,
    inactive_students: 0,
    unassigned_students: 0
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        // Fetch dashboard statistics
        const dashboardResponse = await fetch("/api/dashboard/get-statictis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (!dashboardResponse.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }

        const dashboardData = await dashboardResponse.json();

        // Fetch unassigned students count
        const unassignedResponse = await fetch("/api/reports/unassigned-students", {
          method: "POST",
        });

        // Fetch inactive students count
        const inactiveResponse = await fetch("/api/reports/inactive-students", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ days: 7 }),
        });

        let unassignedCount = 0;
        let inactiveCount = 0;

        if (unassignedResponse.ok) {
          const unassignedData = await unassignedResponse.json();
          unassignedCount = unassignedData.data?.length || 0;
        }

        if (inactiveResponse.ok) {
          const inactiveData = await inactiveResponse.json();
          inactiveCount = inactiveData.data?.length || 0;
        }

        setStats({
          total_students: dashboardData.total_students || 0,
          total_tutors: dashboardData.total_tutors || 0,
          inactive_students: inactiveCount,
          unassigned_students: unassignedCount
        });
      } catch (error) {
        console.error("Error fetching statistics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <Card className="shadow-lg w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Statistics</h2>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" tip="Loading statistics..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-md">
            <FaUserGraduate className="text-2xl text-blue-500" />
            <Statistic title="Total Students" value={stats.total_students} />
          </div>

          <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-md">
            <FaChalkboardTeacher className="text-2xl text-green-500" />
            <Statistic title="Total Tutors" value={stats.total_tutors} />
          </div>

          <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-md">
            <FaExclamationTriangle className="text-2xl text-yellow-500" />
            <Statistic title="Inactive Students (7 Days)" value={stats.inactive_students} />
          </div>

          <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-md">
            <FaUserTimes className="text-2xl text-red-500" />
            <Statistic title="Unassigned Students" value={stats.unassigned_students} />
          </div>
        </div>
      )}
    </Card>
  );
};

export default Statistics;
