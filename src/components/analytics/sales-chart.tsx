'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import { formatCurrency } from '@/lib/utils'

interface SalesData {
  month: string
  sales: number
  orders: number
  revenue: number
}

interface TopProduct {
  product_name: string
  total_sold: number
  revenue: number
}

export function SalesChart() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('6months')
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSalesData()
    }
  }, [user, timeRange])

  const fetchSalesData = async () => {
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

      // Fetch sales data
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:products(*)
        `)
        .eq('farmer_id', user.id)
        .eq('status', 'delivered')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (orders) {
        // Group by month
        const monthlyData = new Map<string, { sales: number; orders: number; revenue: number }>()
        
        orders.forEach(order => {
          const month = new Date(order.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          })
          
          if (!monthlyData.has(month)) {
            monthlyData.set(month, { sales: 0, orders: 0, revenue: 0 })
          }
          
          const data = monthlyData.get(month)!
          data.sales += order.quantity
          data.orders += 1
          data.revenue += order.total_amount || 0
        })

        const formattedData = Array.from(monthlyData.entries()).map(([month, data]) => ({
          month,
          sales: data.sales,
          orders: data.orders,
          revenue: data.revenue,
        }))

        setSalesData(formattedData)

        // Get top products
        const productMap = new Map<string, { total_sold: number; revenue: number }>()
        
        orders.forEach(order => {
          const productName = order.product?.name || 'Unknown'
          
          if (!productMap.has(productName)) {
            productMap.set(productName, { total_sold: 0, revenue: 0 })
          }
          
          const data = productMap.get(productName)!
          data.total_sold += order.quantity
          data.revenue += order.total_amount || 0
        })

        const topProductsData = Array.from(productMap.entries())
          .map(([product_name, data]) => ({
            product_name,
            total_sold: data.total_sold,
            revenue: data.revenue,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)

        setTopProducts(topProductsData)
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
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
      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Sales Overview
              </CardTitle>
              <CardDescription>
                Revenue and orders over time
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
          {salesData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No sales data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value as number) : value,
                    name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Sales'
                  ]}
                />
                <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Top Products
          </CardTitle>
          <CardDescription>
            Best selling products by revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No product data available
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.product_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="font-medium">{product.product_name}</p>
                      <p className="text-sm text-gray-600">{product.total_sold} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
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

