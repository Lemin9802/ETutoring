import BlogActivityChart from "@/components/Admin/Dashboard/BlogActivityChart";
import InactiveStudentsPreview from "@/components/Admin/Dashboard/InactiveStudentsPreview";

import Statistics from "@/components/Admin/Dashboard/Statistics";
import UnassignedStudentsChart from "@/components/Admin/Dashboard/UnassignedStudentsChart";
import { Row, Col } from "antd";

const AdminPage = () => {
  return (
    <>
      <Statistics />
      <Row gutter={16}>
        <Col md={12}>
          <InactiveStudentsPreview />
        </Col>
        <Col md={12}>
          <BlogActivityChart />
        </Col>
      </Row>
      <UnassignedStudentsChart />
    </>
  );
};

export default AdminPage;
