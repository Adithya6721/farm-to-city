'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { FarmerProductsView } from '@/components/dashboard/farmer-products-view'

export default function ProductsPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute allowedRoles={['farmer']}>
      <FarmerProductsView />
    </ProtectedRoute>
  )
}

