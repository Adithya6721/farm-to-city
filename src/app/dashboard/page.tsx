'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { FarmerDashboard } from '@/components/dashboard/farmer-dashboard'
import { TraderDashboard } from '@/components/dashboard/trader-dashboard'
import { ShopkeeperDashboard } from '@/components/dashboard/shopkeeper-dashboard'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {user?.role === 'farmer' && <FarmerDashboard />}
        {user?.role === 'trader' && <TraderDashboard />}
        {user?.role === 'shopkeeper' && <ShopkeeperDashboard />}
      </div>
    </ProtectedRoute>
  )
}



