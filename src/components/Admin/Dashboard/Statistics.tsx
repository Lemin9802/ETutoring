import { Card, Row, Col, Statistic } from "antd";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaExclamationTriangle,
  FaUserTimes,
} from "react-icons/fa";

const Statistics: React.FC = () => {
  return (
    <Card className="shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Statistics</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="Total Students"
            value={1200}
            prefix={<FaUserGraduate />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Total Tutors Assigned"
            value={150}
            prefix={<FaChalkboardTeacher />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Inactive Students (7 Days)"
            value={45}
            prefix={<FaExclamationTriangle />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Unassigned Students"
            value={15}
            prefix={<FaUserTimes />}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default Statistics;
