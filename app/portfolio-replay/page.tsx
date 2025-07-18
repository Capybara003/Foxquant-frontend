'use client'
import React, { useState, useRef } from 'react';
import { fetchPortfolioReplay } from '../../services/api';
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
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaDownload } from 'react-icons/fa';
import DashboardLayout from '@/components/layout/DashboardLayout';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, ChartTooltip, Legend, TimeScale);

const strategies = [
  { value: 'meanReversionML', label: 'Mean Reversion' },
  { value: 'basicMomentum', label: 'Basic Momentum' },
  { value: 'advancedMomentum', label: 'Advanced Momentum' },
  { value: 'volatilityBreakout', label: 'Volatility Breakout' },
];

const COLORS = [
  '#2563eb', // blue
  '#f59e42', // orange
  '#16a34a', // green
  '#dc2626', // red
  '#a21caf', // purple
  '#eab308', // yellow
  '#0ea5e9', // sky
  '#f43f5e', // pink
];

// Custom marker shapes for Chart.js
const triangleUp = (ctx: any, size: number) => {
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
const triangleDown = (ctx: any, size: number) => {
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

export default function PortfolioReplayPage() {
  const [strategy, setStrategy] = useState('meanReversionML');
  const [symbols, setSymbols] = useState('AAPL');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [replays, setReplays] = useState<any>({}); // { symbol: { replay, error } }
  const [globalStep, setGlobalStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [popover, setPopover] = useState<{ x: number; y: number; content: string } | null>(null);
  const playRef = useRef<any>(null);

  // Dummy: Replace with real auth token logic
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  // Start replay for all symbols
  const handleStartReplay = async () => {
    setLoading(true);
    setError('');
    setReplays({});
    setGlobalStep(0);
    setPlaying(false);
    setPopover(null);
    try {
      const symbolList = symbols.split(',').map(s => s.trim()).filter(Boolean);
      const replayResults: any = {};
      for (const symbol of symbolList) {
        try {
          const data = await fetchPortfolioReplay({ strategy, symbol, from, to, token });
          replayResults[symbol] = { replay: data };
        } catch (err: any) {
          replayResults[symbol] = { error: err.message || 'Failed to fetch replay' };
        }
      }
      setReplays(replayResults);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch replay');
    } finally {
      setLoading(false);
    }
  };

  // Stepper controls (global)
  const handleStep = (dir: number) => {
    if (!Object.keys(replays).length) return;
    const maxSteps = Math.max(...Object.values(replays).map((r: any) => r.replay?.steps?.length || 1));
    setGlobalStep(s => Math.max(0, Math.min(maxSteps - 1, s + dir)));
    setPlaying(false);
    setPopover(null);
  };
  const handlePlayPause = () => {
    setPlaying(p => !p);
  };
  React.useEffect(() => {
    if (playing && Object.keys(replays).length) {
      const maxSteps = Math.max(...Object.values(replays).map((r: any) => r.replay?.steps?.length || 1));
      if (globalStep < maxSteps - 1) {
        playRef.current = setTimeout(() => setGlobalStep(s => s + 1), 500);
      } else {
        setPlaying(false);
      }
    } else {
      clearTimeout(playRef.current);
    }
    return () => clearTimeout(playRef.current);
  }, [playing, globalStep, replays]);

  // Chart data for overlays
  const getOverlayChartData = () => {
    const datasets: any[] = [];
    const allDates: string[] = [];
    Object.entries(replays).forEach(([symbol, { replay }]: any, idx) => {
      if (!replay) return;
      const steps = replay.steps.slice(0, globalStep + 1);
      steps.forEach((s: any) => { if (!allDates.includes(s.date)) allDates.push(s.date); });
    });
    allDates.sort();
    Object.entries(replays).forEach(([symbol, { replay }]: any, idx) => {
      if (!replay) return;
      const steps = replay.steps.slice(0, globalStep + 1);
      // Map steps to allDates (fill with last equity if missing)
      let lastEquity = steps.length ? steps[0].equity : 1;
      const equitySeries = allDates.map(date => {
        const found = steps.find((s: any) => s.date === date);
        if (found) lastEquity = found.equity;
        return lastEquity;
      });
      // Trade markers and annotation arrays
      const pointStyles = steps.map((s: any) =>
        s.action === 'buy' ? triangleUp : s.action === 'sell' ? triangleDown : 'circle'
      );
      const pointColors = steps.map((s: any) =>
        s.action === 'buy' ? '#16a34a' : s.action === 'sell' ? '#dc2626' : COLORS[idx % COLORS.length]
      );
      // Entry/exit lines: collect indices for buy/sell
      const entryIndices = steps.map((s: any, i: number) => s.action === 'buy' ? i : -1).filter((i: number) => i !== -1);
      const exitIndices = steps.map((s: any, i: number) => s.action === 'sell' ? i : -1).filter((i: number) => i !== -1);
      datasets.push({
        label: symbol,
        data: equitySeries,
        borderColor: COLORS[idx % COLORS.length],
        backgroundColor: COLORS[idx % COLORS.length] + '22',
        fill: false,
        tension: 0.2,
        pointRadius: 6,
        pointStyle: pointStyles,
        pointBackgroundColor: pointColors,
        entryIndices,
        exitIndices,
        steps,
      });
    });
    return { labels: allDates, datasets };
  };

  // CSV export handler (all symbols)
  const handleExportCSV = () => {
    const allRows: any[] = [];
    Object.entries(replays).forEach(([symbol, { replay }]: any) => {
      if (!replay) return;
      const headers = ['Symbol', 'Date', 'Price', 'Action', 'Equity', 'Position', 'TradeInfo'];
      const rows = replay.steps.map((s: any) => [
        symbol,
        s.date,
        s.price,
        s.action,
        s.equity,
        s.position,
        s.tradeInfo ? JSON.stringify(s.tradeInfo) : ''
      ]);
      allRows.push([headers, ...rows]);
    });
    const csv = allRows.map((rows: any[]) => rows.map((r: any[]) => r.map((v: any) => `"${v ?? ''}"`).join(',')).join('\n')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio_replay_steps.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Advanced trade annotation popover
  const handleChartClick = (elements: any[], event: any) => {
    if (!elements.length) {
      setPopover(null);
      return;
    }
    const { datasetIndex, index } = elements[0];
    const chartData = getOverlayChartData();
    const dataset = chartData.datasets[datasetIndex];
    const stepData = dataset.steps[index];
    if (stepData.action === 'buy' || stepData.action === 'sell') {
      const rect = event.native.target.getBoundingClientRect();
      setPopover({
        x: event.native.clientX - rect.left,
        y: event.native.clientY - rect.top,
        content: `Symbol: ${dataset.label}\nAction: ${stepData.action.toUpperCase()}\nDate: ${stepData.date}\nPrice: $${stepData.price?.toFixed(2)}\nEquity: ${stepData.equity?.toFixed(2)}\n${stepData.tradeInfo ? 'Trade: ' + JSON.stringify(stepData.tradeInfo) : ''}`,
      });
    } else {
      setPopover(null);
    }
  };

  // Chart options with entry/exit lines and tooltips
  const overlayChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' as const },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx: any) => {
            const dataset = ctx.dataset;
            const idx = ctx.dataIndex;
            const stepData = dataset.steps?.[idx];
            let base = `Equity: ${ctx.parsed.y?.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
            if (stepData) {
              base += ` | Action: ${stepData.action}`;
              if (stepData.tradeInfo) base += ` | Trade: ${JSON.stringify(stepData.tradeInfo)}`;
            }
            return base;
          },
        },
      },
      annotation: false, // We'll draw lines manually
    },
    onClick: (event: any, elements: any[], chart: any) => handleChartClick(elements, event),
    scales: {
      x: { title: { display: true, text: 'Date' }, ticks: { autoSkip: true, maxTicksLimit: 10 } },
      y: { title: { display: true, text: 'Equity' } },
    },
  };

  // Draw entry/exit lines using plugin
  const chartRef = useRef<any>(null);
  React.useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const ctx = chart.ctx;
    chart.update();
    // Remove old lines
    ctx.save();
    ctx.setLineDash([4, 2]);
    ctx.lineWidth = 1;
    Object.values(replays).forEach((r: any, idx: number) => {
      if (!r.replay) return;
      const steps = r.replay.steps.slice(0, globalStep + 1);
      steps.forEach((s: any, i: number) => {
        if (s.action === 'buy' || s.action === 'sell') {
          const meta = chart.getDatasetMeta(idx);
          const x = meta.data[i]?.x;
          if (x !== undefined) {
            ctx.strokeStyle = s.action === 'buy' ? '#16a34a' : '#dc2626';
            ctx.beginPath();
            ctx.moveTo(x, chart.chartArea.top);
            ctx.lineTo(x, chart.chartArea.bottom);
            ctx.stroke();
          }
        }
      });
    });
    ctx.restore();
  }, [replays, globalStep]);

  // Summary stats for all symbols
  const summaryStats = Object.entries(replays).map(([symbol, { replay }]: any) =>
    replay ? (
      <div key={symbol} className="mb-2">
        <span className="font-bold">{symbol}:</span> Final Equity: <span className="font-mono">{replay.summary.finalEquity?.toFixed(2)}</span>,
        Trades: {replay.summary.totalTrades}, Wins: {replay.summary.wins}, Losses: {replay.summary.losses}, Win Rate: {replay.summary.winRate !== null ? Math.round(replay.summary.winRate * 100) + '%' : '-'}
      </div>
    ) : null
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Portfolio Replay Mode</h1>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleStartReplay(); }}>
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
            <label className="block font-medium mb-1">Symbol(s)</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={symbols}
              onChange={e => setSymbols(e.target.value.toUpperCase())}
              placeholder="e.g. AAPL or AAPL,MSFT"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">From</label>
              <input type="date" className="border rounded px-2 py-1 w-full" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">To</label>
              <input type="date" className="border rounded px-2 py-1 w-full" value={to} onChange={e => setTo(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
              {loading ? 'Loading...' : 'Start Replay'}
            </button>
            {Object.keys(replays).length > 0 && (
              <button
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm border border-gray-300"
                onClick={handleExportCSV}
                type="button"
                title="Export replay steps as CSV"
              >
                <FaDownload /> Export CSV
              </button>
            )}
          </div>
        </form>
        <div className="mt-8">
          {error && <div className="text-red-600 mb-4">{error}</div>}
          {Object.keys(replays).length > 0 ? (
            <div>
              <div className="mb-6 relative">
                <Line
                  ref={chartRef}
                  data={getOverlayChartData()}
                  options={overlayChartOptions}
                  height={300}
                />
                {popover && (
                  <div
                    className="absolute z-20 bg-white border border-gray-300 rounded shadow-lg p-3 text-xs"
                    style={{ left: popover.x, top: popover.y, minWidth: 140 }}
                    onClick={() => setPopover(null)}
                  >
                    {popover.content.split('\n').map((line: string, i: number) => <div key={i}>{line}</div>)}
                    <div className="mt-1 text-gray-400">(Click to close)</div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => handleStep(-1)} className="p-2 bg-gray-100 rounded hover:bg-gray-200" disabled={globalStep === 0}><FaStepBackward /></button>
                <button onClick={handlePlayPause} className="p-2 bg-gray-100 rounded hover:bg-gray-200">
                  {playing ? <FaPause /> : <FaPlay />}
                </button>
                <button onClick={() => handleStep(1)} className="p-2 bg-gray-100 rounded hover:bg-gray-200" disabled={globalStep === Math.max(...Object.values(replays).map((r: any) => r.replay?.steps?.length || 1)) - 1}><FaStepForward /></button>
                <span className="ml-4 text-sm">Step {globalStep + 1} / {Math.max(...Object.values(replays).map((r: any) => r.replay?.steps?.length || 1))}</span>
              </div>
              <div className="mt-6 border-t pt-4 text-sm text-gray-600">
                {summaryStats}
              </div>
            </div>
          ) : (
            <div className="border rounded p-6 text-center text-gray-500">Replay chart and stepper will appear here.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 