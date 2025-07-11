'use client'

import { useAuthLogic } from '@/hooks/useAuthLogic'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { DollarSign, TrendingUp, PieChart } from 'lucide-react'
import { portfolioAPI } from '@/services/api'
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  CategoryScale,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { marketAPI } from '@/services/api';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, CategoryScale, zoomPlugin);

interface PortfolioData {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  buying_power: string;
  cash: string;
  portfolio_value: string;
  equity: string;
  last_equity: string;
  multiplier: string;
  long_market_value: string;
  short_market_value: string;
  daytrade_count: number;
  pattern_day_trader: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  created_at: string;
  // ...other Alpaca fields as needed
}

interface Position {
  symbol: string;
  qty: string;
  avg_entry_price: string;
  current_price: string;
  market_value: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  side: string;
  // ...other Alpaca position fields as needed
}

export default function PortfolioPage() {
  const { user, isLoading } = useAuthLogic()
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [positions, setPositions] = useState<Position[]>([])
  const [positionsLoading, setPositionsLoading] = useState(true)
  const [history, setHistory] = useState<{ equity: number[]; timestamp: number[]; cash?: number[] } | null>(null)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyRange, setHistoryRange] = useState<'1W' | '1M' | '3M' | '1Y'>('1M')
  const [showMetric, setShowMetric] = useState<'equity' | 'cash'>('equity')
  const chartRef = useRef<any>(null)
  const [marketSymbol, setMarketSymbol] = useState('AAPL')
  const [marketQuote, setMarketQuote] = useState<any>(null)
  const [marketBars, setMarketBars] = useState<any>(null)
  const [marketLoading, setMarketLoading] = useState(false)
  const [marketError, setMarketError] = useState('')
  const [marketTimeframe, setMarketTimeframe] = useState<'1D'|'1W'|'1M'|'6M'|'1Y'>('1M')

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await portfolioAPI.getPortfolio();
        if (response.ok) {
          const data = await response.json()
          setPortfolio(data)
        }
      } catch (error) {
        console.error('Failed to fetch portfolio:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchPortfolio()
    }
  }, [user])

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const data = await portfolioAPI.getPositions();
        setPositions(data)
      } catch (error) {
        console.error('Failed to fetch positions:', error)
      } finally {
        setPositionsLoading(false)
      }
    }
    if (user) {
      fetchPositions()
    }
  }, [user])

  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true)
      try {
        let timeframe = '1D';
        let period = historyRange;
        if (historyRange === '1W') { timeframe = '1H'; period = '1W'; }
        if (historyRange === '3M') { period = '3M'; }
        if (historyRange === '1Y') { period = '1Y'; }
        const data = await portfolioAPI.getPortfolioHistory({ period, timeframe })
        if (data && data.equity && data.timestamp) {
          setHistory({ equity: data.equity, timestamp: data.timestamp, cash: data.cash })
        }
      } catch (error) {
        console.error('Failed to fetch portfolio history:', error)
      } finally {
        setHistoryLoading(false)
      }
    }
    if (user) {
      fetchHistory()
    }
  }, [user, historyRange])

  useEffect(() => {
    const fetchMarketData = async () => {
      setMarketLoading(true)
      setMarketError('')
      try {
        const quote = await marketAPI.getQuote(marketSymbol)
        let timeframe = '1Day', start
        if (marketTimeframe === '1D') { timeframe = '5Min'; start = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
        if (marketTimeframe === '1W') { timeframe = '15Min'; start = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() }
        if (marketTimeframe === '1M') { timeframe = '1Day'; start = new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString() }
        if (marketTimeframe === '6M') { timeframe = '1Day'; start = new Date(Date.now() - 185 * 24 * 60 * 60 * 1000).toISOString() }
        if (marketTimeframe === '1Y') { timeframe = '1Day'; start = new Date(Date.now() - 370 * 24 * 60 * 60 * 1000).toISOString() }
        const bars = await marketAPI.getBars(marketSymbol, { timeframe, start })
        setMarketQuote(quote)
        setMarketBars(bars)
      } catch (err: any) {
        setMarketError(err.message || 'Failed to fetch market data')
      } finally {
        setMarketLoading(false)
      }
    }
    if (marketSymbol) fetchMarketData()
  }, [marketSymbol, marketTimeframe])

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
            <p className="text-gray-600">Manage your trading portfolio</p>
          </div>
          <Button onClick={() => router.push('/orders/new')}>
            Place Order
          </Button>
        </div>

        {/* Warning for Alpaca 403 error */}
        {marketError && marketError.includes('Alpaca API access forbidden') && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <strong>Warning:</strong> {marketError}
          </div>
        )}

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-center flex-wrap w-full">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${portfolio?.portfolio_value ? Number(portfolio.portfolio_value).toLocaleString() : '0.00'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Buying Power</p>
                <p className="text-2xl font-bold text-green-600">
                  ${portfolio?.buying_power ? Number(portfolio.buying_power).toLocaleString() : '0.00'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Account Status</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {portfolio?.status || 'Unknown'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Account Details */}
        <Card title="Account Details" subtitle="More details from your Alpaca account">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-700">Cash:</span>
              <span className="ml-2">${portfolio?.cash ? Number(portfolio.cash).toLocaleString() : '0.00'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Equity:</span>
              <span className="ml-2">${portfolio?.equity ? Number(portfolio.equity).toLocaleString() : '0.00'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Long Market Value:</span>
              <span className="ml-2">${portfolio?.long_market_value ? Number(portfolio.long_market_value).toLocaleString() : '0.00'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Short Market Value:</span>
              <span className="ml-2">${portfolio?.short_market_value ? Number(portfolio.short_market_value).toLocaleString() : '0.00'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Daytrade Count (last 5 days):</span>
              <span className="ml-2">{portfolio?.daytrade_count ?? '0'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Pattern Day Trader:</span>
              <span className="ml-2">{portfolio?.pattern_day_trader ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Trading Blocked:</span>
              <span className="ml-2">{portfolio?.trading_blocked ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Transfers Blocked:</span>
              <span className="ml-2">{portfolio?.transfers_blocked ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Account Blocked:</span>
              <span className="ml-2">{portfolio?.account_blocked ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Account Created:</span>
              <span className="ml-2">{portfolio?.created_at ? new Date(portfolio.created_at).toLocaleString() : ''}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Currency:</span>
              <span className="ml-2">{portfolio?.currency || 'USD'}</span>
            </div>
          </div>
        </Card>

        {/* Holdings */}
        <Card title="Current Holdings" subtitle="Your active positions">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unrealized P/L</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {positionsLoading ? (
                  <tr><td colSpan={6} className="text-center py-6">Loading...</td></tr>
                ) : positions.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-6">No positions</td></tr>
                ) : (
                  positions.map((pos) => (
                    <tr key={pos.symbol}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pos.symbol}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pos.qty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${Number(pos.avg_entry_price).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${Number(pos.current_price).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${Number(pos.market_value).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={
                          Number(pos.unrealized_pl) >= 0
                            ? "text-sm font-medium text-green-600"
                            : "text-sm font-medium text-red-600"
                        }>
                          {Number(pos.unrealized_pl) >= 0 ? '+' : ''}${Number(pos.unrealized_pl).toLocaleString()}
                          {' '}
                          ({(Number(pos.unrealized_plpc) * 100).toFixed(2)}%)
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Performance Chart */}
        <Card title="Portfolio Performance" subtitle="Performance over time">
          <div className="mb-4 flex gap-2 justify-between items-center">
            <div>
              <button
                className={`px-3 py-1 rounded-full border text-xs font-medium mr-2 ${showMetric === 'equity' ? 'bg-primary-600 text-white' : 'bg-white text-primary-600 border-primary-600'}`}
                onClick={() => setShowMetric('equity')}
              >Equity</button>
              <button
                className={`px-3 py-1 rounded-full border text-xs font-medium ${showMetric === 'cash' ? 'bg-primary-600 text-white' : 'bg-white text-primary-600 border-primary-600'}`}
                onClick={() => setShowMetric('cash')}
              >Cash</button>
            </div>
            <div>
              <button
                className="px-3 py-1 rounded border text-xs font-medium bg-white text-primary-600 border-primary-600 hover:bg-primary-50"
                onClick={() => {
                  if (chartRef.current) {
                    const url = chartRef.current.toBase64Image();
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `portfolio-${showMetric}.png`;
                    a.click();
                  }
                }}
              >
                Download Image
              </button>
            </div>
            <div>
              {['1W', '1M', '3M', '1Y'].map((range) => (
                <button
                  key={range}
                  className={`px-3 py-1 rounded-full border text-xs font-medium ml-2 ${historyRange === range ? 'bg-primary-600 text-white' : 'bg-white text-primary-600 border-primary-600'}`}
                  onClick={() => setHistoryRange(range as any)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            {historyLoading ? (
              <p className="text-gray-500">Loading chart...</p>
            ) : history && history.equity.length > 0 ? (
              <Line
                ref={chartRef}
                data={{
                  labels: history.timestamp.map((ts) => new Date(ts * 1000)),
                  datasets: [
                    {
                      label: 'Equity',
                      data: showMetric === 'equity' ? history.equity : history.cash || [],
                      borderColor: '#6366f1',
                      backgroundColor: (ctx) => {
                        const chart = ctx.chart;
                        const {ctx: c, chartArea} = chart;
                        if (!chartArea) return 'rgba(99,102,241,0.1)';
                        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, 'rgba(99,102,241,0.3)');
                        gradient.addColorStop(1, 'rgba(99,102,241,0.05)');
                        return gradient;
                      },
                      fill: true,
                      tension: 0.3,
                      pointRadius: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => `$${ctx.parsed.y.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                      },
                    },
                    zoom: {
                      pan: { enabled: true, mode: 'x' },
                      zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
                      limits: { x: { min: 'original', max: 'original' } },
                    },
                  },
                  scales: {
                    x: {
                      type: 'time',
                      time: { unit: historyRange === '1W' ? 'day' : 'month', tooltipFormat: 'PP' },
                      ticks: { color: '#6b7280', font: { size: 12 } },
                      grid: { color: '#e5e7eb' },
                    },
                    y: {
                      ticks: { color: '#6b7280', font: { size: 12 }, callback: (v) => `$${v}` },
                      grid: { color: '#e5e7eb' },
                    },
                  },
                }}
              />
            ) : (
              <p className="text-gray-500">No history data</p>
            )}
          </div>
        </Card>

        {/* Market Data */}
        <Card title="Market Data" subtitle="Real-time quote and price chart">
          <div className="mb-4 flex gap-2 items-end">
            <input type="text" value={marketSymbol} onChange={e => setMarketSymbol(e.target.value.toUpperCase())} className="border rounded px-2 py-1" placeholder="Symbol (e.g. AAPL)" style={{width:120}} />
            <select value={marketTimeframe} onChange={e => setMarketTimeframe(e.target.value as any)} className="border rounded px-2 py-1">
              <option value="1D">1D</option>
              <option value="1W">1W</option>
              <option value="1M">1M</option>
              <option value="6M">6M</option>
              <option value="1Y">1Y</option>
            </select>
            {marketLoading && <span className="ml-2 text-xs text-gray-500">Loading...</span>}
            {marketError && <span className="ml-2 text-xs text-red-500">{marketError}</span>}
          </div>
          {marketQuote && marketQuote.quote && (
            <div className="mb-2 flex gap-8 items-center">
              <div>
                <span className="text-xs text-gray-500">Last Price</span>
                <div className="text-lg font-bold">${marketQuote.quote.ap}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Bid</span>
                <div className="text-lg">${marketQuote.quote.bp} x {marketQuote.quote.bs}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Ask</span>
                <div className="text-lg">${marketQuote.quote.ap} x {marketQuote.quote.as}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Timestamp</span>
                <div className="text-xs">{marketQuote.quote.t ? new Date(marketQuote.quote.t).toLocaleString() : '-'}</div>
              </div>
            </div>
          )}
          {marketBars && marketBars.bars && marketBars.bars.length > 0 && (
            <div className="h-64">
              <Line
                data={{
                  labels: marketBars.bars.map((b: any) => new Date(b.t)),
                  datasets: [
                    {
                      label: `${marketSymbol} Close`,
                      data: marketBars.bars.map((b: any) => b.c),
                      borderColor: '#6366f1',
                      backgroundColor: 'rgba(99,102,241,0.1)',
                      fill: true,
                      tension: 0.3,
                      pointRadius: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { type: 'time', time: { unit: 'day', tooltipFormat: 'PP' }, ticks: { color: '#6b7280', font: { size: 12 } }, grid: { color: '#e5e7eb' } },
                    y: { ticks: { color: '#6b7280', font: { size: 12 } }, grid: { color: '#e5e7eb' } },
                  },
                }}
              />
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
} 