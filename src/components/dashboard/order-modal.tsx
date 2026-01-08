'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Loader2, ShoppingCart } from 'lucide-react'
import { Product } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'

const orderSchema = z.object({
  delivery_date: z.string().min(1, 'Delivery date is required'),
  notes: z.string().optional(),
})

type OrderFormData = z.infer<typeof orderSchema>

interface OrderModalProps {
  product: Product
  quantity: number
  onClose: () => void
  onOrderPlaced: () => void
}

export function OrderModal({ product, quantity, onClose, onOrderPlaced }: OrderModalProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  })

  const onSubmit = async (data: OrderFormData) => {
    if (!user || !product.farmer_id) return

    setIsLoading(true)
    setError(null)

    try {
      const totalAmount = product.price * quantity

      const { error } = await supabase
        .from('orders')
        .insert({
          trader_id: user.id,
          farmer_id: product.farmer_id,
          product_id: product.id,
          quantity,
          total_amount: totalAmount,
          delivery_date: data.delivery_date,
          notes: data.notes || null,
          status: 'pending',
          payment_status: 'pending',
        })

      if (error) throw error

      // Create notification for farmer
      await supabase
        .from('notifications')
        .insert({
          user_id: product.farmer_id,
          title: 'New Order Received',
          message: `${user.name} placed an order for ${quantity} ${product.unit} of ${product.name}`,
          type: 'order',
          data: { order_id: 'new-order' },
        })

      onOrderPlaced()
    } catch (err: any) {
      setError(err.message || 'Failed to place order')
    } finally {
      setIsLoading(false)
    }
  }

  const totalAmount = product.price * quantity

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Place Order
            </CardTitle>
            <CardDescription>
              Order {quantity} {product.unit} of {product.name}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Product:</span>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Farmer:</span>
                <span className="font-medium">{product.farmer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Price per {product.unit}:</span>
                <span className="font-medium">{formatCurrency(product.price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-medium">{quantity} {product.unit}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total:</span>
                <span className="text-green-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delivery_date">Delivery Date *</Label>
              <Input
                id="delivery_date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...form.register('delivery_date')}
              />
              {form.formState.errors.delivery_date && (
                <p className="text-sm text-red-600">{form.formState.errors.delivery_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special requirements or notes for the farmer..."
                rows={3}
                {...form.register('notes')}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Place Order
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}



