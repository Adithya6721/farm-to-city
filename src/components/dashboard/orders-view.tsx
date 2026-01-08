'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderList } from './order-list'
import { Order } from '@/types'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Loader2, ShoppingCart } from 'lucide-react'

export function OrdersView() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          trader:users!orders_trader_id_fkey(*),
          farmer:users!orders_farmer_id_fkey(*),
          product:products(*)
        `)
        .order('created_at', { ascending: false })

      // Filter based on user role
      if (user.role === 'farmer') {
        query = query.eq('farmer_id', user.id)
      } else if (user.role === 'trader' || user.role === 'shopkeeper') {
        query = query.eq('trader_id', user.id)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      if (data) {
        setOrders(data)
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders', {
        description: error.message || 'An error occurred while loading orders.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOrderUpdate = () => {
    fetchOrders()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'farmer' 
              ? 'Manage your incoming orders from traders and shopkeepers'
              : 'Track your orders and their status'
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              All Orders
            </CardTitle>
            <CardDescription>
              {user?.role === 'farmer'
                ? 'Orders from traders and shopkeepers'
                : 'Your order history'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <OrderList 
                orders={orders} 
                userRole={user?.role || 'trader'}
                onOrderUpdate={handleOrderUpdate}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

