// /src/app/auth/callback/page.tsx
'use client'

import { authClientConfig } from '@/config'
import { getUserManager } from '@/lib/oidc-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    async function handleCallback() {
      try {
        // Hoàn tất quá trình đăng nhập, xử lý phản hồi từ IdP
        const user = await getUserManager().signinRedirectCallback()

        // Log access_token ra console để kiểm tra
        console.log('Đăng nhập thành công! Access Token:', user.access_token)

        // Lấy URL chuyển hướng từ state, nếu không có thì về trang chủ
        const redirectUrl = user.state || authClientConfig.post_login_route
        router.push(redirectUrl as string)
      } catch (error) {
        console.error('Lỗi khi xử lý callback OIDC:', error)
        // Có lỗi xảy ra, chuyển hướng về trang lỗi hoặc trang đăng nhập
        router.push('/auth/login?error=callback_failed')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div>
      <h1>Đang xử lý đăng nhập...</h1>
      <p>Vui lòng chờ trong giây lát.</p>
    </div>
  )
}
