'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { getUserManager } from '@/lib/oidc-client'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const { user } = useAuth()

  const handleLogout = () => {
    getUserManager().signoutRedirect()
  }

  if (!user) {
    return null // Không hiển thị nút nếu người dùng chưa đăng nhập
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleLogout} title="Đăng xuất">
      <LogOut className="h-4 w-4" />
    </Button>
  )
}
