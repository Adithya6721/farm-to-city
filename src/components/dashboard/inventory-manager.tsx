'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { InventoryItem } from '@/types'
import { formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'

interface InventoryManagerProps {
  inventory: InventoryItem[]
  onInventoryUpdate: () => void
}

export function InventoryManager({ inventory, onInventoryUpdate }: InventoryManagerProps) {
  const { user } = useAuth()
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [stockAdjustment, setStockAdjustment] = useState<{ [key: string]: number }>({})
  const [isUpdating, setIsUpdating] = useState(false)

  const updateStock = async (itemId: string, adjustment: number) => {
    if (!user) return

    setIsUpdating(true)

    try {
      const item = inventory.find(i => i.id === itemId)
      if (!item) return

      const newStock = item.current_stock + adjustment
      if (newStock < 0) return

      const { error } = await supabase
        .from('inventory')
        .update({
          current_stock: newStock,
          quantity_in: adjustment > 0 ? item.quantity_in + adjustment : item.quantity_in,
          quantity_out: adjustment < 0 ? item.quantity_out + Math.abs(adjustment) : item.quantity_out,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)

      if (error) throw error

      onInventoryUpdate()
      setStockAdjustment(prev => ({ ...prev, [itemId]: 0 }))
    } catch (error) {
      console.error('Error updating stock:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'out', color: 'bg-red-100 text-red-800', icon: '❌' }
    if (stock < 10) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' }
    if (stock < 50) return { status: 'medium', color: 'bg-blue-100 text-blue-800', icon: '📦' }
    return { status: 'high', color: 'bg-green-100 text-green-800', icon: '✅' }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="mr-2 h-5 w-5" />
          Inventory Management
        </CardTitle>
        <CardDescription>
          Track and manage your store inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        {inventory.length === 0 ? (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items</h3>
            <p className="text-gray-500">Start ordering products to build your inventory</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inventory.map((item) => {
              const stockStatus = getStockStatus(item.current_stock)
              const adjustment = stockAdjustment[item.id] || 0

              return (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium">{item.product?.name}</h3>
                        <Badge className={stockStatus.color}>
                          {stockStatus.icon} {stockStatus.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.product?.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Category: {item.product?.category}</span>
                        <span>Unit: {item.product?.unit}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{item.current_stock}</p>
                      <p className="text-sm text-gray-500">{item.product?.unit}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <p className="text-sm text-gray-600">Stock In</p>
                      <p className="font-medium">{item.quantity_in}</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <TrendingDown className="h-5 w-5 text-red-600 mx-auto mb-1" />
                      <p className="text-sm text-gray-600">Stock Out</p>
                      <p className="font-medium">{item.quantity_out}</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-sm text-gray-600">Current Stock</p>
                      <p className="font-medium">{item.current_stock}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Label htmlFor={`adjustment-${item.id}`} className="text-sm">
                        Stock Adjustment
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStockAdjustment(prev => ({
                            ...prev,
                            [item.id]: Math.max(-item.current_stock, (prev[item.id] || 0) - 1)
                          }))}
                        >
                          -
                        </Button>
                        <Input
                          id={`adjustment-${item.id}`}
                          type="number"
                          value={adjustment}
                          onChange={(e) => setStockAdjustment(prev => ({
                            ...prev,
                            [item.id]: parseInt(e.target.value) || 0
                          }))}
                          className="w-20 text-center"
                          min={-item.current_stock}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStockAdjustment(prev => ({
                            ...prev,
                            [item.id]: (prev[item.id] || 0) + 1
                          }))}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={() => updateStock(item.id, adjustment)}
                      disabled={adjustment === 0 || isUpdating}
                      className="mt-6"
                    >
                      Update Stock
                    </Button>
                  </div>

                  <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                    Last updated: {formatDate(item.updated_at)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

