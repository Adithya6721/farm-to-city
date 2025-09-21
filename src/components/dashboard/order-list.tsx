'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, Truck, MessageSquare } from 'lucide-react'
import { Order } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface OrderListProps {
  orders: Order[]
  userRole: 'farmer' | 'trader' | 'shopkeeper'
  onOrderUpdate: () => void
}

export function OrderList({ orders, userRole, onOrderUpdate }: OrderListProps) {
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set())

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrders(prev => new Set(prev).add(orderId))

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (error) throw error

      onOrderUpdate()
    } catch (error) {
      console.error('Error updating order:', error)
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'confirmed':
        return '✅'
      case 'rejected':
        return '❌'
      case 'delivered':
        return '🚚'
      default:
        return '📦'
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-500">
          {userRole === 'farmer' 
            ? 'Orders from traders and shopkeepers will appear here'
            : 'Your orders will appear here'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium">{order.product?.name}</h3>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-medium">{order.quantity} {order.product?.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(order.total_amount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Delivery Date</p>
                    <p className="font-medium">
                      {order.delivery_date ? formatDate(order.delivery_date) : 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>
                    {userRole === 'farmer' ? 'Ordered by' : 'Farmer'}: 
                    <strong className="ml-1">
                      {userRole === 'farmer' 
                        ? order.trader?.name || 'Unknown Trader'
                        : order.farmer?.name || 'Unknown Farmer'
                      }
                    </strong>
                  </span>
                  {order.trader?.location && (
                    <span>📍 {order.trader.location}</span>
                  )}
                  {order.farmer?.location && (
                    <span>📍 {order.farmer.location}</span>
                  )}
                </div>

                {order.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      <strong>Notes:</strong> {order.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                {userRole === 'farmer' && order.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      disabled={updatingOrders.has(order.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateOrderStatus(order.id, 'rejected')}
                      disabled={updatingOrders.has(order.id)}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Reject
                    </Button>
                  </>
                )}

                {userRole === 'farmer' && order.status === 'confirmed' && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    disabled={updatingOrders.has(order.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Truck className="mr-1 h-3 w-3" />
                    Mark Delivered
                  </Button>
                )}

                <Button size="sm" variant="outline">
                  <MessageSquare className="mr-1 h-3 w-3" />
                  Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

