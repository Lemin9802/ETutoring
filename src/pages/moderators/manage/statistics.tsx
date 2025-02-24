import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  DatePicker,
  Table,
  Tabs,
  Button,
  Tag,
  Space,
} from "antd";
import {
  ScheduleOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BarChartOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import { Column, Pie, Line } from "@ant-design/charts";
import dayjs from "dayjs";
import {
  getMeetings,
  getStudents,
  getTutors,
  MeetingType,
} from "@/lib/api/moderator";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface AnalyticsData {
  meetings: MeetingType[];
  totalStudents: number;
  totalTutors: number;
  metrics: {
    completedMeetings: number;
    cancelledMeetings: number;
    upcomingMeetings: number;
    averageSessionDuration: number;
    onlineSessionPercentage: number;
    offlineSessionPercentage: number;
  };
  trends: {
    dailyMeetings: Array<{ date: string; count: number }>;
    modeDistribution: Array<{ mode: string; count: number }>;
    durationDistribution: Array<{ duration: string; count: number }>;
    topSubjects: Array<{ subject: string; count: number }>;
  };
}

const StatisticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);
  const [activeTab, setActiveTab] = useState("1");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const [meetings, students, tutors] = await Promise.all([
        getMeetings(),
        getStudents(),
        getTutors(),
      ]);

      // Filter meetings within date range
      const filteredMeetings = meetings.filter((meeting) => {
        const meetingDate = dayjs(meeting.scheduled_date);
        return (
          meetingDate.isAfter(dateRange[0]) &&
          meetingDate.isBefore(dateRange[1])
        );
      });

      // Calculate metrics
      const completedMeetings = filteredMeetings.filter(
        (m) => m.status === "completed"
      ).length;
      const cancelledMeetings = filteredMeetings.filter(
        (m) => m.status === "cancelled"
      ).length;
      const upcomingMeetings = filteredMeetings.filter(
        (m) => m.status === "scheduled"
      ).length;

      // Calculate mode distribution
      const onlineMeetings = filteredMeetings.filter(
        (m) => m.mode === "online"
      ).length;
      const totalMeetings = filteredMeetings.length;

      // Process trends data
      const dailyMeetings = processDailyMeetings(filteredMeetings);
      const modeDistribution = [
        { mode: "Online", count: onlineMeetings },
        { mode: "Offline", count: totalMeetings - onlineMeetings },
      ];

      const durationDistribution =
        processDurationDistribution(filteredMeetings);
      const topSubjects = processTopSubjects(filteredMeetings);

      setAnalyticsData({
        meetings: filteredMeetings,
        totalStudents: students.length,
        totalTutors: tutors.length,
        metrics: {
          completedMeetings,
          cancelledMeetings,
          upcomingMeetings,
          averageSessionDuration:
            filteredMeetings.reduce(
              (acc, curr) => acc + curr.duration_minutes,
              0
            ) / filteredMeetings.length,
          onlineSessionPercentage: (onlineMeetings / totalMeetings) * 100,
          offlineSessionPercentage:
            ((totalMeetings - onlineMeetings) / totalMeetings) * 100,
        },
        trends: {
          dailyMeetings,
          modeDistribution,
          durationDistribution,
          topSubjects,
        },
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const processDailyMeetings = (meetings: MeetingType[]) => {
    const dailyCounts = meetings.reduce((acc, meeting) => {
      const date = dayjs(meeting.scheduled_date).format("YYYY-MM-DD");
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    }));
  };

  const processDurationDistribution = (meetings: MeetingType[]) => {
    const durationRanges = {
      "30 min": meetings.filter((m) => m.duration_minutes <= 30).length,
      "60 min": meetings.filter(
        (m) => m.duration_minutes > 30 && m.duration_minutes <= 60
      ).length,
      "90+ min": meetings.filter((m) => m.duration_minutes > 60).length,
    };

    return Object.entries(durationRanges).map(([duration, count]) => ({
      duration,
      count,
    }));
  };

  const processTopSubjects = (meetings: MeetingType[]) => {
    const subjects = meetings.reduce((acc, meeting) => {
      acc[meeting.topic] = (acc[meeting.topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(subjects)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  if (!analyticsData || loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Tutoring Analytics Dashboard</Title>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) =>
              setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
            }
          />
          <Button type="primary" icon={<CloudDownloadOutlined />}>
            Export Report
          </Button>
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <BarChartOutlined /> Overview
            </span>
          }
          key="1"
        >
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Completed Sessions"
                  value={analyticsData.metrics.completedMeetings}
                  prefix={<CheckCircleOutlined className="text-green-500" />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Cancelled Sessions"
                  value={analyticsData.metrics.cancelledMeetings}
                  prefix={<CloseCircleOutlined className="text-red-500" />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Upcoming Sessions"
                  value={analyticsData.metrics.upcomingMeetings}
                  prefix={<ClockCircleOutlined className="text-blue-500" />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Average Duration"
                  value={Math.round(
                    analyticsData.metrics.averageSessionDuration
                  )}
                  suffix="min"
                  prefix={<ScheduleOutlined className="text-purple-500" />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Daily Session Trends">
                <Line
                  data={analyticsData.trends.dailyMeetings}
                  xField="date"
                  yField="count"
                  point={{
                    size: 5,
                    style: {
                      fill: "#5B8FF9",
                      stroke: "#5B8FF9",
                      lineWidth: 2,
                    },
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Session Mode Distribution">
                <Pie
                  data={analyticsData.trends.modeDistribution.map((item) => ({
                    type: item.mode,
                    value: item.count,
                  }))}
                  angleField="value"
                  colorField="type"
                  radius={0.8}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mt-6">
            <Col xs={24} lg={12}>
              <Card title="Session Duration Distribution">
                <Column
                  data={analyticsData.trends.durationDistribution}
                  xField="duration"
                  yField="count"
                  label={{ style: { fill: "#aaa" } }}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Top Subjects">
                <Column
                  data={analyticsData.trends.topSubjects}
                  xField="subject"
                  yField="count"
                  label={{ style: { fill: "#aaa" } }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <TeamOutlined /> Detailed Sessions
            </span>
          }
          key="2"
        >
          <Card>
            <Table
              dataSource={analyticsData.meetings}
              columns={[
                {
                  title: "Date",
                  dataIndex: "scheduled_date",
                  key: "scheduled_date",
                  render: (date) => dayjs(date).format("YYYY-MM-DD"),
                },
                {
                  title: "Time",
                  dataIndex: "scheduled_time",
                  key: "scheduled_time",
                },
                {
                  title: "Duration",
                  dataIndex: "duration_minutes",
                  key: "duration_minutes",
                  render: (mins) => `${mins} min`,
                },
                {
                  title: "Topic",
                  dataIndex: "topic",
                  key: "topic",
                },
                {
                  title: "Mode",
                  dataIndex: "mode",
                  key: "mode",
                  render: (mode) => (
                    <Tag color={mode === "online" ? "blue" : "green"}>
                      {mode.toUpperCase()}
                    </Tag>
                  ),
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  key: "status",
                  render: (status) => {
                    const statusColors = {
                      completed: "success",
                      cancelled: "error",
                      scheduled: "processing",
                    };
                    return (
                      <Tag
                        color={
                          statusColors[status as keyof typeof statusColors]
                        }
                      >
                        {status.toUpperCase()}
                      </Tag>
                    );
                  },
                },
              ]}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default StatisticsPage;
