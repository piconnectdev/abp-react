// /src/lib/api-client-initializer.ts
import { client as adminClient } from '@/client'
import { authClientConfig } from '@/config'
import { client as coreClient } from '@/core-client'
import { getUserManager } from './oidc-client'

/**
 * Cấu hình client API mặc định cho Admin Service.
 * Hàm này sẽ ghi đè `baseUrl` và thêm interceptor để tự động đính kèm token.
 * Nó chỉ nên được gọi một lần duy nhất ở phía client, tại điểm vào của ứng dụng.
 */
export function configureAdminApiClient() {
  // Chỉ chạy ở phía client
  if (typeof window === 'undefined') {
    return
  }

  // Ghi đè lại baseUrl của client mặc định
  adminClient.setConfig({
    baseUrl: authClientConfig.url,
  })

  // Ghi đè lại baseUrl của core-client mặc định
  coreClient.setConfig({
    baseUrl: process.env.NEXT_PUBLIC_APPS_API_URL,
  })

  // Gắn interceptor để tự động thêm token
  adminClient.interceptors.request.use(async (request) => {
    const userManager = getUserManager()
    const user = await userManager.getUser?.()

    if (user?.access_token) {
      request.headers.set('Authorization', `Bearer ${user.access_token}`)
    }

    return request
  })

  // Gắn interceptor tương tự cho coreClient
  coreClient.interceptors.request.use(async (request) => {
    const userManager = getUserManager()
    const user = await userManager.getUser?.()

    if (user?.access_token) {
      request.headers.set('Authorization', `Bearer ${user.access_token}`)
    }

    return request
  })
}
