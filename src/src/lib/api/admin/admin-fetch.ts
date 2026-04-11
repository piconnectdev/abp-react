import { authClientConfig } from '@/config'
import { tokenStorage } from '@/lib/api/token-storage'
import { getUserManager } from '@/lib/oidc-client'

async function getAdminHeaders(tenantId?: string): Promise<Record<string, string>> {
  const userManager = getUserManager()
  const user = await userManager.getUser()
  const token = tokenStorage.getTenant() ?? user?.access_token
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (tenantId) headers['__tenant'] = tenantId
  return headers
}

async function getHostHeaders(): Promise<Record<string, string>> {
  const userManager = getUserManager()
  const user = await userManager.getUser()
  const token = tokenStorage.getHost() ?? user?.access_token
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

const baseUrl = () => authClientConfig.url!

function buildUrl(path: string, params?: Record<string, unknown>): string {
  const url = new URL(`${baseUrl()}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v != null) url.searchParams.set(k, String(v))
    })
  }
  return url.toString()
}

export async function adminGet<T>(
  path: string,
  params?: Record<string, unknown>,
  tenantId?: string
): Promise<T> {
  const res = await fetch(buildUrl(path, params), {
    headers: await getAdminHeaders(tenantId),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function adminPost<T>(
  path: string,
  body: unknown,
  tenantId?: string
): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    headers: await getAdminHeaders(tenantId),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function adminPut<T>(
  path: string,
  body: unknown,
  tenantId?: string
): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'PUT',
    headers: await getAdminHeaders(tenantId),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function adminDelete(path: string, tenantId?: string): Promise<void> {
  const res = await fetch(buildUrl(path), {
    method: 'DELETE',
    headers: await getAdminHeaders(tenantId),
  })
  if (!res.ok) throw new Error(await res.text())
}

export async function adminGetAsHost<T>(
  path: string,
  params?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(buildUrl(path, params), {
    headers: await getHostHeaders(),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
