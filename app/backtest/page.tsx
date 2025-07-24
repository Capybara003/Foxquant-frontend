"use client";
import React, { useState, useEffect } from "react";
import TradingViewWidget from '@/components/TradingViewWidget';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { backtestAPI } from '@/services/api';
import { marketAPI } from '@/services/api';
import Select from 'react-select';
import ChartWrapper from '@/components/ChartWrapper';

const strategies = [
  { label: 'Basic Momentum', value: 'basicMomentum' },
  { label: 'Advanced Momentum', value: 'advancedMomentum' },
  { label: 'Mean Reversion ML', value: 'meanReversionML' },
  { label: 'Volatility Breakout', value: 'volatilityBreakout' },
];

export default function BacktestPage() {
  const [strategy, setStrategy] = useState('basicMomentum');
  const [symbol, setSymbol] = useState('');
  const [exchange, setExchange] = useState('');
  const [symbols, setSymbols] = useState<{ symbol: string; name: string; exchange: string }[]>([]);
  const [interval, setInterval] = useState('1D');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [window, setWindow] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [symbolOption, setSymbolOption] = useState<{ value: string; label: string; exchange: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    marketAPI.getSymbols().then(data => {
      setSymbols(data);
      setLoading(false)
    }).catch(e => {
      setError(e.message);
      setLoading(false);
    });
  }, []);

  const symbolOptions = symbols.map(s => ({
    value: s.symbol,
    label: `${s.symbol} - ${s.name} (${s.exchange})`,
    exchange: s.exchange
  }));

  const handleSymbolChange = (option: any) => {
    setSymbolOption(option);
    setSymbol(option ? option.value : '');
    setExchange(option ? option.exchange : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await backtestAPI.runBacktest({
        symbol,
        from: startDate,
        to: endDate,
        strategy,
        params: { window },
      });
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Backtest failed');
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Backtest</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-start mb-8 bg-white p-4 rounded shadow">
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Strategy</label>
            <select value={strategy} onChange={e => setStrategy(e.target.value)} className="w-full border rounded p-2">
              {strategies.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          {strategy !== 'basicMomentum' ? (
            <div className="w-full bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
              <strong>Paid Tier:</strong> This strategy is available in the Paid Tier. Demo only.
            </div>
          ) : (
            <>
              <div className="w-full">
                <label className="block text-sm font-medium mb-1">Symbol</label>
                <Select
                  value={symbolOption}
                  onChange={handleSymbolChange}
                  options={symbolOptions}
                  className="max-w-7xl"
                  classNamePrefix="react-select"
                  placeholder="Select a symbol"
                  isClearable
                  required
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium mb-1">Window Size</label>
                <input
                  type="number"
                  value={window}
                  min={1}
                  onChange={e => setWindow(Number(e.target.value))}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? 'Running...' : 'Run Backtest'}
              </button>
            </>
          )}
        </form>
        {symbol && exchange && strategy === 'basicMomentum' && (
          <div className="bg-white rounded shadow p-4 mb-8">
            <TradingViewWidget symbol={`${exchange}:${symbol}`} interval={interval} />
          </div>
        )}
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {result && (
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-semibold mb-2">Backtest Result</h2>
            {result.dates && result.equityCurve && (
              <ChartWrapper
                labels={result.dates}
                results={result.equityCurve}
                title="Equity Curve"
              />
            )}
            {/* <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-sm">{JSON.stringify(result, null, 2)}</pre> */}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 