'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, ShoppingCart, MapPin, Star, MessageSquare } from 'lucide-react'
import { Product } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import { OrderModal } from './order-modal'
import { handleSupabaseError } from '@/lib/error-handler'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
  onOrderPlaced: () => void
  onWishlistToggle: () => void
  isInWishlist: boolean
}

export function ProductCard({ product, onOrderPlaced, onWishlistToggle, isInWishlist }: ProductCardProps) {
  const { user } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please sign in to add items to wishlist')
      return
    }

    setIsAddingToWishlist(true)

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id)

        if (error) throw error

        toast.success('Removed from wishlist')
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            product_id: product.id,
          })

        if (error) throw error

        toast.success('Added to wishlist')
      }

      onWishlistToggle()
    } catch (error) {
      handleSupabaseError(error, {
        defaultMessage: 'Failed to update wishlist. Please try again.'
      })
    } finally {
      setIsAddingToWishlist(false)
    }
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

  const isAvailable = product.availability && product.quantity > 0

  return (
    <>
      <Card className="card-hover group">
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
              onClick={toggleWishlist}
              disabled={isAddingToWishlist}
              className={`h-8 w-8 ${
                isInWishlist ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
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

          <div className="flex items-center mb-3">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm text-gray-600">By {product.farmer?.name}</span>
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

          {isAvailable ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label htmlFor={`quantity-${product.id}`} className="text-sm">Quantity:</Label>
                <Input
                  id={`quantity-${product.id}`}
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantity, parseInt(e.target.value) || 1)))}
                  className="w-20 h-8"
                />
                <span className="text-sm text-gray-500">{product.unit}</span>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowOrderModal(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <ShoppingCart className="mr-1 h-4 w-4" />
                  Order Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <Badge variant="secondary" className="mb-2">
                {product.quantity === 0 ? 'Out of Stock' : 'Unavailable'}
              </Badge>
              <Button variant="outline" size="sm" className="w-full">
                <MessageSquare className="mr-1 h-4 w-4" />
                Contact Farmer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Modal */}
      {showOrderModal && (
        <OrderModal
          product={product}
          quantity={quantity}
          onClose={() => setShowOrderModal(false)}
          onOrderPlaced={() => {
            setShowOrderModal(false)
            onOrderPlaced()
          }}
        />
      )}
    </>
  )
}



