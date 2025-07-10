'use client'

import { useAuthLogic } from '@/hooks/useAuthLogic'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react'

export default function DashboardPage() {
  const { user, isLoading } = useAuthLogic()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

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
      </div>
    </DashboardLayout>
  )
} 