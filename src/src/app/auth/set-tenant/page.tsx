'use client'

import { tenantGetTenantGuid } from '@/client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SetTenantPage() {
  const { tenantId, setTenantId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (tenantId) {
      router.replace('/')
      return
    }

    const host = window.location.host
    tenantGetTenantGuid({ query: { host } })
      .then(({ data }) => {
        setTenantId(typeof data === 'string' && data.trim() ? data.trim() : 'default')
      })
      .catch(() => setTenantId('default'))
      .finally(() => router.replace('/'))
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen text-muted-foreground text-sm">
      Đang tải...
    </div>
  )
}
