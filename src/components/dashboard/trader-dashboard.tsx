'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  Heart, 
  Filter,
  MapPin,
  Star
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Product, Order, WishlistItem } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ProductCard } from './product-card'
import { OrderList } from './order-list'
import { WishlistModal } from './wishlist-modal'
import { handleSupabaseError } from '@/lib/error-handler'
import { Loading } from '@/components/ui/loading'
import { PRODUCT_CATEGORIES, PRICE_RANGES } from '@/lib/constants'

export function TraderDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [showWishlist, setShowWishlist] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
  })
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false)

  useEffect(() => {
    if (!user) return

    fetchProducts()
    fetchOrders()
    fetchWishlist()
  }, [user])

  const fetchProducts = async () => {
    setIsLoadingProducts(true)
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          farmer:users!products_farmer_id_fkey(*)
        `)
        .eq('availability', true)
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%, description.ilike.%${searchTerm}%`)
      }

      if (selectedCategory) {
        query = query.eq('category', selectedCategory)
      }

      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number)
        if (max) {
          query = query.gte('price', min).lte('price', max)
        } else {
          query = query.gte('price', min)
        }
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      if (data) {
        setProducts(data)
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
          farmer:users!orders_farmer_id_fkey(*),
          product:products(*)
        `)
        .eq('trader_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      if (data) {
        setOrders(data)
        const pendingOrders = data.filter(order => order.status === 'pending').length
        const totalSpent = data
          .filter(order => order.status === 'delivered')
          .reduce((sum, order) => sum + (order.total_amount || 0), 0)

        setStats(prev => ({
          ...prev,
          totalOrders: data.length,
          pendingOrders,
          totalSpent,
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

  const fetchWishlist = async () => {
    if (!user) return

    setIsLoadingWishlist(true)
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          product:products(
            *,
            farmer:users!products_farmer_id_fkey(*)
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      if (data) {
        setWishlist(data)
        setStats(prev => ({ ...prev, wishlistCount: data.length }))
      }
    } catch (error) {
      handleSupabaseError(error, {
        showToast: false, // Don't show toast for wishlist errors
        logError: true
      })
    } finally {
      setIsLoadingWishlist(false)
    }
  }

  const handleSearch = () => {
    fetchProducts()
  }

  const handleOrderUpdate = () => {
    fetchOrders()
  }

  const categories = PRODUCT_CATEGORIES
  const priceRanges = PRICE_RANGES

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🚚 Trader Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}! Browse products and manage your orders.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                All time orders placed
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
                Awaiting farmer confirmation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground">
                On delivered orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.wishlistCount}</div>
              <p className="text-xs text-muted-foreground">
                Saved products
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Search Products
            </CardTitle>
            <CardDescription>
              Find fresh produce from farmers near you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range</label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any price</SelectItem>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">&nbsp;</label>
                <div className="flex space-x-2">
                  <Button onClick={handleSearch} className="flex-1">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('')
                      setPriceRange('')
                      fetchProducts()
                    }}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Recent Orders
                </span>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardTitle>
              <CardDescription>
                Your latest orders from farmers
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
                      <p className="text-xs text-gray-500">
                        From {order.farmer?.name}
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

          {/* Wishlist Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Heart className="mr-2 h-5 w-5" />
                  Wishlist
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowWishlist(true)}
                >
                  View All
                </Button>
              </CardTitle>
              <CardDescription>
                Your saved products for later
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wishlist.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.product?.price || 0)}/{item.product?.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        By {item.product?.farmer?.name}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        {item.product?.farmer?.location}
                      </span>
                    </div>
                  </div>
                ))}
                {wishlist.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No saved products yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Products</CardTitle>
            <CardDescription>
              Fresh produce from local farmers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <Loading text="Loading products..." />
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOrderPlaced={handleOrderUpdate}
                    onWishlistToggle={fetchWishlist}
                    isInWishlist={wishlist.some(item => item.product_id === product.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>
              Track your orders and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <Loading text="Loading orders..." />
            ) : (
              <OrderList 
                orders={orders} 
                userRole="trader"
                onOrderUpdate={handleOrderUpdate}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wishlist Modal */}
      {showWishlist && (
        <WishlistModal
          wishlist={wishlist}
          onClose={() => setShowWishlist(false)}
          onWishlistUpdate={fetchWishlist}
        />
      )}
    </div>
  )
}



