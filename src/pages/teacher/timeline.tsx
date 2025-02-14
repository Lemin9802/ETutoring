import React from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Timeline } from 'antd';
import { Typography } from 'antd';

const App: React.FC = () => (
  <div className="timeline-container">
    <Typography.Title level={4}>Timeline</Typography.Title>
    <br />
    <Timeline
      items={[
        {
          children: 'Create a services site 2015-09-01',
        },
        {
          children: 'Solve initial network problems 2015-09-01',
        },
        {
          dot: <ClockCircleOutlined className="timeline-clock-icon" />,
          color: 'red',
          children: 'Technical testing 2015-09-01',
        },
        {
          children: 'Network problems being solved 2015-09-01',
        },
      ]}
    />
  </div>
);

export default App;
