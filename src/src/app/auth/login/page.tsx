'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { authClientConfig } from '@/config'
import { getUserManager } from '@/lib/oidc-client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [tenant, setTenant] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const getRedirectUrl = () => {
    return new URLSearchParams(window.location.search).get('redirect') || '/'
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const userManager = getUserManager()
      const authority = userManager.settings.authority
      const tokenEndpoint = `${authority}/connect/token`

      const params = new URLSearchParams()
      params.append('grant_type', 'password')
      params.append('client_id', authClientConfig.client_id || '')
      params.append('username', username)
      params.append('password', password)
      params.append('scope', authClientConfig.scope || '')

      if (tenant) {
        params.append('__tenant', tenant)
      }

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      })

      const tokenData = await response.json()

      if (!response.ok) {
        throw new Error(tokenData.error_description || 'Login failed.')
      }

      // Tạo đối tượng User và lưu vào storage để oidc-client quản lý
      const user = await userManager.storeUser({ ...tokenData, profile: {} })

      // Chuyển hướng sau khi đăng nhập thành công
      router.push(getRedirectUrl())
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid username, password, or tenant.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenIdLogin = () => {
    // Bắt đầu quá trình đăng nhập, chuyển hướng người dùng đến IdP
    // Thêm một đối số state để có thể chuyển hướng lại sau khi đăng nhập
    getUserManager().signinRedirect({ state: getRedirectUrl() })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>Bạn cần đăng nhập để truy cập vào trang này.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tenant">Tenant (optional)</Label>
                <Input
                  id="tenant"
                  type="text"
                  placeholder="Enter tenant name"
                  value={tenant}
                  onChange={(e) => setTenant(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Đăng nhập'}
              </Button>
            </div>
          </form>
          <Separator className="my-4" />
          <Button variant="outline" onClick={handleOpenIdLogin} className="w-full">
            Đăng nhập với OpenID
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
