// /src/lib/api-client.ts
import { client } from '@/client'
import { authClientConfig } from '@/config'
import { getUserManager } from './oidc-client'

/**
 * Cấu hình client API mặc định để sử dụng baseUrl và interceptor.
 * Hàm này phải được gọi một lần duy nhất ở phía client, tại điểm vào của ứng dụng.
 */
export function configureApiClient() {
  // Chỉ chạy ở phía client
  if (typeof window === 'undefined') {
    return
  }

  // Ghi đè lại baseUrl của client mặc định
  client.setConfig({
    baseUrl: authClientConfig.url,
  })

  // Gắn interceptor để tự động thêm token và tenantId
  client.interceptors.request.use(async (request) => {
    const userManager = getUserManager()
    const user = await userManager.getUser?.()

    if (user && user.access_token) {
      request.headers.set('Authorization', `Bearer ${user.access_token}`)
    }
    const tenantId = localStorage.getItem('tenantId')
    if (tenantId) {
      request.headers.set('__tenant', tenantId)
    }

    return request
  })
}
