"use client";
import React from "react";
import { Line } from "react-chartjs-2";
import { ChartOptions, ChartData } from "chart.js";

interface ChartWrapperProps {
  data: any[]; // price data
  results?: number[]; // equity curve or backtest results
}

// DEPRECATED: Use TradingViewCandlestickChart for new charts.
const ChartWrapper: React.FC<ChartWrapperProps> = ({ data, results }) => {
  // For demonstration, use a simple SVG line chart overlay
  // In production, use a charting library like TradingView or Recharts
  // This is a placeholder for overlay logic
  return (
    <div className="bg-white rounded shadow p-4 my-4">
      <div className="text-lg font-bold mb-2">Chart</div>
      {/* Render price chart here (placeholder) */}
      <div className="h-64 w-full bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">[Price Chart Placeholder]</span>
      </div>
      {results && (
        <div className="mt-2 text-green-600">[Backtest Results Overlayed]</div>
      )}
    </div>
  );
};

export default ChartWrapper; 