'use client'

import { AuthProvider } from '@/context/AuthContext'
import { configureApiClient } from '@/lib/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

// Cấu hình API client một lần duy nhất khi ứng dụng khởi chạy ở client
configureApiClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  // Tạo instance của QueryClient ở đây, bên trong Client Component
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}
