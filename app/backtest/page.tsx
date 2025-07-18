"use client";
import React, { useState } from "react";
import { backtestAPI } from "@/services/api";
import dynamic from "next/dynamic";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FaInfoCircle } from 'react-icons/fa';
import TradingViewCandlestickChart from "@/components/TradingViewCandlestickChart";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, zoomPlugin);

const STRATEGIES = [
  { label: "Basic Momentum", value: "basicMomentum", params: [
    { name: "window", label: "Window", type: "number", default: 20, min: 1, desc: "Number of periods for moving average of returns." }
  ] },
  { label: "Advanced Momentum", value: "advancedMomentum", params: [
    { name: "lookback", label: "Lookback", type: "number", default: 20, min: 1, desc: "Number of periods to look back for momentum calculation." },
    { name: "topPercent", label: "Top Percent", type: "number", default: 0.2, min: 0.01, max: 1, step: 0.01, desc: "Fraction of top assets to select based on momentum." }
  ] },
  { label: "Mean Reversion ML", value: "meanReversionML", params: [
    { name: "window", label: "RSI Window", type: "number", default: 14, min: 1, desc: "Number of periods for RSI calculation." },
    { name: "xPct", label: "Bounce % (xPct)", type: "number", default: 0.01, min: 0.001, step: 0.001, desc: "Percent threshold for bounce-back labeling." },
    { name: "yDays", label: "Bounce Window (yDays)", type: "number", default: 5, min: 1, desc: "Number of days to look ahead for bounce-back." },
    { name: "rsiThreshold", label: "RSI Threshold", type: "number", default: 30, min: 1, max: 100, desc: "RSI value below which to consider a buy signal." }
  ] },
  { label: "Volatility Breakout", value: "volatilityBreakout", params: [
    { name: "period", label: "ATR Period", type: "number", default: 14, min: 1, desc: "Number of periods for ATR calculation." },
    { name: "k", label: "k (Multiplier)", type: "number", default: 1.0, min: 0.01, step: 0.01, desc: "Multiplier for ATR to set breakout level." }
  ] },
];

const ChartWrapper = dynamic(() => import("@/components/ChartWrapper"), { ssr: false });

