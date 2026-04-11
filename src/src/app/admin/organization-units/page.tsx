'use client'
import { AddOrganizationUnit } from '@/components/organization-unit/AddOrganizationUnit'
import { OrganizationUnitTree } from '@/components/organization-unit/OrganizationUnitTree'
import { InlineError } from '@/components/ui/InlineError'
import Loader from '@/components/ui/Loader'
import { Button } from '@/components/ui/button'
import { useOrganizationUnits } from '@/lib/hooks/useOrganizationUnits'
import { Network, Plus } from 'lucide-react'
import { useState } from 'react'

export default function OrganizationUnitsPage() {
  const { data, isLoading, isError, error, refetch } = useOrganizationUnits()
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">Đơn vị tổ chức</h1>
            <p className="text-sm text-muted-foreground">
              Quản lý cây tổ chức, phân công thành viên và phân quyền
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm đơn vị gốc
        </Button>
      </div>

      {/* Content */}
      {isLoading && <Loader />}
      {isError && <InlineError error={error} onRetry={refetch} />}

      {!isLoading && !isError && (
        <div className="rounded-lg border bg-card p-4">
          {(!data?.items || data.items.length === 0) ? (
            <div className="text-center py-12 text-muted-foreground">
              <Network className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Chưa có đơn vị tổ chức nào</p>
              <p className="text-sm mt-1">Nhấn &quot;Thêm đơn vị gốc&quot; để bắt đầu</p>
            </div>
          ) : (
            <OrganizationUnitTree units={data.items} />
          )}
        </div>
      )}

      {showAdd && (
        <AddOrganizationUnit
          allUnits={data?.items ?? []}
          defaultParentId={null}
          onDismiss={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
