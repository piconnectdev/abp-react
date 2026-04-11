'use client'

import { performSwitchTenant, returnToHostContext } from '@/lib/api/admin/switch-tenant-api'
import { tokenStorage } from '@/lib/api/token-storage'
import { getUserManager } from '@/lib/oidc-client'
import { User } from 'oidc-client-ts'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  tenantId: string | null
  setTenantId: (tenantId: string | null) => void
  /** Token của Host / tenant gốc để gọi Host-only APIs */
  hostToken: string | null
  /** Token hiện tại sau khi switch tenant (null = đang ở host) */
  tenantToken: string | null
  /** Switch sang tenant mới, lưu dual token */
  switchTenant: (tenantId: string) => Promise<void>
  /** Quay lại host context, xóa tenantToken */
  returnToHost: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tenantId, setTenantIdState] = useState<string | null>(null)
  const [hostToken, setHostToken] = useState<string | null>(null)
  const [tenantToken, setTenantToken] = useState<string | null>(null)

  useEffect(() => {
    const userManager = getUserManager()
    async function getUser() {
      const userFromStorage = await userManager.getUser?.()
      setUser(userFromStorage)
      const tenantFromStorage = localStorage.getItem('tenantId')
      setTenantIdState(tenantFromStorage)
      // Khôi phục dual tokens từ localStorage nếu có
      setHostToken(tokenStorage.getHost())
      setTenantToken(tokenStorage.getTenant())
      setIsLoading(false)
    }
    getUser()

    const onUserLoaded = (loadedUser: User) => setUser(loadedUser)
    const onUserUnloaded = () => {
      setUser(null)
      tokenStorage.clearAll()
      setHostToken(null)
      setTenantToken(null)
    }

    const onSilentRenewError = () => {
      userManager.signinRedirect()
    }
    const onAccessTokenExpired = () => {
      userManager.signinRedirect()
    }

    userManager.events?.addUserLoaded(onUserLoaded)
    userManager.events?.addUserUnloaded(onUserUnloaded)
    userManager.events?.addSilentRenewError(onSilentRenewError)
    userManager.events?.addAccessTokenExpired(onAccessTokenExpired)

    return () => {
      userManager.events?.removeUserLoaded(onUserLoaded)
      userManager.events?.removeUserUnloaded(onUserUnloaded)
      userManager.events?.removeSilentRenewError(onSilentRenewError)
      userManager.events?.removeAccessTokenExpired(onAccessTokenExpired)
    }
  }, [])

  const setTenantId = (id: string | null) => {
    setTenantIdState(id)
    if (id) {
      localStorage.setItem('tenantId', id)
    } else {
      localStorage.removeItem('tenantId')
    }
  }

  const switchTenant = useCallback(async (newTenantId: string) => {
    await performSwitchTenant(newTenantId)
    setHostToken(tokenStorage.getHost())
    setTenantToken(tokenStorage.getTenant())
    setTenantId(newTenantId)
  }, [])

  const returnToHost = useCallback(() => {
    returnToHostContext()
    setTenantToken(null)
    setTenantId(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        tenantId,
        setTenantId,
        hostToken,
        tenantToken,
        switchTenant,
        returnToHost,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