export default function BacktestPage() {
  const [symbol, setSymbol] = useState("SPY");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [strategy, setStrategy] = useState(STRATEGIES[0].value);
  const [paramState, setParamState] = useState<any>({ window: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [chartType, setChartType] = useState<'equity' | 'signal'>("equity");

  const selectedStrategy = STRATEGIES.find(s => s.value === strategy);

  const handleParamChange = (name: string, value: any) => {
    setParamState((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await backtestAPI.runBacktest({
        symbol,
        from,
        to,
        strategy,
        params: paramState,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Backtest failed");
    } finally {
      setLoading(false);
    }
  };

  // Helper for signal chart data
  function getSignalChartData(signal: number[], dates: string[] | undefined) {
    // If signal is binary (0/1 or -1/1), plot as line with 1=buy, -1=sell, 0=hold
    const isBinary = signal.every(v => v === 0 || v === 1 || v === -1);
    const labels = (dates ? dates : signal.map((_, i) => (i + 1).toString()));
    if (isBinary) {
      // Show buy (1), sell (-1), hold (0)
      return {
        labels,
        datasets: [
          {
            label: "Signal (1=Buy, -1=Sell, 0=Hold)",
            data: signal as (number | null)[],
            borderColor: "#f59e42",
            backgroundColor: "rgba(245,158,66,0.1)",
            fill: false,
            tension: 0.2,
            pointRadius: 2,
          },
        ],
      };
    } else {
      // Continuous signal
      return {
        labels,
        datasets: [
          {
            label: "Signal Value",
            data: signal,
            borderColor: "#f59e42",
            backgroundColor: "rgba(245,158,66,0.1)",
            fill: true,
            tension: 0.2,
            pointRadius: 0,
          },
        ],
      };
    }
  }

  // Replace ChartWrapper for Equity Curve with TradingViewCandlestickChart
  // Mock candlestick data for demonstration
  const mockCandles = [
    { time: "2024-06-10", open: 100, high: 110, low: 95, close: 105 },
    { time: "2024-06-11", open: 105, high: 115, low: 100, close: 110 },
    { time: "2024-06-12", open: 110, high: 120, low: 108, close: 115 },
    { time: "2024-06-13", open: 115, high: 125, low: 112, close: 120 },
    { time: "2024-06-14", open: 120, high: 130, low: 118, close: 125 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 px-4 py-8">
        <h1 className="text-4xl font-bold mb-4 text-center tracking-tight">Backtesting</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Symbol</label>
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200"
              value={symbol}
              onChange={e => setSymbol(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Strategy</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200"
              value={strategy}
              onChange={e => {
                setStrategy(e.target.value);
                const strat = STRATEGIES.find(s => s.value === e.target.value);
                const defaults: any = {};
                strat?.params.forEach(p => { defaults[p.name] = p.default; });
                setParamState(defaults);
              }}
            >
              {STRATEGIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700">From Date</label>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200"
              value={from}
              onChange={e => setFrom(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700">To Date</label>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200"
              value={to}
              onChange={e => setTo(e.target.value)}
              required
            />
          </div>
          {selectedStrategy?.params.map(param => (
            <div key={param.name} className="md:col-span-1 relative group">
              <label className="block font-semibold mb-1 text-gray-700 flex items-center gap-1">
                {param.label}
                <span className="relative group">
                  <FaInfoCircle className="text-blue-400 cursor-pointer" />
                  <span className="absolute left-6 top-1 z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 w-56 shadow-lg">
                    {param.desc}
                  </span>
                </span>
              </label>
              <input
                type={param.type}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200"
                value={paramState[param.name] ?? param.default}
                min={param.min}
                max={param.max}
                step={param.step}
                onChange={e => handleParamChange(param.name, param.type === 'number' ? Number(e.target.value) : e.target.value)}
                required
              />
            </div>
          ))}
          <div className="md:col-span-2 flex gap-4 mt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 w-full font-semibold text-lg shadow-sm"
              disabled={loading}
            >
              {loading ? <span className="animate-spin mr-2 inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> : null}
              {loading ? "Running..." : "Run Backtest"}
            </button>
          </div>
          {error && <div className="md:col-span-2 text-red-600 text-center mt-2">{error} <button className="ml-2 underline" onClick={() => setError("")}>Dismiss</button></div>}
        </form>
        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-blue-700">Equity Curve</h2>
              <TradingViewCandlestickChart data={mockCandles} height={300} />
            </div>
            {result.signal && Array.isArray(result.signal) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
                  Signal Chart
                  <button
                    className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => {
                      const rows = [
                        ["Date", "Signal"],
                        ...(result.dates || result.signal.map((_: any, i: number) => i + 1)).map((date: any, i: number) => [date, result.signal[i]])
                      ];
                      const csv = rows.map(r => r.join(",")).join("\n");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `signal_${symbol}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >Export CSV</button>
                </h2>
                <ChartWrapper
                  data={getSignalChartData(result.signal, result.dates)}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: true, position: "top" },
                      tooltip: { enabled: true },
                      zoom: {
                        pan: { mode: "x" },
                        zoom: { mode: "x" },
                      },
                    },
                    scales: {
                      x: {
                        display: true,
                        title: { display: true, text: "Date" },
                        ticks: { autoSkip: true, maxTicksLimit: 10 },
                      },
                      y: {
                        title: { display: true, text: "Signal" },
                        min: -1,
                        max: 1,
                        ticks: {
                          callback: function(value) {
                            if (value === 1) return 'Buy';
                            if (value === -1) return 'Sell';
                            if (value === 0) return 'Hold';
                            return value;
                          }
                        }
                      },
                    },
                    elements: {
                      point: {
                        radius: (ctx: any) => {
                          const v = ctx.raw;
                          if (v === 1) return 6; // Buy
                          if (v === -1) return 6; // Sell
                          if (v === 0) return 3; // Hold
                          return 2;
                        },
                        backgroundColor: (ctx: any) => {
                          const v = ctx.raw;
                          if (v === 1) return '#16a34a'; // Buy - green
                          if (v === -1) return '#dc2626'; // Sell - red
                          if (v === 0) return '#fbbf24'; // Hold - yellow
                          return '#f59e42';
                        },
                      },
                    },
                  }}
                  height={200}
                />
              </div>
            )}
            {result.strategyReturns && Array.isArray(result.strategyReturns) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Strategy Returns</h2>
                <ChartWrapper
                  data={{
                    labels: result.dates || result.strategyReturns.map((_: any, i: number) => i + 1),
                    datasets: [{
                      label: "Strategy Returns",
                      data: result.strategyReturns,
                      borderColor: "#3b82f6",
                      backgroundColor: "rgba(59,130,246,0.1)",
                      fill: true,
                      tension: 0.2,
                      pointRadius: 0,
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: true, position: "top" },
                      tooltip: { enabled: true },
                    },
                    scales: {
                      x: {
                        display: true,
                        title: { display: true, text: "Date" },
                        ticks: { autoSkip: true, maxTicksLimit: 10 },
                      },
                      y: {
                        title: { display: true, text: "Return" },
                      },
                    },
                  }}
                  height={200}
                />
              </div>
            )}
            {result.strategyCumReturns && Array.isArray(result.strategyCumReturns) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Strategy Cumulative Returns</h2>
                <ChartWrapper
                  data={{
                    labels: result.dates || result.strategyCumReturns.map((_: any, i: number) => i + 1),
                    datasets: [{
                      label: "Strategy Cumulative Returns",
                      data: result.strategyCumReturns,
                      borderColor: "#16a34a",
                      backgroundColor: "rgba(22,163,74,0.1)",
                      fill: true,
                      tension: 0.2,
                      pointRadius: 0,
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: true, position: "top" },
                      tooltip: { enabled: true },
                    },
                    scales: {
                      x: {
                        display: true,
                        title: { display: true, text: "Date" },
                        ticks: { autoSkip: true, maxTicksLimit: 10 },
                      },
                      y: {
                        title: { display: true, text: "Cumulative Return" },
                      },
                    },
                  }}
                  height={200}
                />
              </div>
            )}
            {/* Render additional charts for rsi, futureMax, bounceBack, buySignal if present */}
            {result.rsi && Array.isArray(result.rsi) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-blue-700">RSI</h2>
                <ChartWrapper
                  data={{
                    labels: result.dates || result.rsi.map((_: any, i: number) => i + 1),
                    datasets: [{
                      label: "RSI",
                      data: result.rsi,
                      borderColor: "#6366f1",
                      backgroundColor: "rgba(99,102,241,0.1)",
                      fill: true,
                      tension: 0.2,
                      pointRadius: 0,
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: true, position: "top" },
                      tooltip: { enabled: true },
                    },
                    scales: {
                      x: {
                        display: true,
                        title: { display: true, text: "Date" },
                        ticks: { autoSkip: true, maxTicksLimit: 10 },
                      },
                      y: {
                        title: { display: true, text: "RSI" },
                        min: 0,
                        max: 100,
                      },
                    },
                  }}
                  height={200}
                />
              </div>
            )}
            {result.futureMax && Array.isArray(result.futureMax) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Future Max</h2>
                <ChartWrapper
                  data={{
                    labels: result.dates || result.futureMax.map((_: any, i: number) => i + 1),
                    datasets: [{
                      label: "Future Max",
                      data: result.futureMax,
                      borderColor: "#f472b6",
                      backgroundColor: "rgba(244,114,182,0.1)",
                      fill: true,
                      tension: 0.2,
                      pointRadius: 0,
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: true, position: "top" },
                      tooltip: { enabled: true },
                    },
                    scales: {
                      x: {
                        display: true,
                        title: { display: true, text: "Date" },
                        ticks: { autoSkip: true, maxTicksLimit: 10 },
                      },
                      y: {
                        title: { display: true, text: "Future Max" },
                      },
                    },
                  }}
                  height={200}
                />
              </div>
            )}
            {result.bounceBack && Array.isArray(result.bounceBack) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Bounce Back</h2>
                <ChartWrapper
                  data={getSignalChartData(result.bounceBack, result.dates)}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: true, position: "top" },
                      tooltip: { enabled: true },
                    },
                    scales: {
                      x: {
                        display: true,
                        title: { display: true, text: "Date" },
                        ticks: { autoSkip: true, maxTicksLimit: 10 },
                      },
                      y: {
                        title: { display: true, text: "Bounce Back" },
                        min: 0,
                        max: 1,
                        ticks: {
                          callback: function(value) {
                            if (value === 1) return 'Bounce';
                            if (value === 0) return 'No Bounce';
                            return value;
                          }
                        }
                      },
                    },
                  }}
                  height={200}
                />
              </div>
            )}
            {result.buySignal && Array.isArray(result.buySignal) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Buy Signal</h2>
                <ChartWrapper
                  data={getSignalChartData(result.buySignal, result.dates)}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: true, position: "top" },
                      tooltip: { enabled: true },
                    },
                    scales: {
                      x: {
                        display: true,
                        title: { display: true, text: "Date" },
                        ticks: { autoSkip: true, maxTicksLimit: 10 },
                      },
                      y: {
                        title: { display: true, text: "Buy Signal" },
                        min: 0,
                        max: 1,
                        ticks: {
                          callback: function(value) {
                            if (value === 1) return 'Buy';
                            if (value === 0) return 'No Buy';
                            return value;
                          }
                        }
                      },
                    },
                  }}
                  height={200}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 