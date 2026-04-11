'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import PermissionManagement from './PermissionManagement'

type PermissionType = 'role' | 'user'

function PermissionsContent() {
  const sp = useSearchParams()
  const rawType = sp.get('type') ?? undefined
  const id = sp.get('id') ?? undefined

  const type: PermissionType | undefined =
    rawType === 'role' || rawType === 'user' ? (rawType as PermissionType) : undefined

  if (!type || !id) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold">Quản lý quyền</h1>
        <p className="mt-2 text-muted-foreground">Vui lòng chọn người dùng hoặc vai trò.</p>
      </div>
    )
  }

  return <PermissionManagement entityType={type} entityId={id} />
}

export default function PermissionsRootPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <PermissionsContent />
    </Suspense>
  )
}
