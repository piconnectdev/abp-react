'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserManager } from '@/lib/oidc-client'
import { useQueryClient } from '@tanstack/react-query'

function LogoutPage() {
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    const userManager = getUserManager()
    try {
      // Bước 1: Xóa cache của React Query để dọn dẹp trạng thái cũ của ứng dụng
      queryClient.clear()

      // Bước 2: Xóa thông tin người dùng khỏi bộ nhớ của trình duyệt (local)
      await userManager.removeUser()
    } catch (error) {
      console.error('Error removing user from local storage:', error)
    } finally {
      // AuthProvider sẽ tự động phát hiện người dùng đã bị xóa
      // và cập nhật trạng thái user thành null.

      // Bước cuối: Chuyển hướng đến server để đăng xuất toàn cục.
      // Bước này vẫn được thực hiện ngay cả khi việc dọn dẹp local có lỗi.
      await userManager.signoutRedirect()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Đăng xuất</CardTitle>
          <CardDescription>Bạn có chắc chắn muốn đăng xuất không?</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogout} className="w-full">
            Xác nhận Đăng xuất
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default LogoutPage
