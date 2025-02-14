import { Card, Statistic } from "antd";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaExclamationTriangle,
  FaUserTimes,
} from "react-icons/fa";

const Statistics: React.FC = () => {
  return (
    <Card className="shadow-lg w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Statistics</h2>

      {/* ✅ Responsive Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-md">
          <FaUserGraduate className="text-2xl text-blue-500" />
          <Statistic title="Total Students" value={1200} />
        </div>

        <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-md">
          <FaChalkboardTeacher className="text-2xl text-green-500" />
          <Statistic title="Total Tutors Assigned" value={150} />
        </div>

        <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-md">
          <FaExclamationTriangle className="text-2xl text-yellow-500" />
          <Statistic title="Inactive Students (7 Days)" value={45} />
        </div>

        <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-md">
          <FaUserTimes className="text-2xl text-red-500" />
          <Statistic title="Unassigned Students" value={15} />
        </div>
      </div>
    </Card>
  );
};

export default Statistics;
