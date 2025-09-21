'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner' // This line will now work correctly
import { AuthProvider } from './auth/auth-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster /> {/* This component provides notifications */}
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}