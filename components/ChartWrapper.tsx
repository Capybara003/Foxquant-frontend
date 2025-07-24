"use client";
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ChartWrapperProps {
  labels: string[];
  results: number[];
  title?: string;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({ labels, results, title }) => {
  const data = {
    labels,
    datasets: [
      {
        label: title || "Equity Curve",
        data: results,
        fill: false,
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
        tension: 0.2,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Date",
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Equity",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded shadow p-4 my-4">
      <div className="text-lg font-bold mb-2">{title || "Equity Curve"}</div>
      <Line data={data} options={options} height={80} />
    </div>
  );
};

export default ChartWrapper; 