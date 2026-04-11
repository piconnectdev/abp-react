import { getUserManager } from '@/lib/oidc-client'

export async function refreshToken(): Promise<void> {
  if (typeof window === 'undefined') return
  const userManager = getUserManager()
  await userManager.signinSilent().catch(() => {})
}
