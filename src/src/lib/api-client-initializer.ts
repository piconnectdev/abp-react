// /src/lib/api-client-initializer.ts
import { client as adminClient } from '@/client'
import { authClientConfig } from '@/config'
import { client as coreClient } from '@/core-client'
import { tokenStorage } from '@/lib/api/token-storage'
import { getUserManager } from './oidc-client'

// Endpoints that must always use the host token (not tenant-scoped)
const HOST_ONLY_PATHS = ['/api/identity/my-profile']

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
    baseUrl: process.env.NEXT_PUBLIC_API_APPS_URL,
  })

  // Gắn interceptor để tự động thêm token
  // Ưu tiên: tenantToken → hostToken → user.access_token
  // Ngoại lệ: HOST_ONLY_PATHS luôn dùng hostToken (bỏ qua tenantToken)
  adminClient.interceptors.request.use(async (request) => {
    const userManager = getUserManager()
    const user = await userManager.getUser?.()
    const hostToken = tokenStorage.getHost() ?? user?.access_token
    const tenantToken = tokenStorage.getTenant()

    const isHostOnly = HOST_ONLY_PATHS.some((p) => request.url.includes(p))
    const validTenantToken = tenantToken && tenantToken !== 'undefined' ? tenantToken : null
    const token = !isHostOnly && validTenantToken ? validTenantToken : hostToken
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    return request
  })

  // Gắn interceptor cho coreClient — luôn dùng tenant token nếu có
  coreClient.interceptors.request.use(async (request) => {
    const userManager = getUserManager()
    const user = await userManager.getUser?.()
    const tenantToken = tokenStorage.getTenant()
    const validTenantToken = tenantToken && tenantToken !== 'undefined' ? tenantToken : null
    const token = validTenantToken ?? tokenStorage.getHost() ?? user?.access_token
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    return request
  })
}
