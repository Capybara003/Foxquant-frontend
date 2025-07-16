"use client";
import React, { useState } from "react";
import { backtestAPI } from "@/services/api";
import { Line } from "react-chartjs-2";
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

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, zoomPlugin);

const STRATEGIES = [
  { label: "Momentum", value: "momentum" },
  { label: "Mean Reversion", value: "mean_reversion" },
  { label: "Breakout", value: "breakout" },
];

export default function BacktestPage() {
  const [symbol, setSymbol] = useState("SPY");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [strategy, setStrategy] = useState(STRATEGIES[0].value);
  const [initialCapital, setInitialCapital] = useState(10000);
  const [risk, setRisk] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [chartType, setChartType] = useState<'equity' | 'drawdown'>("equity");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await backtestAPI.runBacktest({ symbol, from, to });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Backtest failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!result || !result.equityCurve) return;
    const rows = [
      ["Date", "Equity"],
      ...(result.dates || result.equityCurve.map((_: any, i: number) => i + 1)).map((date: any, i: number) => [date, result.equityCurve[i]])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backtest_${symbol}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = () => {
    const chart = document.querySelector('canvas');
    if (chart) {
      const url = (chart as HTMLCanvasElement).toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `backtest_${symbol}.png`;
      a.click();
    }
  };

  // Calculate drawdown if available
  const drawdown = result?.equityCurve
    ? result.equityCurve.reduce((acc: number[], val: number, i: number, arr: number[]) => {
      const max = Math.max(...arr.slice(0, i + 1));
      acc.push(((val - max) / max) * 100);
      return acc;
    }, [])
    : [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Backtesting</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl shadow-lg p-8 mb-8">
          <div>
            <label className="block font-medium mb-1">Symbol</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={symbol}
              onChange={e => setSymbol(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Strategy</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={strategy}
              onChange={e => setStrategy(e.target.value)}
            >
              {STRATEGIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">From Date</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={from}
              onChange={e => setFrom(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">To Date</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={to}
              onChange={e => setTo(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Initial Capital ($)</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={initialCapital}
              min={100}
              step={100}
              onChange={e => setInitialCapital(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Risk (%)</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={risk}
              min={0.1}
              max={100}
              step={0.1}
              onChange={e => setRisk(Number(e.target.value))}
              required
            />
          </div>
          <div className="md:col-span-2 flex gap-4 mt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full"
              disabled={loading}
            >
              {loading ? <span className="animate-spin mr-2 inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> : null}
              {loading ? "Running..." : "Run Backtest"}
            </button>
          </div>
          {error && <div className="md:col-span-2 text-red-600 text-center mt-2">{error} <button className="ml-2 underline" onClick={() => setError("")}>Dismiss</button></div>}
        </form>
        {result && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h2 className="text-2xl font-semibold">Summary</h2>
              <div className="flex gap-2">
                <button onClick={handleExportCSV} className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">Export CSV</button>
                <button onClick={handleExportPNG} className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">Export PNG</button>
              </div>
            </div>
            {result.summary ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Object.entries(result.summary).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded p-3 flex flex-col">
                    <span className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-lg">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>No summary available.</div>
            )}
            <div className="mb-4 flex gap-2">
              <button
                className={`px-3 py-1 rounded ${chartType === 'equity' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setChartType('equity')}
              >
                Equity Curve
              </button>
              <button
                className={`px-3 py-1 rounded ${chartType === 'drawdown' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setChartType('drawdown')}
              >
                Drawdown
              </button>
            </div>
            <div className="bg-white border rounded h-80 flex items-center justify-center text-gray-400">
              {chartType === 'equity' && result.equityCurve && result.equityCurve.length > 0 ? (
                <Line
                  data={{
                    labels: result.dates || result.equityCurve.map((_: unknown, i: number) => i + 1),
                    datasets: [
                      {
                        label: "Cumulative Return",
                        data: result.equityCurve,
                        borderColor: "#2563eb",
                        backgroundColor: "rgba(37,99,235,0.1)",
                        fill: true,
                        tension: 0.2,
                        pointRadius: 0,
                      },
                    ],
                  }}
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
                        title: { display: true, text: "Cumulative Return" },
                      },
                    },
                  }}
                  height={300}
                />
              ) : null}
              {chartType === 'drawdown' && drawdown.length > 0 ? (
                <Line
                  data={{
                    labels: result.dates || drawdown.map((_: unknown, i: number) => i + 1),
                    datasets: [
                      {
                        label: "Drawdown (%)",
                        data: drawdown,
                        borderColor: "#dc2626",
                        backgroundColor: "rgba(220,38,38,0.1)",
                        fill: true,
                        tension: 0.2,
                        pointRadius: 0,
                      },
                    ],
                  }}
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
                        title: { display: true, text: "Drawdown (%)" },
                      },
                    },
                  }}
                  height={300}
                />
              ) : null}
              {((chartType === 'equity' && (!result.equityCurve || result.equityCurve.length === 0)) || (chartType === 'drawdown' && drawdown.length === 0)) && (
                <span>No chart data</span>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 