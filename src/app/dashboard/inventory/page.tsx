'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { InventoryView } from '@/components/dashboard/inventory-view'

export default function InventoryPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute allowedRoles={['shopkeeper']}>
      <InventoryView />
    </ProtectedRoute>
  )
}

