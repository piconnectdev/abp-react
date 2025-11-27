'use client'

import { useAuth } from '@/context/AuthContext'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ComponentType, useEffect } from 'react'

interface ProtectedRouteOptions {
  checkTenant?: boolean
}

export function withProtectedRoute<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: ProtectedRouteOptions = {}
) {
  const WithProtectedRoute = (props: P) => {
    const { user, isLoading, tenantId } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
      if (isLoading) {
        return // Đợi cho đến khi thông tin xác thực được tải xong
      }

      // Tạo URL chuyển hướng đến trang đăng nhập, đính kèm URL hiện tại
      const loginUrl = new URL('/auth/login', window.location.origin)
      const currentPath = pathname + searchParams.toString()
      loginUrl.searchParams.set('redirect', currentPath)

      if (!user) {
        router.push(loginUrl.toString()) // Chuyển hướng nếu chưa đăng nhập
        return
      }

      if (options.checkTenant && !tenantId) {
        router.push('/auth/set-tenant') // Chuyển hướng nếu cần kiểm tra tenant và chưa có
        return
      }
    }, [user, isLoading, tenantId, router, pathname, searchParams, options.checkTenant])

    // Hiển thị loading hoặc null trong khi chờ, hoặc nếu user không hợp lệ
    if (isLoading || !user || (options.checkTenant && !tenantId)) {
      return <div>Loading...</div> // Hoặc một component spinner đẹp hơn
    }

    return <WrappedComponent {...props} />
  }
  WithProtectedRoute.displayName = `withProtectedRoute(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`
  return WithProtectedRoute
}
