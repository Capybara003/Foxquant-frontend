'use client'

import { useAuthLogic } from '@/hooks/useAuthLogic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { fetchOrderLogs } from '../../services/api';
import { FaInfoCircle, FaDownload } from 'react-icons/fa';

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

  useEffect(() => {
    async function loadLogs() {
      setLogsLoading(true);
      setLogsError('');
      try {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || '') : '';
        const logs = await fetchOrderLogs(token);
        setOrderLogs(logs);
      } catch (err: any) {
        setLogsError(err?.message || 'Failed to fetch order logs');
      } finally {
        setLogsLoading(false);
      }
    }
    loadLogs();
  }, []);

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
                <p className="text-2xl font-bold text-gray-900">$10,000.00</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Gain</p>
                <p className="text-2xl font-bold text-green-600">+$250.00</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Orders</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
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
                <p className="text-2xl font-bold text-gray-900">127</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Recent Orders" subtitle="Your latest trading activity">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">AAPL</p>
                  <p className="text-sm text-gray-600">Buy 10 shares</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">$1,750.00</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">GOOGL</p>
                  <p className="text-sm text-gray-600">Sell 5 shares</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">$8,250.00</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">TSLA</p>
                  <p className="text-sm text-gray-600">Buy 15 shares</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">$3,450.00</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Portfolio Allocation" subtitle="Your current holdings">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Technology</span>
                </div>
                <span className="text-sm font-medium">45%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Healthcare</span>
                </div>
                <span className="text-sm font-medium">25%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Finance</span>
                </div>
                <span className="text-sm font-medium">20%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Energy</span>
                </div>
                <span className="text-sm font-medium">10%</span>
              </div>
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