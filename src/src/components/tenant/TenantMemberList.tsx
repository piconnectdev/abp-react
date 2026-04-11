'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CustomTable } from '@/components/ui/CustomTable'
import { InlineError } from '@/components/ui/InlineError'
import Loader from '@/components/ui/Loader'
import { Search } from '@/components/ui/Search'
import { useToast } from '@/components/ui/use-toast'
import { TenantMemberDto } from '@/lib/api/admin/tenant-member-api'
import { useRemoveTenantMember, useTenantMembers, useUpdateTenantMember } from '@/lib/hooks/useTenantMembers'
import { ColumnDef, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table'
import { Pencil, Power, Trash2, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EditMemberDialog } from './EditMemberDialog'
import { InviteMember } from './InviteMember'

export const TenantMemberList = () => {
  const { toast } = useToast()
  const [searchStr, setSearchStr] = useState<string | undefined>()
  const [showInvite, setShowInvite] = useState(false)
  const [editMember, setEditMember] = useState<TenantMemberDto | null>(null)
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { isLoading, data, isError, error, refetch } = useTenantMembers(pageIndex, pageSize, searchStr)
  const remove = useRemoveTenantMember()
  const update = useUpdateTenantMember()

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

  const handleToggleActive = async (member: TenantMemberDto) => {
    const newActive = !member.isActive
    try {
      await update.mutateAsync({ id: member.userId, roles: member.roles ?? [], isActive: newActive })
      toast({
        title: newActive ? 'Đã kích hoạt' : 'Đã vô hiệu hoá',
        description: member.userName,
      })
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật trạng thái', variant: 'destructive' })
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
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  title="Chỉnh sửa"
                  onClick={() => setEditMember(info.row.original)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className={`h-8 w-8 ${info.row.original.isActive ? 'text-green-600 hover:text-green-700' : 'text-muted-foreground hover:text-foreground'}`}
                  title={info.row.original.isActive ? 'Vô hiệu hoá' : 'Kích hoạt'}
                  onClick={() => handleToggleActive(info.row.original)}
                  disabled={update.isPending}
                >
                  <Power className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  title="Xoá"
                  onClick={() => handleRemove(info.row.original)}
                  disabled={remove.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
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
            accessorKey: 'isActive',
            header: 'Trạng thái',
            cell: (info) => (
              <Badge variant={info.getValue() ? 'default' : 'secondary'} className="text-xs">
                {info.getValue() ? 'Hoạt động' : 'Vô hiệu'}
              </Badge>
            ),
          },
          {
            accessorKey: 'roles',
            header: 'Roles',
            cell: (info) => (
              <div className="flex gap-1 flex-wrap">
                {((info.getValue() as string[]) ?? []).map((r) => (
                  <Badge key={r} variant="outline" className="text-xs">
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
    [remove.isPending, update.isPending]
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
        <Search onUpdate={(v) => setSearchStr(v || undefined)} value={searchStr ?? ''} />
        <Button onClick={() => setShowInvite(true)} className="gap-2 shrink-0">
          <UserPlus className="h-4 w-4" />
          Mời thành viên
        </Button>
      </div>

      {isLoading && <Loader />}
      {isError && <InlineError error={error} onRetry={refetch} />}
      {!isLoading && !isError && (
        <CustomTable table={table} totalCount={data?.totalCount ?? 0} pageSize={pageSize} />
      )}

      {showInvite && <InviteMember onDismiss={() => setShowInvite(false)} />}
      {editMember && <EditMemberDialog member={editMember} onDismiss={() => setEditMember(null)} />}
    </div>
  )
}
