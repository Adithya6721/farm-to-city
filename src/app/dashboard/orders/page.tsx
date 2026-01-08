'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { OrdersView } from '@/components/dashboard/orders-view'

export default function OrdersPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <OrdersView />
    </ProtectedRoute>
  )
}

