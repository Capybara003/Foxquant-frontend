import React, { useState } from 'react';

interface BacktestFormProps {
  onSubmit: (params: any) => void;
  loading?: boolean;
}

const strategies = [
  { label: 'Basic Momentum', value: 'basicMomentum' },
  { label: 'Advanced Momentum', value: 'advancedMomentum' },
  { label: 'Mean Reversion ML', value: 'meanReversionML' },
  { label: 'Volatility Breakout', value: 'volatilityBreakout' },
];

export default function BacktestForm({ onSubmit, loading }: BacktestFormProps) {
  const [strategy, setStrategy] = useState(strategies[0].value);
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [from, setFrom] = useState('2024-01-01');
  const [to, setTo] = useState('2024-07-01');
  const [window, setWindow] = useState(14);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ strategy, symbol, from, to, params: { window } });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow flex flex-col gap-4 max-w-7xl mx-auto">
      <div>
        <label className="block mb-1 font-medium">Strategy</label>
        <select value={strategy} onChange={e => setStrategy(e.target.value)} className="w-full border rounded p-2">
          {strategies.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Symbol</label>
        <input value={symbol} onChange={e => setSymbol(e.target.value)} className="w-full border rounded p-2" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block mb-1 font-medium">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-full border rounded p-2" />
        </div>
        <div className="flex-1">
          <label className="block mb-1 font-medium">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-full border rounded p-2" />
        </div>
      </div>
      <div>
        <label className="block mb-1 font-medium">Window Size</label>
        <input type="number" value={window} min={1} onChange={e => setWindow(Number(e.target.value))} className="w-full border rounded p-2" />
      </div>
      <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={loading}>
        {loading ? 'Running...' : 'Run Backtest'}
      </button>
    </form>
  );
} 