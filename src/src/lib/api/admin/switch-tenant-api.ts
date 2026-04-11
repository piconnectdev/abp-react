import { authClientConfig } from '@/config'
import { parseApiError } from '@/lib/api/parse-api-error'
import { tokenStorage } from '@/lib/api/token-storage'
import { getUserManager } from '@/lib/oidc-client'

export const SWITCH_TENANT_METHOD: 'api' | 'oidc' = (process.env.NEXT_PUBLIC_SWITCH_TENANT_METHOD ??
  'api') as 'api' | 'oidc'

/**
 * Method A: GET /api/v1/auth/switch-tenant?id=tenantId
 * Gọi custom API trên admin server để lấy token mới cho tenant.
 */
export async function switchTenantViaApi(tenantId: string): Promise<{ access_token: string }> {
  const userManager = getUserManager()
  const user = await userManager.getUser()
  const token = tokenStorage.getHost() ?? user?.access_token
  const res = await fetch(`${authClientConfig.url}/api/v1/auth/switch-tenant?id=${tenantId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw await parseApiError(res)
  const data = await res.json()
  // Backend trả về accessToken (camelCase), map sang access_token để khớp với performSwitchTenant
  return { access_token: data.accessToken ?? data.access_token }
}

/**
 * Method B: POST /connect/token với grant_type=switch_tenant
 * Dùng OpenIddict để exchange token sang tenant mới.
 */
export async function switchTenantViaOidc(
  tenantId: string,
  currentToken: string
): Promise<{ access_token: string }> {
  const params = new URLSearchParams({
    grant_type: 'switch_tenant',
    tenant_id: tenantId,
    token: currentToken,
    client_id: authClientConfig.client_id!,
    scope: authClientConfig.scope!,
  })
  const res = await fetch(`${authClientConfig.url}/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  if (!res.ok) throw await parseApiError(res)
  return res.json()
}

/**
 * Thực hiện switch tenant và lưu dual token:
 * - host_access_token: token gốc để gọi Host-only APIs
 * - tenant_access_token: token mới sau khi switch
 */
export async function performSwitchTenant(tenantId: string): Promise<void> {
  const userManager = getUserManager()
  const user = await userManager.getUser()
  const currentToken = user?.access_token

  if (!currentToken) throw new Error('No active session')

  // Lưu host token lần đầu (chỉ lưu nếu chưa có, tránh ghi đè khi switch liên tiếp)
  if (!tokenStorage.getHost()) {
    tokenStorage.saveHost(currentToken)
  }

  let result: { access_token: string }
  if (SWITCH_TENANT_METHOD === 'oidc') {
    result = await switchTenantViaOidc(tenantId, currentToken)
  } else {
    result = await switchTenantViaApi(tenantId)
  }

  tokenStorage.saveTenant(result.access_token)
}

/**
 * Quay về host context: xóa tenant token.
 */
export function returnToHostContext(): void {
  tokenStorage.clearTenant()
}
