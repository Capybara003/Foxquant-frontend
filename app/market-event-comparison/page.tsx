'use client'
import React, { useState, useRef } from 'react';
import { fetchMarketEventComparison } from '../../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip as ChartTooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { FaInfoCircle, FaDownload } from 'react-icons/fa';
import DashboardLayout from '@/components/layout/DashboardLayout';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, ChartTooltip, Legend, TimeScale, zoomPlugin);

const strategies = [
  { value: 'meanReversionML', label: 'Mean Reversion' },
  { value: 'basicMomentum', label: 'Basic Momentum' },
  { value: 'advancedMomentum', label: 'Advanced Momentum' },
  { value: 'volatilityBreakout', label: 'Volatility Breakout' },
];

// Custom marker shapes for Chart.js
const triangleUp = (ctx: any, size: any) => {
  const { x, y } = ctx;
  ctx.ctx.save();
  ctx.ctx.beginPath();
  ctx.ctx.moveTo(x, y - size);
  ctx.ctx.lineTo(x - size, y + size);
  ctx.ctx.lineTo(x + size, y + size);
  ctx.ctx.closePath();
  ctx.ctx.fill();
  ctx.ctx.restore();
};
const triangleDown = (ctx: any, size: any) => {
  const { x, y } = ctx;
  ctx.ctx.save();
  ctx.ctx.beginPath();
  ctx.ctx.moveTo(x, y + size);
  ctx.ctx.lineTo(x - size, y - size);
  ctx.ctx.lineTo(x + size, y - size);
  ctx.ctx.closePath();
  ctx.ctx.fill();
  ctx.ctx.restore();
};

