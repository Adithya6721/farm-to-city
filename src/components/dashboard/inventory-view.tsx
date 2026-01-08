'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Navbar } from '@/components/layout/navbar'
import { InventoryManager } from './inventory-manager'
import { AutoReorderSettings } from './auto-reorder-settings'
import { InventoryItem } from '@/types'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function InventoryView() {
  const { user } = useAuth()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchInventory()
    }
  }, [user])

  const fetchInventory = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          product:products(*)
        `)
        .eq('shopkeeper_id', user.id)

      if (error) {
        throw error
      }

      if (data) {
        setInventory(data)
      }
    } catch (error: any) {
      console.error('Error fetching inventory:', error)
      toast.error('Failed to load inventory', {
        description: error.message || 'An error occurred while loading inventory.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">
            Track and manage your store inventory
          </p>
        </div>

        <div className="space-y-6">
          <InventoryManager 
            inventory={inventory}
            onInventoryUpdate={fetchInventory}
          />
          <AutoReorderSettings 
            shopkeeperId={user?.id || ''}
            onSettingsUpdate={fetchInventory}
          />
        </div>
      </div>
    </div>
  )
}

