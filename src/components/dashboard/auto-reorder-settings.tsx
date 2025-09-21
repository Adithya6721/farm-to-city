'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { RotateCcw, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'

interface AutoReorderSetting {
  id: string
  product_id: string
  min_stock: number
  reorder_quantity: number
  frequency: 'daily' | 'weekly' | 'monthly'
  enabled: boolean
  product?: any
}

interface AutoReorderSettingsProps {
  shopkeeperId: string
  onSettingsUpdate: () => void
}

export function AutoReorderSettings({ shopkeeperId, onSettingsUpdate }: AutoReorderSettingsProps) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<AutoReorderSetting[]>([])
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSetting, setNewSetting] = useState({
    product_id: '',
    min_stock: 10,
    reorder_quantity: 50,
    frequency: 'weekly' as const,
    enabled: true,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSettings()
      fetchAvailableProducts()
    }
  }, [user])

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('auto_reorder_settings')
      .select(`
        *,
        product:products(*)
      `)
      .eq('shopkeeper_id', user?.id)

    if (data) {
      setSettings(data)
    }
  }

  const fetchAvailableProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('availability', true)
      .order('name')

    if (data) {
      setAvailableProducts(data)
    }
  }

  const createSetting = async () => {
    if (!user || !newSetting.product_id) return

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('auto_reorder_settings')
        .insert({
          shopkeeper_id: user.id,
          product_id: newSetting.product_id,
          min_stock: newSetting.min_stock,
          reorder_quantity: newSetting.reorder_quantity,
          frequency: newSetting.frequency,
          enabled: newSetting.enabled,
        })

      if (error) throw error

      setNewSetting({
        product_id: '',
        min_stock: 10,
        reorder_quantity: 50,
        frequency: 'weekly',
        enabled: true,
      })
      setShowAddForm(false)
      fetchSettings()
      onSettingsUpdate()
    } catch (error) {
      console.error('Error creating setting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = async (id: string, updates: Partial<AutoReorderSetting>) => {
    try {
      const { error } = await supabase
        .from('auto_reorder_settings')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      fetchSettings()
      onSettingsUpdate()
    } catch (error) {
      console.error('Error updating setting:', error)
    }
  }

  const deleteSetting = async (id: string) => {
    try {
      const { error } = await supabase
        .from('auto_reorder_settings')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchSettings()
      onSettingsUpdate()
    } catch (error) {
      console.error('Error deleting setting:', error)
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'Daily'
      case 'weekly':
        return 'Weekly'
      case 'monthly':
        return 'Monthly'
      default:
        return frequency
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <RotateCcw className="mr-2 h-5 w-5" />
            Auto-Reorder Settings
          </span>
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Setting
          </Button>
        </CardTitle>
        <CardDescription>
          Set up automatic reordering for your inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="border rounded-lg p-4 mb-6 bg-gray-50">
            <h3 className="font-medium mb-4">Add New Auto-Reorder Setting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={newSetting.product_id} onValueChange={(value) => setNewSetting(prev => ({ ...prev, product_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={newSetting.frequency} onValueChange={(value: any) => setNewSetting(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_stock">Minimum Stock Level</Label>
                <Input
                  id="min_stock"
                  type="number"
                  value={newSetting.min_stock}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, min_stock: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorder_quantity">Reorder Quantity</Label>
                <Input
                  id="reorder_quantity"
                  type="number"
                  value={newSetting.reorder_quantity}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, reorder_quantity: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Switch
                checked={newSetting.enabled}
                onCheckedChange={(checked) => setNewSetting(prev => ({ ...prev, enabled: checked }))}
              />
              <Label>Enabled</Label>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={createSetting}
                disabled={isLoading || !newSetting.product_id}
              >
                Create Setting
              </Button>
            </div>
          </div>
        )}

        {settings.length === 0 ? (
          <div className="text-center py-8">
            <RotateCcw className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No auto-reorder settings</h3>
            <p className="text-gray-500">Set up automatic reordering to never run out of stock</p>
          </div>
        ) : (
          <div className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium">{setting.product?.name}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        setting.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {setting.enabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{setting.product?.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Category: {setting.product?.category}</span>
                      <span>Unit: {setting.product?.unit}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSetting(setting.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Minimum Stock</p>
                    <p className="font-medium">{setting.min_stock}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Reorder Quantity</p>
                    <p className="font-medium">{setting.reorder_quantity}</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Frequency</p>
                    <p className="font-medium">{getFrequencyLabel(setting.frequency)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={(checked) => updateSetting(setting.id, { enabled: checked })}
                    />
                    <Label>Auto-reorder enabled</Label>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created {new Date(setting.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

