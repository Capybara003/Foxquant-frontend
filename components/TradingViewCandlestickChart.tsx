"use client";
import React, { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  CandlestickData,
  Time,
  CandlestickSeries,
} from "lightweight-charts";

interface Candlestick {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface TradingViewCandlestickChartProps {
  data: Candlestick[];
  height?: number;
  // Remove width prop for responsiveness
}

const chartOptions = {
  layout: {
    background: { type: ColorType.Solid, color: "#181A20" },
    textColor: "#D9D9D9",
  },
  grid: {
    vertLines: { color: "#363C4E", style: 0, visible: true },
    horzLines: { color: "#363C4E", style: 0, visible: true },
  },
  crosshair: {
    mode: 1,
  },
  rightPriceScale: {
    borderColor: "#485C7B",
  },
  timeScale: {
    borderColor: "#485C7B",
    timeVisible: true,
    secondsVisible: false,
  },
};

const TradingViewCandlestickChart: React.FC<TradingViewCandlestickChartProps> = ({ data, height = 400 }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }
    const container = chartContainerRef.current;
    const chart = createChart(container, {
      ...chartOptions,
      height,
      width: container.clientWidth,
    });
    chartRef.current = chart;
    const candleSeries = chart.addSeries(CandlestickSeries, {});
    candleSeries.setData(data as CandlestickData[]);
    chart.timeScale().fitContent();

    // Responsive width with ResizeObserver
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === container) {
          chart.applyOptions({ width: container.clientWidth });
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      chart.remove();
      chartRef.current = null;
      resizeObserver.disconnect();
    };
  }, [data, height]);

  return (
    <div
      ref={chartContainerRef}
      style={{ width: '100%', height: height || 400 }}
      className="rounded-lg shadow-lg border border-gray-700"
    />
  );
};

export default TradingViewCandlestickChart; 