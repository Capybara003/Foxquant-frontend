'use client'

import { useAuthLogic } from '@/hooks/useAuthLogic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { fetchOrderLogs } from '../../services/api';
import { FaInfoCircle, FaDownload } from 'react-icons/fa';
import { portfolioAPI } from '@/services/api'

interface Position {
  symbol: string;
  qty: string;
  avg_entry_price: string;
  current_price: string;
  market_value: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  side: string;
}

export default function DashboardPage() {
  const { user, isLoading } = useAuthLogic()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Order logs state
  const [orderLogs, setOrderLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');
  const [filter, setFilter] = useState('');
  // Add expanded row state for audit trail
  const [expandedRows, setExpandedRows] = useState<{ [id: string]: boolean }>({});
  const [portfolio, setPortfolio] = useState<any>(null)
  const [portfolioLoading, setPortfolioLoading] = useState(true)
  const [positions, setPositions] = useState<Position[]>([])
  const [positionsLoading, setPositionsLoading] = useState(true)

  useEffect(() => {
    async function loadLogs() {
      setLogsLoading(true);
      setLogsError('');
      try {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || '') : '';
        const logs = await fetchOrderLogs(token);
        // Ensure logs is an array, if not, set empty array
        setOrderLogs(Array.isArray(logs) ? logs : []);
      } catch (err: any) {
        setLogsError(err?.message || 'Failed to fetch order logs');
        setOrderLogs([]); // Set empty array on error
      } finally {
        setLogsLoading(false);
      }
    }
    loadLogs();
  }, []);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await portfolioAPI.getPortfolio()
        setPortfolio(data)
      } catch (error) {
        console.error('Failed to fetch portfolio:', error)
        setPortfolio(null) // Set null on error
      } finally {
        setPortfolioLoading(false)
      }
    }
    if (user) {
      fetchPortfolio()
    }
  }, [user])
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const data = await portfolioAPI.getPositions()
        // Ensure data is an array, if not, set empty array
        setPositions(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch positions:', error)
        setPositions([]) // Set empty array on error
      } finally {
        setPositionsLoading(false)
      }
    }
    if (user) {
      fetchPositions()
    }
  }, [user])

  // Get recent orders (last 3 filled orders)
  const recentOrders = orderLogs
    .filter(log => log.status === 'filled')
    .sort((a, b) => new Date(b.filled_at || b.submitted_at).getTime() - new Date(a.filled_at || a.submitted_at).getTime())
    .slice(0, 3);

  // Get total trades count
  const totalTrades = orderLogs.filter(log => log.status === 'filled').length;

  // CSV export handler
  const handleExportCSV = () => {
    const filtered = orderLogs.filter(log =>
      !filter ||
      (log.symbol && log.symbol.toLowerCase().includes(filter.toLowerCase())) ||
      (log.status && log.status.toLowerCase().includes(filter.toLowerCase()))
    );
    if (!filtered.length) return;
    const headers = ['Symbol', 'Qty', 'Side', 'Type', 'Status', 'Submitted', 'Filled', 'Error'];
    const rows = filtered.map(log => [
      log.symbol,
      log.qty,
      log.side,
      log.type,
      log.status,
      log.submitted_at ? new Date(log.submitted_at).toLocaleString() : '-',
      log.filled_at ? new Date(log.filled_at).toLocaleString() : '-',
      log.error || '-'
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'order_logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-primary-100">Here's your trading overview for today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex flex-wrap items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {portfolioLoading ? 'Loading...' : `$${portfolio?.portfolio_value ? Number(portfolio.portfolio_value).toLocaleString() : '0.00'}`}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Buying Power</p>
                <p className="text-2xl font-bold text-green-600">
                  {portfolioLoading ? 'Loading...' : `$${portfolio?.buying_power ? Number(portfolio.buying_power).toLocaleString() : '0.00'}`}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cash</p>
                <p className="text-2xl font-bold text-gray-900">
                  {portfolioLoading ? 'Loading...' : `$${portfolio?.cash ? Number(portfolio.cash).toLocaleString() : '0.00'}`}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Trades</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logsLoading ? 'Loading...' : totalTrades}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Recent Orders" subtitle="Your latest trading activity">
            <div className="space-y-4">
              {logsLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading recent orders...</p>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No recent orders found</p>
                </div>
              ) : (
                recentOrders.map((order, index) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{order.symbol}</p>
                      <p className="text-sm text-gray-600">{order.side} {order.qty} shares</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${order.side === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                        {order.side === 'buy' ? 'Bought' : 'Sold'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.filled_at ? new Date(order.filled_at).toLocaleString() : new Date(order.submitted_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card title="Portfolio Allocation" subtitle="Your current holdings">
            <div className="space-y-4">
              {positionsLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading positions...</p>
                </div>
              ) : !Array.isArray(positions) || positions.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No positions found</p>
                </div>
              ) : (
                positions.slice(0, 4).map((position, index) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
                  return (
                    <div key={position.symbol} className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center">
                        <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-full mr-3`}></div>
                        <span className="text-sm font-medium">{position.symbol}</span>
                      </div>
                      <span className="text-sm font-medium">${Number(position.market_value).toLocaleString()}</span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Order Logs/Audit Trail Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">Order Logs & Audit Trail
            <span className="text-gray-400 group relative cursor-pointer">
              <FaInfoCircle className="inline-block" />
              <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-black text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                View all orders placed, their status, and any errors. Filter by symbol or status.
              </span>
            </span>
          </h2>
          <div className="mb-2 flex gap-2 items-center">
            <input
              type="text"
              className="border rounded px-2 py-1 text-sm"
              placeholder="Filter by symbol or status..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ maxWidth: 220 }}
            />
            <button
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm border border-gray-300"
              onClick={handleExportCSV}
              type="button"
              title="Export filtered logs as CSV"
            >
              <FaDownload /> Export CSV
            </button>
          </div>
          {logsLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : logsError ? (
            <div className="text-red-600">{logsError}</div>
          ) : orderLogs.length === 0 ? (
            <div className="text-gray-500">No order logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-1">Symbol</th>
                    <th className="px-2 py-1">Qty</th>
                    <th className="px-2 py-1">Side</th>
                    <th className="px-2 py-1">Type</th>
                    <th className="px-2 py-1 flex items-center gap-1">Status
                      <span className="text-gray-400 group relative cursor-pointer">
                        <FaInfoCircle className="inline-block" />
                        <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-32 bg-black text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                          Order status (e.g., filled, canceled, rejected)
                        </span>
                      </span>
                    </th>
                    <th className="px-2 py-1">Submitted</th>
                    <th className="px-2 py-1">Filled</th>
                    <th className="px-2 py-1">Stop-Loss</th>
                    <th className="px-2 py-1 flex items-center gap-1">Error
                      <span className="text-gray-400 group relative cursor-pointer">
                        <FaInfoCircle className="inline-block" />
                        <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-32 bg-black text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                          If the order failed, error details will appear here.
                        </span>
                      </span>
                    </th>
                    <th className="px-2 py-1">Audit Trail</th>
                  </tr>
                </thead>
                <tbody>
                  {orderLogs.filter(log =>
                    !filter ||
                    (log.symbol && log.symbol.toLowerCase().includes(filter.toLowerCase())) ||
                    (log.status && log.status.toLowerCase().includes(filter.toLowerCase()))
                  ).map(log => (
                    <>
                      <tr key={log.id} className="border-t">
                        <td className="px-2 py-1">{log?.symbol}</td>
                        <td className="px-2 py-1">{log?.qty}</td>
                        <td className="px-2 py-1">{log?.side}</td>
                        <td className="px-2 py-1">{log?.type}</td>
                        <td className="px-2 py-1">{log?.status}</td>
                        <td className="px-2 py-1">{log?.submitted_at ? new Date(log.submitted_at).toLocaleString() : '-'}</td>
                        <td className="px-2 py-1">{log?.filled_at ? new Date(log.filled_at).toLocaleString() : '-'}</td>
                        <td className="px-2 py-1">
                          {log?.stopLoss ? (
                            <span className="text-blue-700">
                              {log.stopLoss.stop_price ? `Stop: $${log.stopLoss.stop_price}` : ''}
                              {log.stopLoss.trail_price ? ` Trail: $${log.stopLoss.trail_price}` : ''}
                              {log.stopLoss.trail_percent ? ` Trail %: ${log.stopLoss.trail_percent}` : ''}
                              {log.stopLoss.limit_price ? ` Limit: $${log.stopLoss.limit_price}` : ''}
                              {!log.stopLoss.stop_price && !log.stopLoss.trail_price && !log.stopLoss.trail_percent && !log.stopLoss.limit_price ? 'Yes' : ''}
                            </span>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                        <td className="px-2 py-1 text-red-600">{log?.error || '-'}</td>
                        <td className="px-2 py-1">
                          <button
                            className="text-blue-600 underline text-xs"
                            onClick={() => setExpandedRows(r => ({ ...r, [log.id]: !r[log.id] }))}
                            type="button"
                          >
                            {expandedRows[log.id] ? 'Hide' : 'Show'}
                          </button>
                        </td>
                      </tr>
                      {expandedRows[log.id] && (
                        <tr key={log.id + '-audit'}>
                          <td colSpan={10} className="bg-gray-50 px-4 py-2">
                            <div>
                              <div className="font-semibold mb-1">Audit Trail:</div>
                              {log.auditTrail && log.auditTrail.length > 0 ? (
                                <ul className="list-disc ml-6">
                                  {log.auditTrail.map((item: any) => (
                                    <li key={item.id} className="mb-1">
                                      <span className="font-mono text-xs text-gray-500">{item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</span>{' '}
                                      <span className="font-semibold">{item.type}</span>{' '}
                                      <span className="text-gray-700">{item.status}</span>{' '}
                                      <span className="text-gray-500">{item.message}</span>{' '}
                                      {item.qty && <span className="text-gray-500">Qty: {item.qty}</span>}
                                      {item.price && <span className="text-gray-500"> Price: ${item.price}</span>}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-gray-400">No audit trail found for this order.</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
} 