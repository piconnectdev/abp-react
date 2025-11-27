'use client'

import { getUserManager } from '@/lib/oidc-client'
import { User } from 'oidc-client-ts'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  tenantId: string | null
  setTenantId: (tenantId: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tenantId, setTenantIdState] = useState<string | null>(null)

  useEffect(() => {
    const userManager = getUserManager()
    // Lấy thông tin người dùng và tenant từ localStorage khi component mount
    async function getUser() {
      const userFromStorage = await userManager.getUser?.()
      setUser(userFromStorage)
      const tenantFromStorage = localStorage.getItem('tenantId')
      setTenantIdState(tenantFromStorage)
      setIsLoading(false)
    }
    getUser()

    // Lắng nghe sự kiện để cập nhật user state
    const onUserLoaded = (loadedUser: User) => setUser(loadedUser)
    const onUserUnloaded = () => setUser(null)

    userManager.events?.addUserLoaded(onUserLoaded)
    userManager.events?.addUserUnloaded(onUserUnloaded)

    return () => {
      userManager.events?.removeUserLoaded(onUserLoaded)
      userManager.events?.removeUserUnloaded(onUserUnloaded)
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

  return (
    <AuthContext.Provider value={{ user, isLoading, tenantId, setTenantId }}>
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
