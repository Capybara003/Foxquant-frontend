'use client'

import { useAuthLogic } from '@/hooks/useAuthLogic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { historyAPI } from '@/services/api'

interface HistoryItem {
  id: string
  symbol: string
  qty: number
  type: string
  status: string
  createdAt: string
}

export default function HistoryPage() {
  const { user, isLoading } = useAuthLogic()
  const router = useRouter()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await historyAPI.getHistory();
        if (response.ok) {
          const data = await response.json()
          setHistory(data)
        }
      } catch (error) {
        console.error('Failed to fetch history:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchHistory()
    }
  }, [user])

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

        {/* History Table */}
        <Card title="Trade History" subtitle="Your completed trades">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No trading history found
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.type.toLowerCase() === 'buy' ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.type.toLowerCase() === 'buy'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {item.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.qty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Trades</p>
              <p className="text-2xl font-bold text-gray-900">{history.length}</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Buy Orders</p>
              <p className="text-2xl font-bold text-green-600">
                {history.filter(item => item.type.toLowerCase() === 'buy').length}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Sell Orders</p>
              <p className="text-2xl font-bold text-red-600">
                {history.filter(item => item.type.toLowerCase() === 'sell').length}
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