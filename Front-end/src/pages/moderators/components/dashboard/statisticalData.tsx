import { Card, Col, Row, Tooltip, Progress } from "antd";
import React from "react";
import { InfoCircleOutlined } from "@ant-design/icons";

interface StatisticalDataCardProps {
  bgColor?: string;
  cardTitle?: string;
  value: number;
  trend?: number;
  description?: string;
  total?: number;
}

const StatisticalDataCard: React.FC<StatisticalDataCardProps> = ({
  bgColor,
  cardTitle,
  value,
  trend,
  description,
  total
}) => {
  const percentage = total ? Math.round((value / total) * 100) : null;

  return (
    <Col xs={24} sm={12} md={6}>
      <Card
        className={`${bgColor} text-white h-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
        title={
          <div className="w-full flex items-center justify-between">
            <span className="text-white flex-grow">{cardTitle}</span>
            {description && (
              <Tooltip title={description}>
                <InfoCircleOutlined className="text-white text-sm ml-2" />
              </Tooltip>
            )}
          </div>
        }
      >
        <Row justify="center" align="middle" className="flex-col space-y-2">
          <span className="text-4xl font-bold">{value}</span>
          {trend !== undefined && (
            <div className={`text-sm ${trend >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
          {percentage !== null && (
            <Progress
              percent={percentage}
              size="small"
              showInfo={false}
              strokeColor="white"
              trailColor="rgba(255,255,255,0.3)"
              className="w-3/4"
            />
          )}
        </Row>
      </Card>
    </Col>
  );
};

export default StatisticalDataCard;
