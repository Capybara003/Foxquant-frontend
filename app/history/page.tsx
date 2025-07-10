'use client'

import { useAuthLogic } from '@/hooks/useAuthLogic'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { historyAPI } from '@/services/api'

interface ActivityItem {
  id: string;
  activity_type: string;
  symbol?: string;
  qty?: string;
  price?: string;
  side?: string;
  date: string;
  status?: string;
  description?: string;
  net_amount?: string;
}

export default function HistoryPage() {
  const { user, isLoading } = useAuthLogic()
  const router = useRouter()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activityType, setActivityType] = useState<string>('')
  const [symbolFilter, setSymbolFilter] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 50
  const isFirstLoad = useRef(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    const fetchActivities = async () => {
      setLoading(true)
      try {
        const params: any = { activity_type: activityType || undefined, start: startDate || undefined, end: endDate || undefined }
        const data = await historyAPI.getTradeHistory(params)
        let filtered = data
        if (symbolFilter) {
          filtered = filtered.filter((item: any) => item.symbol?.toLowerCase().includes(symbolFilter.toLowerCase()))
        }
        setActivities(filtered.slice(0, page * pageSize))
        setHasMore(filtered.length > page * pageSize)
      } catch (error) {
        console.error('Failed to fetch activities:', error)
      } finally {
        setLoading(false)
        isFirstLoad.current = false
      }
    }
    fetchActivities()
  }, [user, activityType, symbolFilter, startDate, endDate, page])

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
            <h1 className="text-2xl font-bold text-gray-900">Trading History</h1>
            <p className="text-gray-600">View your complete trading history</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-wrap gap-4 items-end mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600">Activity Type</label>
              <select value={activityType} onChange={e => { setPage(1); setActivityType(e.target.value) }} className="mt-1 block border-gray-300 rounded-md">
                <option value="">All</option>
                <option value="FILL">Fill</option>
                <option value="DIV">Dividend</option>
                <option value="TRANS">Transfer</option>
                <option value="JNLC">Journal</option>
                <option value="CFEE">Fee</option>
                <option value="ACATC">ACAT Credit</option>
                <option value="ACATS">ACAT Debit</option>
                <option value="CSD">Cash Disbursement</option>
                <option value="CSW">Cash Withdrawal</option>
                <option value="INT">Interest</option>
                <option value="WIRE">Wire</option>
                <option value="REORG">Reorg</option>
                <option value="SPIN">Spin-off</option>
                <option value="MERGER">Merger</option>
                <option value="SPLIT">Split</option>
                <option value="SUB">Subscription</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Symbol</label>
              <input type="text" value={symbolFilter} onChange={e => { setPage(1); setSymbolFilter(e.target.value) }} className="mt-1 block border-gray-300 rounded-md" placeholder="AAPL" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Start Date</label>
              <input type="date" value={startDate} onChange={e => { setPage(1); setStartDate(e.target.value) }} className="mt-1 block border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">End Date</label>
              <input type="date" value={endDate} onChange={e => { setPage(1); setEndDate(e.target.value) }} className="mt-1 block border-gray-300 rounded-md" />
            </div>
          </div>
        </Card>

        {/* History Table */}
        <Card title="Trade Activity History" subtitle="All account activities from Alpaca">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Side</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-6">Loading...</td></tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">No activity history found</td>
                  </tr>
                ) : (
                  activities.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${item.activity_type === 'FILL' ? 'bg-green-100 text-green-800' : item.activity_type === 'DIV' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {item.activity_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.symbol || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.side || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.qty || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.price ? `$${Number(item.price).toFixed(2)}` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.status || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {hasMore && !loading && (
              <div className="flex justify-center mt-4">
                <button className="px-4 py-2 rounded bg-primary-600 text-white" onClick={() => setPage(page + 1)}>Load More</button>
              </div>
            )}
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Trades</p>
              <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Buy Orders</p>
              <p className="text-2xl font-bold text-green-600">
                {activities.filter(item => item.side?.toLowerCase() === 'buy').length}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Sell Orders</p>
              <p className="text-2xl font-bold text-red-600">
                {activities.filter(item => item.side?.toLowerCase() === 'sell').length}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-blue-600">98%</p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 