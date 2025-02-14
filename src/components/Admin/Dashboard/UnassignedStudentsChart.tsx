import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register required chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const UnassignedStudentsChart: React.FC = () => {
  // Sample Data
  const data = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
    datasets: [
      {
        label: "Unassigned Students",
        data: [50, 40, 35, 20, 10], // Replace with dynamic API data if needed
        borderColor: "red",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 2,
        pointRadius: 5,
        pointBackgroundColor: "red",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: "⚠️ Unassigned Students Over Time",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Weeks",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Unassigned Students",
        },
        beginAtZero: true,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default UnassignedStudentsChart;