export default function MarketEventComparisonPage() {
  const [strategy, setStrategy] = useState('meanReversionML');
  const [symbol, setSymbol] = useState('AAPL');
  const [periodA, setPeriodA] = useState({ from: '', to: '' });
  const [periodB, setPeriodB] = useState({ from: '', to: '' });
  const [includeNews, setIncludeNews] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const chartRef = useRef<any>(null);
  const [popover, setPopover] = useState<{ x: number; y: number; content: string } | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const handleCompare = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await fetchMarketEventComparison({
        strategy,
        symbol,
        periodA,
        periodB,
        includeNews,
        token,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch comparison');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!result) return { labels: [], datasets: [] };
    const tradeMarkersA = result.periodA.trades.map((trade: any) =>
      trade.pnl > 0 ? '#16a34a' : trade.pnl < 0 ? '#dc2626' : 'rgba(0,0,0,0)'
    );
    const pointStylesA = result.periodA.trades.map((trade: any) =>
      trade.pnl > 0 ? triangleUp : trade.pnl < 0 ? triangleDown : 'circle'
    );
    const tradeMarkersB = result.periodB.trades.map((trade: any) =>
      trade.pnl > 0 ? '#16a34a' : trade.pnl < 0 ? '#dc2626' : 'rgba(0,0,0,0)'
    );
    const pointStylesB = result.periodB.trades.map((trade: any) =>
      trade.pnl > 0 ? triangleUp : trade.pnl < 0 ? triangleDown : 'circle'
    );
    return {
      labels: result.periodA.dates.length > result.periodB.dates.length ? result.periodA.dates : result.periodB.dates,
      datasets: [
        {
          label: `Period A (${periodA.from} to ${periodA.to})`,
          data: result.periodA.equityCurve,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.1)',
          fill: false,
          tension: 0.2,
          pointRadius: result.periodA.trades.map(() => 6),
          pointBackgroundColor: tradeMarkersA,
          pointHoverRadius: 9,
          pointHoverBackgroundColor: tradeMarkersA,
          pointStyle: pointStylesA,
        },
        {
          label: `Period B (${periodB.from} to ${periodB.to})`,
          data: result.periodB.equityCurve,
          borderColor: '#f59e42',
          backgroundColor: 'rgba(245,158,66,0.1)',
          fill: false,
          tension: 0.2,
          pointRadius: result.periodB.trades.map(() => 6),
          pointBackgroundColor: tradeMarkersB,
          pointHoverRadius: 9,
          pointHoverBackgroundColor: tradeMarkersB,
          pointStyle: pointStylesB,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' as const },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx: any) => {
            const datasetIdx = ctx.datasetIndex;
            const idx = ctx.dataIndex;
            let trade = null;
            if (datasetIdx === 0 && result?.periodA?.trades[idx]) trade = result.periodA.trades[idx];
            if (datasetIdx === 1 && result?.periodB?.trades[idx]) trade = result.periodB.trades[idx];
            let base = `Equity: ${ctx.parsed.y.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
            if (trade) {
              base += ` | Trade: ${trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)} (${trade.pnl > 0 ? 'Win' : trade.pnl < 0 ? 'Loss' : 'Flat'})`;
            }
            return base;
          },
        },
      },
      zoom: {
        pan: { enabled: true, mode: 'x' as const },
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' as const },
        limits: { x: { min: 'original' as const, max: 'original' as const } },
      },
    },
    onClick: (e: any, elements: any[]) => {
      if (!elements.length) {
        setPopover(null);
        return;
      }
      const chart = chartRef.current;
      const { datasetIndex, index } = elements[0];
      let trade = null;
      let date = '';
      if (datasetIndex === 0 && result?.periodA?.trades[index]) {
        trade = result.periodA.trades[index];
        date = result.periodA.dates[index];
      }
      if (datasetIndex === 1 && result?.periodB?.trades[index]) {
        trade = result.periodB.trades[index];
        date = result.periodB.dates[index];
      }
      if (trade) {
        const rect = chart?.canvas?.getBoundingClientRect();
        setPopover({
          x: e.native?.clientX - rect.left,
          y: e.native?.clientY - rect.top,
          content: `Date: ${date}\nP&L: ${trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}\n${trade.pnl > 0 ? 'Win' : trade.pnl < 0 ? 'Loss' : 'Flat'}`,
        });
      } else {
        setPopover(null);
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Date' },
        ticks: { autoSkip: true, maxTicksLimit: 10 },
      },
      y: {
        title: { display: true, text: 'Equity Curve' },
      },
    },
  };

  // Tooltip helpers
  const InfoTooltip = ({ text }: { text: string }) => (
    <span className="ml-1 text-gray-400 group relative cursor-pointer">
      <FaInfoCircle className="inline-block" />
      <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-black text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
        {text}
      </span>
    </span>
  );

  // Download chart as PNG
  const handleDownload = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const a = document.createElement('a');
      a.href = url;
      a.download = `market-event-comparison-${symbol}.png`;
      a.click();
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Market Event Comparison Mode</h1>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleCompare(); }}>
          <div>
            <label className="block font-medium mb-1">Strategy</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={strategy}
              onChange={e => setStrategy(e.target.value)}
            >
              {strategies.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Symbol</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={symbol}
              onChange={e => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. AAPL"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Period A (from - to)</label>
              <div className="flex gap-2">
                <input type="date" className="border rounded px-2 py-1 w-1/2" value={periodA.from} onChange={e => setPeriodA({ ...periodA, from: e.target.value })} />
                <input type="date" className="border rounded px-2 py-1 w-1/2" value={periodA.to} onChange={e => setPeriodA({ ...periodA, to: e.target.value })} />
              </div>
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Period B (from - to)</label>
              <div className="flex gap-2">
                <input type="date" className="border rounded px-2 py-1 w-1/2" value={periodB.from} onChange={e => setPeriodB({ ...periodB, from: e.target.value })} />
                <input type="date" className="border rounded px-2 py-1 w-1/2" value={periodB.to} onChange={e => setPeriodB({ ...periodB, to: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="includeNews" checked={includeNews} onChange={e => setIncludeNews(e.target.checked)} />
            <label htmlFor="includeNews">Include news headlines</label>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? 'Comparing...' : 'Compare'}
          </button>
        </form>
        <div className="mt-8">
          {error && <div className="text-red-600 mb-4">{error}</div>}
          {loading && (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          )}
          {result && !loading ? (
            <div>
              <div className="mb-6 flex items-center gap-4 relative">
                <Line ref={chartRef} data={getChartData()} options={chartOptions} height={300} />
                <button
                  className="ml-2 flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm border border-gray-300"
                  onClick={handleDownload}
                  type="button"
                  title="Download chart as PNG"
                >
                  <FaDownload /> Download
                </button>
                {popover && (
                  <div
                    className="absolute z-20 bg-white border border-gray-300 rounded shadow-lg p-3 text-xs"
                    style={{ left: popover.x, top: popover.y, minWidth: 120 }}
                    onClick={() => setPopover(null)}
                  >
                    {popover.content.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                    <div className="mt-1 text-gray-400">(Click to close)</div>
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 space-y-2">
                  <div className="font-semibold flex items-center">Win/Loss
                    <InfoTooltip text="Number of winning and losing trades in each period. Win rate = wins / total trades." />
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <div className="text-blue-700">A: {result.periodA.winLoss.wins}W / {result.periodA.winLoss.losses}L</div>
                      <div className="text-xs">Win Rate: {Math.round(result.periodA.winLoss.winRate * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-orange-600">B: {result.periodB.winLoss.wins}W / {result.periodB.winLoss.losses}L</div>
                      <div className="text-xs">Win Rate: {Math.round(result.periodB.winLoss.winRate * 100)}%</div>
                    </div>
                  </div>
                  <div className="font-semibold mt-4 flex items-center">Volatility
                    <InfoTooltip text="Standard deviation of daily returns in each period. Higher = more risk." />
                  </div>
                  <div className="flex gap-4">
                    <div className="text-blue-700">A: {result.periodA.volatility?.toFixed(4)}</div>
                    <div className="text-orange-600">B: {result.periodB.volatility?.toFixed(4)}</div>
                  </div>
                  <div className="font-semibold mt-4 flex items-center">Confidence Score
                    <InfoTooltip text="A simple gauge based on win rate and volatility similarity between periods." />
                  </div>
                  <div className="text-lg">{result.confidenceScore?.toFixed(2)}</div>
                </div>
              </div>
              {includeNews && (
                <div className="mt-6">
                  <div className="font-semibold mb-2">News Headlines (not implemented)</div>
                  <div className="text-gray-500 text-sm">News integration coming soon.</div>
                </div>
              )}
            </div>
          ) : !loading && (
            <div className="border rounded p-6 text-center text-gray-500">Comparison results will appear here.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 