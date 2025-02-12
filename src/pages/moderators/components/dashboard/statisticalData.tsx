import { Card, Col, Image, Row } from "antd";
import React from "react";
import ViewMoreIcon from "public/icons/share/viewInfo.svg";
import Link from "next/link";

interface StatisticalDataCardProps {
  bgColor?: string;
  cardTitle?: string;
}

const StatisticalDataCard: React.FC<StatisticalDataCardProps> = ({
  bgColor,
  cardTitle,
}) => {
  return (
    <Col span={6}>
      <Card
        title={<span style={{ color: "white" }}>{cardTitle}</span>}
        className={`bg-${bgColor} text-white`}
        extra={
          <Link href="#" style={{ color: "white" }}>
            <Image src={ViewMoreIcon} alt={cardTitle} width={20} height={20} />
          </Link>
        }
        style={{ width: 350 }}
      >
        <Row justify={"center"}>
          <span className="text-4xl font-bold">58</span>
        </Row>
      </Card>
    </Col>
  );
};

export default StatisticalDataCard;
