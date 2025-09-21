'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Users, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import { formatCurrency } from '@/lib/utils'

interface PurchaseData {
  month: string
  purchases: number
  amount: number
}

interface TopFarmer {
  farmer_name: string
  total_orders: number
  total_spent: number
}

export function PurchaseChart() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('6months')
  const [purchaseData, setPurchaseData] = useState<PurchaseData[]>([])
  const [topFarmers, setTopFarmers] = useState<TopFarmer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchPurchaseData()
    }
  }, [user, timeRange])

  const fetchPurchaseData = async () => {
    setIsLoading(true)

    try {
      // Get date range based on selection
      const now = new Date()
      let startDate = new Date()
      
      switch (timeRange) {
        case '3months':
          startDate.setMonth(now.getMonth() - 3)
          break
        case '6months':
          startDate.setMonth(now.getMonth() - 6)
          break
        case '1year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          startDate.setMonth(now.getMonth() - 6)
      }

      // Fetch purchase data
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          farmer:users!orders_farmer_id_fkey(*),
          product:products(*)
        `)
        .eq('trader_id', user.id)
        .eq('status', 'delivered')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (orders) {
        // Group by month
        const monthlyData = new Map<string, { purchases: number; amount: number }>()
        
        orders.forEach(order => {
          const month = new Date(order.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          })
          
          if (!monthlyData.has(month)) {
            monthlyData.set(month, { purchases: 0, amount: 0 })
          }
          
          const data = monthlyData.get(month)!
          data.purchases += 1
          data.amount += order.total_amount || 0
        })

        const formattedData = Array.from(monthlyData.entries()).map(([month, data]) => ({
          month,
          purchases: data.purchases,
          amount: data.amount,
        }))

        setPurchaseData(formattedData)

        // Get top farmers
        const farmerMap = new Map<string, { total_orders: number; total_spent: number }>()
        
        orders.forEach(order => {
          const farmerName = order.farmer?.name || 'Unknown'
          
          if (!farmerMap.has(farmerName)) {
            farmerMap.set(farmerName, { total_orders: 0, total_spent: 0 })
          }
          
          const data = farmerMap.get(farmerName)!
          data.total_orders += 1
          data.total_spent += order.total_amount || 0
        })

        const topFarmersData = Array.from(farmerMap.entries())
          .map(([farmer_name, data]) => ({
            farmer_name,
            total_orders: data.total_orders,
            total_spent: data.total_spent,
          }))
          .sort((a, b) => b.total_spent - a.total_spent)
          .slice(0, 5)

        setTopFarmers(topFarmersData)
      }
    } catch (error) {
      console.error('Error fetching purchase data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Farmers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Purchase Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Purchase Overview
              </CardTitle>
              <CardDescription>
                Purchases and spending over time
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {purchaseData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No purchase data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={purchaseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'amount' ? formatCurrency(value as number) : value,
                    name === 'amount' ? 'Amount Spent' : 'Purchases'
                  ]}
                />
                <Bar yAxisId="left" dataKey="purchases" fill="#3b82f6" name="Purchases" />
                <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} name="Amount Spent" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Farmers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Top Farmers
          </CardTitle>
          <CardDescription>
            Farmers you buy from most
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topFarmers.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No farmer data available
            </div>
          ) : (
            <div className="space-y-4">
              {topFarmers.map((farmer, index) => (
                <div key={farmer.farmer_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{farmer.farmer_name}</p>
                      <p className="text-sm text-gray-600">{farmer.total_orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(farmer.total_spent)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

