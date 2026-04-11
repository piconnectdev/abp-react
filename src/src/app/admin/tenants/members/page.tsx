'use client'
import { TenantMemberList } from '@/components/tenant/TenantMemberList'
import { Users } from 'lucide-react'

export default function TenantMembersPage() {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-semibold">Thành viên Tenant</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý thành viên, mời người dùng và phân quyền trong tenant
          </p>
        </div>
      </div>
      <TenantMemberList />
    </div>
  )
}
