import { tokenStorage } from '@/lib/api/token-storage'
import { getUserManager } from '@/lib/oidc-client'

async function getCoreHeaders(): Promise<Record<string, string>> {
  const userManager = getUserManager()
  const user = await userManager.getUser()
  const token = tokenStorage.getTenant() ?? user?.access_token
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

const baseUrl = () => process.env.NEXT_PUBLIC_API_APPS_URL!

function buildUrl(path: string, params?: Record<string, unknown>): string {
  const url = new URL(`${baseUrl()}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v != null) url.searchParams.set(k, String(v))
    })
  }
  return url.toString()
}

export async function coreGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const res = await fetch(buildUrl(path, params), { headers: await getCoreHeaders() })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function corePost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    headers: await getCoreHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function corePut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'PUT',
    headers: await getCoreHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function coreDelete(path: string): Promise<void> {
  const res = await fetch(buildUrl(path), {
    method: 'DELETE',
    headers: await getCoreHeaders(),
  })
  if (!res.ok) throw new Error(await res.text())
}
