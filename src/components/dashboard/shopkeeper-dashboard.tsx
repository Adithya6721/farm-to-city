'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  Heart, 
  Filter,
  MapPin,
  Star,
  BarChart3,
  AlertTriangle,
  RotateCcw,
  Star as StarIcon
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Product, Order, WishlistItem, InventoryItem, Review } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ProductCard } from './product-card'
import { OrderList } from './order-list'
import { WishlistModal } from './wishlist-modal'
import { InventoryManager } from './inventory-manager'
import { AutoReorderSettings } from './auto-reorder-settings'
import { ReviewsManager } from './reviews-manager'

export function ShopkeeperDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [showWishlist, setShowWishlist] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [activeTab, setActiveTab] = useState('marketplace')
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    lowStockItems: 0,
    averageRating: 0,
    totalReviews: 0,
  })

  useEffect(() => {
    if (!user) return

    fetchProducts()
    fetchOrders()
    fetchWishlist()
    fetchInventory()
    fetchReviews()
  }, [user])

  const fetchProducts = async () => {
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

    if (data) {
      setProducts(data)
    }
  }

  const fetchOrders = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        farmer:users!orders_farmer_id_fkey(*),
        product:products(*)
      `)
      .eq('trader_id', user.id)
      .order('created_at', { ascending: false })

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
  }

  const fetchWishlist = async () => {
    if (!user) return

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

    if (data) {
      setWishlist(data)
      setStats(prev => ({ ...prev, wishlistCount: data.length }))
    }
  }

  const fetchInventory = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(*)
      `)
      .eq('shopkeeper_id', user.id)

    if (data) {
      setInventory(data)
      const lowStockItems = data.filter(item => item.current_stock < 10).length
      setStats(prev => ({ ...prev, lowStockItems }))
    }
  }

  const fetchReviews = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        farmer:users!reviews_farmer_id_fkey(*)
      `)
      .eq('shopkeeper_id', user.id)

    if (data) {
      setReviews(data)
      const averageRating = data.length > 0 
        ? data.reduce((sum, review) => sum + review.rating, 0) / data.length 
        : 0
      
      setStats(prev => ({ 
        ...prev, 
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: data.length 
      }))
    }
  }

  const handleSearch = () => {
    fetchProducts()
  }

  const handleOrderUpdate = () => {
    fetchOrders()
  }

  const categories = [
    'Vegetables',
    'Fruits',
    'Grains',
    'Pulses',
    'Spices',
    'Herbs',
    'Dairy',
    'Other'
  ]

  const priceRanges = [
    { label: 'Under ₹50', value: '0-50' },
    { label: '₹50 - ₹100', value: '50-100' },
    { label: '₹100 - ₹200', value: '100-200' },
    { label: '₹200 - ₹500', value: '200-500' },
    { label: 'Above ₹500', value: '500-' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏪 Shopkeeper Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}! Manage your store inventory and orders.
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
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Items need restocking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <StarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
              <p className="text-xs text-muted-foreground">
                From {stats.totalReviews} reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            {/* Search and Filters */}
            <Card>
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

            {/* Products Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Available Products</CardTitle>
                <CardDescription>
                  Fresh produce from local farmers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
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
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <InventoryManager 
              inventory={inventory}
              onInventoryUpdate={fetchInventory}
            />
            <AutoReorderSettings 
              shopkeeperId={user?.id || ''}
              onSettingsUpdate={fetchInventory}
            />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>
                  Track your orders and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderList 
                  orders={orders} 
                  userRole="shopkeeper"
                  onOrderUpdate={handleOrderUpdate}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <ReviewsManager 
              reviews={reviews}
              onReviewsUpdate={fetchReviews}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Sales Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Spent</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(stats.totalSpent)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Orders</span>
                      <span className="text-lg font-bold">{stats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Order Value</span>
                      <span className="text-lg font-bold">
                        {formatCurrency(stats.totalOrders > 0 ? stats.totalSpent / stats.totalOrders : 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    Rating Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Rating</span>
                      <div className="flex items-center">
                        <span className="text-lg font-bold mr-2">{stats.averageRating}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < Math.floor(stats.averageRating) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Reviews</span>
                      <span className="text-lg font-bold">{stats.totalReviews}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Recent Orders
                </span>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('orders')}>
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

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                  Low Stock Alert
                </span>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('inventory')}>
                  Manage
                </Button>
              </CardTitle>
              <CardDescription>
                Items that need immediate restocking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inventory.filter(item => item.current_stock < 10).slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-sm text-red-600">
                        Only {item.current_stock} {item.product?.unit} left
                      </p>
                    </div>
                    <Badge variant="destructive">Low Stock</Badge>
                  </div>
                ))}
                {inventory.filter(item => item.current_stock < 10).length === 0 && (
                  <p className="text-center text-gray-500 py-4">All items are well stocked</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
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

