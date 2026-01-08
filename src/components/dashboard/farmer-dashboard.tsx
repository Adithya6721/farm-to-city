'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Package, ShoppingCart, TrendingUp, Users, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Product, Order } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ProductForm } from './product-form'
import { OrderList } from './order-list'
import { handleSupabaseError } from '@/lib/error-handler'
import { Loading } from '@/components/ui/loading'
import { toast } from 'sonner'

export function FarmerDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    if (!user) return

    fetchProducts()
    fetchOrders()
  }, [user])

  const fetchProducts = async () => {
    if (!user) return

    setIsLoadingProducts(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      if (data) {
        setProducts(data)
        setStats(prev => ({ ...prev, totalProducts: data.length }))
      }
    } catch (error) {
      handleSupabaseError(error, {
        defaultMessage: 'Failed to load products. Please try again.'
      })
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const fetchOrders = async () => {
    if (!user) return

    setIsLoadingOrders(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          trader:users!orders_trader_id_fkey(*),
          product:products(*)
        `)
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      if (data) {
        setOrders(data)
        const pendingOrders = data.filter(order => order.status === 'pending').length
        const totalRevenue = data
          .filter(order => order.status === 'delivered')
          .reduce((sum, order) => sum + (order.total_amount || 0), 0)

        setStats(prev => ({
          ...prev,
          totalOrders: data.length,
          pendingOrders,
          totalRevenue,
        }))
      }
    } catch (error) {
      handleSupabaseError(error, {
        defaultMessage: 'Failed to load orders. Please try again.'
      })
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const handleProductAdded = () => {
    fetchProducts()
    setShowProductForm(false)
  }

  const handleOrderUpdate = () => {
    fetchOrders()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🌾 Farmer Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}! Manage your products and orders here.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Active product listings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                All time orders received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                Orders awaiting your response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                From delivered orders
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Add Product */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Add New Product
              </CardTitle>
              <CardDescription>
                List a new product to start receiving orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowProductForm(true)}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Recent Orders
              </CardTitle>
              <CardDescription>
                Latest orders from traders and shopkeepers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.product?.name}</p>
                      <p className="text-sm text-gray-600">
                        {order.quantity} {order.product?.unit} • {formatCurrency(order.total_amount || 0)}
                      </p>
                    </div>
                    <Badge variant={
                      order.status === 'pending' ? 'secondary' :
                      order.status === 'confirmed' ? 'default' :
                      order.status === 'delivered' ? 'default' : 'destructive'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No orders yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Products */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
            <CardDescription>
              Your latest product listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <Loading text="Loading products..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.slice(0, 6).map((product) => (
                <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{product.name}</h3>
                    <Badge variant={product.availability ? 'default' : 'secondary'}>
                      {product.availability ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-600">
                      {formatCurrency(product.price)}/{product.unit}
                    </span>
                    <span className="text-sm text-gray-500">
                      {product.quantity} {product.unit} left
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Listed on {formatDate(product.created_at)}
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No products listed yet</p>
                  <Button 
                    onClick={() => setShowProductForm(true)}
                    className="mt-4"
                  >
                    Add Your First Product
                  </Button>
                </div>
              )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>
              Manage your incoming orders from traders and shopkeepers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <Loading text="Loading orders..." />
            ) : (
              <OrderList 
                orders={orders} 
                userRole="farmer"
                onOrderUpdate={handleOrderUpdate}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm 
          onClose={() => setShowProductForm(false)}
          onSuccess={handleProductAdded}
          farmerId={user?.id || ''}
        />
      )}
    </div>
  )
}



