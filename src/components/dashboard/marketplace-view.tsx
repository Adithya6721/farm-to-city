'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, Package, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Product, WishlistItem } from '@/types'
import { ProductCard } from './product-card'
import { toast } from 'sonner'
import { PRODUCT_CATEGORIES, PRICE_RANGES } from '@/lib/constants'
import { useDebounce } from '@/hooks/use-debounce'

export function MarketplaceView() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (user) {
      fetchProducts()
      fetchWishlist()
    }
  }, [user])

  useEffect(() => {
    if (user && (debouncedSearchTerm !== searchTerm || selectedCategory || priceRange)) {
      fetchProducts()
    }
  }, [debouncedSearchTerm, selectedCategory, priceRange, user])

  const fetchProducts = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          farmer:users!products_farmer_id_fkey(*)
        `)
        .eq('availability', true)
        .order('created_at', { ascending: false })

      if (debouncedSearchTerm) {
        query = query.or(`name.ilike.%${debouncedSearchTerm}%, description.ilike.%${debouncedSearchTerm}%`)
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
    } catch (error: any) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products', {
        description: error.message || 'An error occurred while loading products.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWishlist = async () => {
    if (!user) return

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
      }
    } catch (error: any) {
      console.error('Error fetching wishlist:', error)
    }
  }

  const handleSearch = () => {
    fetchProducts()
  }

  const handleOrderPlaced = () => {
    fetchProducts()
  }

  const categories = PRODUCT_CATEGORIES
  const priceRanges = PRICE_RANGES

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-600 mt-2">
            Browse fresh produce from local farmers
          </p>
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

        {/* Products Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Available Products</CardTitle>
            <CardDescription>
              Fresh produce from local farmers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
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
                    onOrderPlaced={handleOrderPlaced}
                    onWishlistToggle={fetchWishlist}
                    isInWishlist={wishlist.some(item => item.product_id === product.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

