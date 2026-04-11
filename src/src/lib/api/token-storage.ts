const KEYS = {
  HOST: 'host_access_token',
  TENANT: 'tenant_access_token',
} as const

export const tokenStorage = {
  saveHost: (token: string) => localStorage.setItem(KEYS.HOST, token),
  saveTenant: (token: string) => localStorage.setItem(KEYS.TENANT, token),
  getHost: (): string | null => localStorage.getItem(KEYS.HOST),
  getTenant: (): string | null => localStorage.getItem(KEYS.TENANT),
  clearTenant: () => localStorage.removeItem(KEYS.TENANT),
  clearAll: () => {
    localStorage.removeItem(KEYS.HOST)
    localStorage.removeItem(KEYS.TENANT)
  },
}
