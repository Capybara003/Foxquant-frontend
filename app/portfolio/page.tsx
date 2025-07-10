'use client'

import { useAuthLogic } from '@/hooks/useAuthLogic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { DollarSign, TrendingUp, PieChart } from 'lucide-react'
import { portfolioAPI } from '@/services/api'

interface PortfolioData {
  balance: number
  accountType: string
}

export default function PortfolioPage() {
  const { user, isLoading } = useAuthLogic()
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)

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

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${portfolio?.balance?.toLocaleString() || '0.00'}
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
                <p className="text-sm font-medium text-gray-600">Today's Gain</p>
                <p className="text-2xl font-bold text-green-600">+$250.00</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Account Type</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {portfolio?.accountType || 'Standard'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Holdings */}
        <Card title="Current Holdings" subtitle="Your active positions">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gain/Loss
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">AAPL</div>
                    <div className="text-sm text-gray-500">Apple Inc.</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$150.00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$175.00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$17,500.00</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-green-600">+$2,500.00</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">GOOGL</div>
                    <div className="text-sm text-gray-500">Alphabet Inc.</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">50</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$2,800.00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$2,750.00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$137,500.00</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-red-600">-$2,500.00</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">TSLA</div>
                    <div className="text-sm text-gray-500">Tesla Inc.</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">25</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$200.00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$230.00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$5,750.00</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-green-600">+$750.00</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Performance Chart */}
        <Card title="Portfolio Performance" subtitle="30-day performance">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart component would go here</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
} 