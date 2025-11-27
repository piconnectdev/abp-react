'use client'

import { withProtectedRoute } from '@/components/ProtectedRoute'
import AdminLayoutComponent from '@/layout/admin-layout' // Giả sử component layout chính của bạn ở đây
import React from 'react'

function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  // Component này chỉ đơn giản là render AdminLayoutComponent với children
  // Toàn bộ logic bảo vệ đã được xử lý bởi HOC
  return <AdminLayoutComponent>{children}</AdminLayoutComponent>
}

// Bọc layout của bạn với HOC `withProtectedRoute`
// Tùy chọn { checkTenant: true } yêu cầu người dùng phải chọn tenant để vào trang admin
export default withProtectedRoute(ProtectedAdminLayout)
