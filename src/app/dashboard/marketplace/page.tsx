'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { MarketplaceView } from '@/components/dashboard/marketplace-view'

export default function MarketplacePage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute allowedRoles={['trader', 'shopkeeper']}>
      <MarketplaceView />
    </ProtectedRoute>
  )
}

