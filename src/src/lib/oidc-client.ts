// /src/lib/oidc-client.ts
import { authClientConfig } from '@/config'
import { UserManager, WebStorageStateStore } from 'oidc-client-ts'

let userManager: UserManager

/**
 * Trả về một instance của UserManager.
 * Chỉ khởi tạo một lần duy nhất ở phía client.
 */
export function getUserManager(): UserManager {
  // Chỉ thực hiện logic này ở phía client
  if (typeof window === 'undefined') {
    // Trên server, luôn trả về một đối tượng giả lập để không gây lỗi.
    // Các hàm trên đối tượng này sẽ không bao giờ được gọi ở server.
    return {} as UserManager
  }

  if (!userManager) {
    const settings = {
      authority: authClientConfig.url!,
      client_id: authClientConfig.client_id!,
      redirect_uri: `${window.location.origin}/auth/openiddict`,
      post_logout_redirect_uri: window.location.origin,
      scope: authClientConfig.scope,
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      automaticSilentRenew: true,
    }
    userManager = new UserManager(settings)
  }
  return userManager
}
