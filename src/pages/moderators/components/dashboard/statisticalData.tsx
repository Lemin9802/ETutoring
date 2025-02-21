import { Card, Col, Row } from "antd";
import React from "react";

interface StatisticalDataCardProps {
  bgColor?: string;
  cardTitle?: string;
  value: number;
}

const StatisticalDataCard: React.FC<StatisticalDataCardProps> = ({
  bgColor,
  cardTitle,
  value
}) => {
  return (
    <Col xs={24} sm={12} md={6}>
      <Card
        className={`${bgColor} text-white h-full`}
        title={
          <div className="w-full flex items-center justify-between">
            <span className="text-white flex-grow text-center">{cardTitle}</span>
          </div>
        }
      >
        <Row justify="center" align="middle">
          <span className="text-4xl font-bold">{value}</span>
        </Row>
      </Card>
    </Col>
  );
};

export default StatisticalDataCard;
