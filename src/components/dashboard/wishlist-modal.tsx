'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Heart, MapPin, ShoppingCart } from 'lucide-react'
import { WishlistItem } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import { useState } from 'react'
import { OrderModal } from './order-modal'

interface WishlistModalProps {
  wishlist: WishlistItem[]
  onClose: () => void
  onWishlistUpdate: () => void
}

export function WishlistModal({ wishlist, onClose, onWishlistUpdate }: WishlistModalProps) {
  const { user } = useAuth()
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [removingItem, setRemovingItem] = useState<string | null>(null)

  const removeFromWishlist = async (productId: string) => {
    if (!user) return

    setRemovingItem(productId)

    try {
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      onWishlistUpdate()
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    } finally {
      setRemovingItem(null)
    }
  }

  const handleOrderClick = (product: any) => {
    setSelectedProduct(product)
    setShowOrderModal(true)
  }

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'Vegetables':
        return '🥬'
      case 'Fruits':
        return '🍎'
      case 'Grains':
        return '🌾'
      case 'Pulses':
        return '🫘'
      case 'Spices':
        return '🌶️'
      case 'Herbs':
        return '🌿'
      case 'Dairy':
        return '🥛'
      default:
        return '📦'
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5 text-red-500" />
                Your Wishlist
              </CardTitle>
              <CardDescription>
                {wishlist.length} saved products
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[calc(90vh-8rem)]">
            {wishlist.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500">Save products you like to view them later</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map((item) => {
                  const product = item.product
                  if (!product) return null

                  const isAvailable = product.availability && product.quantity > 0

                  return (
                    <Card key={item.id} className="card-hover">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getCategoryEmoji(product.category || '')}</span>
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromWishlist(product.id)}
                            disabled={removingItem === product.id}
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>

                        {product.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                        )}

                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{product.farmer?.location || 'Location not specified'}</span>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <span className="text-xl font-bold text-green-600">
                              {formatCurrency(product.price)}
                            </span>
                            <span className="text-sm text-gray-500">/{product.unit}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Available</p>
                            <p className="font-medium">{product.quantity} {product.unit}</p>
                          </div>
                        </div>

                        {product.harvest_date && (
                          <div className="text-xs text-gray-500 mb-3">
                            Harvested: {formatDate(product.harvest_date)}
                          </div>
                        )}

                        <div className="flex items-center text-sm text-gray-600 mb-4">
                          <span>By {product.farmer?.name}</span>
                        </div>

                        {isAvailable ? (
                          <Button
                            onClick={() => handleOrderClick(product)}
                            className="w-full bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <ShoppingCart className="mr-1 h-4 w-4" />
                            Order Now
                          </Button>
                        ) : (
                          <div className="text-center">
                            <Badge variant="secondary" className="mb-2">
                              {product.quantity === 0 ? 'Out of Stock' : 'Unavailable'}
                            </Badge>
                            <p className="text-xs text-gray-500">Contact farmer for availability</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedProduct && (
        <OrderModal
          product={selectedProduct}
          quantity={1}
          onClose={() => {
            setShowOrderModal(false)
            setSelectedProduct(null)
          }}
          onOrderPlaced={() => {
            setShowOrderModal(false)
            setSelectedProduct(null)
            onWishlistUpdate()
          }}
        />
      )}
    </>
  )
}



