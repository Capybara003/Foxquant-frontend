"use client";
import React from "react";
import { Line } from "react-chartjs-2";
import { ChartOptions, ChartData } from "chart.js";

interface ChartWrapperProps {
  data: ChartData<"line">;
  options: ChartOptions<"line">;
  height?: number;
}

// DEPRECATED: Use TradingViewCandlestickChart for new charts.
export default function ChartWrapper({ data, options, height = 300 }: ChartWrapperProps) {
  return <Line data={data} options={options} height={height} />;
} 