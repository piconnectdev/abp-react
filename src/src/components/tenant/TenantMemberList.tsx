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
import { useLanguage } from '@/context/LanguageContext'

export const TenantMemberList = () => {
  const { toast } = useToast()
  const { t } = useLanguage()
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
    if (!confirm(t('tenant.members.deleteConfirm', { name: member.userName }))) return
    try {
      await remove.mutateAsync(member.id)
      toast({ title: t('common.success'), description: t('tenant.members.deleteSuccess', { name: member.userName }) })
    } catch {
      toast({ title: t('common.error'), description: t('tenant.members.deleteError'), variant: 'destructive' })
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
        title: newActive ? t('tenant.members.activateSuccess') : t('tenant.members.deactivateSuccess'),
        description: member.userName,
      })
    } catch {
      toast({ title: t('common.error'), description: t('tenant.members.statusError'), variant: 'destructive' })
    }
  }

  const columns: ColumnDef<TenantMemberDto>[] = useMemo(
    () => [
      {
        header: t('tenant.members.title'),
        columns: [
          {
            accessorKey: 'actions',
            header: t('common.actions'),
            cell: (info) => {
              const member = info.row.original
              return (
                <section className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="flex items-center space-x-1">
                        <Cog width={16} height={16} />
                        <span className="hidden sm:inline">{t('common.actions')}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Button onClick={() => setEditMember(member)}>
                          <div className="flex items-center space-x-1">
                            <PencilIcon width={18} height={18} className="flex-1" />
                            <span className="hidden sm:inline">{t('common.edit')}</span>
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
                              {member.isActive ? t('tenant.members.deactivate') : t('tenant.members.activate')}
                            </span>
                          </div>
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Button onClick={() => handleRemove(member)} disabled={remove.isPending}>
                          <div className="flex items-center space-x-1">
                            <Trash width={18} height={18} className="flex-1" />
                            <span className="hidden sm:inline">{t('common.delete')}</span>
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
            header: t('tenant.members.username'),
          },
          {
            accessorKey: 'email',
            header: t('common.email'),
          },
          {
            accessorKey: 'isActive',
            header: t('common.status'),
            cell: (info) => (
              <Badge variant={info.getValue() ? 'default' : 'secondary'} className="text-xs">
                {info.getValue() ? t('common.active') : t('common.inactive')}
              </Badge>
            ),
          },
          {
            accessorKey: 'roles',
            header: t('tenant.members.roles'),
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
          {t('tenant.members.invite')}
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
