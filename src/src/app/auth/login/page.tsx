'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserManager } from '@/lib/oidc-client'

function LoginPage() {
  const handleLogin = () => {
    // Bắt đầu quá trình đăng nhập, chuyển hướng người dùng đến IdP
    // Thêm một đối số state để có thể chuyển hướng lại sau khi đăng nhập
    const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/'
    getUserManager().signinRedirect({ state: redirectUrl })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>Bạn cần đăng nhập để truy cập vào trang này.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogin} className="w-full">
            Đăng nhập với OpenID
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
