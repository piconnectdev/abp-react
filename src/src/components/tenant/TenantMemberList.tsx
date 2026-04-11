'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CustomTable } from '@/components/ui/CustomTable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InlineError } from '@/components/ui/InlineError'
import Loader from '@/components/ui/Loader'
import { Search } from '@/components/ui/Search'
import { useToast } from '@/components/ui/use-toast'
import { TenantMemberDto } from '@/lib/api/admin/tenant-member-api'
import {
  useRemoveTenantMember,
  useTenantMembers,
  useUpdateTenantMember,
} from '@/lib/hooks/useTenantMembers'
import { ColumnDef, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table'
import { Cog, PencilIcon, Power, Trash, UserPlus } from 'lucide-react'
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

  const { isLoading, data, isError, error, refetch } = useTenantMembers(
    pageIndex,
    pageSize,
    searchStr
  )
  const remove = useRemoveTenantMember()
  const update = useUpdateTenantMember()

  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize])

  const handleRemove = async (member: TenantMemberDto) => {
    if (!confirm(`Xoá ${member.userName} khỏi tenant?`)) return
    try {
      await remove.mutateAsync(member.id)
      toast({ title: 'Đã xoá', description: `Đã xoá ${member.userName}` })
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể xoá thành viên', variant: 'destructive' })
    }
  }

  const handleToggleActive = async (member: TenantMemberDto) => {
    const newActive = !member.isActive
    try {
      await update.mutateAsync({
        id: member.id,
        roles: member.roles ?? [],
        isActive: newActive,
      })
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
            cell: (info) => {
              const member = info.row.original
              return (
                <section className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="flex items-center space-x-1">
                        <Cog width={16} height={16} />
                        <span className="hidden sm:inline">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Button onClick={() => setEditMember(member)}>
                          <div className="flex items-center space-x-1">
                            <PencilIcon width={18} height={18} className="flex-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </div>
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Button
                          onClick={() => handleToggleActive(member)}
                          disabled={update.isPending}
                        >
                          <div className="flex items-center space-x-1">
                            <Power width={18} height={18} className="flex-1" />
                            <span className="hidden sm:inline">
                              {member.isActive ? 'Deactivate' : 'Activate'}
                            </span>
                          </div>
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Button onClick={() => handleRemove(member)} disabled={remove.isPending}>
                          <div className="flex items-center space-x-1">
                            <Trash width={18} height={18} className="flex-1" />
                            <span className="hidden sm:inline">Delete</span>
                          </div>
                        </Button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </section>
              )
            },
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
