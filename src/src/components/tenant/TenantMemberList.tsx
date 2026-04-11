'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Error from '@/components/ui/Error'
import Loader from '@/components/ui/Loader'
import { Search } from '@/components/ui/Search'
import { useToast } from '@/components/ui/use-toast'
import { TenantMemberDto } from '@/lib/api/admin/tenant-member-api'
import { useRemoveTenantMember, useTenantMembers } from '@/lib/hooks/useTenantMembers'
import { ColumnDef, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table'
import { Trash2, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CustomTable } from '@/components/ui/CustomTable'
import { InviteMember } from './InviteMember'

export const TenantMemberList = () => {
  const { toast } = useToast()
  const [searchStr, setSearchStr] = useState<string | undefined>()
  const [showInvite, setShowInvite] = useState(false)
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { isLoading, data, isError } = useTenantMembers(pageIndex, pageSize, searchStr)
  const remove = useRemoveTenantMember()

  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize])

  const handleRemove = async (member: TenantMemberDto) => {
    if (!confirm(`Xoá ${member.userName} khỏi tenant?`)) return
    try {
      await remove.mutateAsync(member.userId)
      toast({ title: 'Đã xoá', description: `Đã xoá ${member.userName}` })
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể xoá thành viên', variant: 'destructive' })
    }
  }

  const columns: ColumnDef<TenantMemberDto>[] = useMemo(
    () => [
      {
        header: 'Tenant Members',
        columns: [
          {
            accessorKey: 'actions',
            header: 'Actions',
            cell: (info) => (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleRemove(info.row.original)}
                disabled={remove.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ),
          },
          {
            accessorKey: 'userName',
            header: 'Username',
          },
          {
            accessorKey: 'email',
            header: 'Email',
          },
          {
            accessorKey: 'roleNames',
            header: 'Roles',
            cell: (info) => (
              <div className="flex gap-1 flex-wrap">
                {(info.getValue() as string[]).map((r) => (
                  <Badge key={r} variant="secondary" className="text-xs">
                    {r}
                  </Badge>
                ))}
              </div>
            ),
          },
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [remove.isPending]
  )

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    pageCount: Math.ceil((data?.totalCount ?? 0) / pageSize),
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Search onSearch={setSearchStr} />
        <Button onClick={() => setShowInvite(true)} className="gap-2 shrink-0">
          <UserPlus className="h-4 w-4" />
          Mời thành viên
        </Button>
      </div>

      {isLoading && <Loader />}
      {isError && <Error />}
      {!isLoading && !isError && <CustomTable table={table} />}

      {showInvite && <InviteMember onDismiss={() => setShowInvite(false)} />}
    </div>
  )
}
