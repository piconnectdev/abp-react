'use client'
import { IdentityUserDto, IdentityUserUpdateDto } from '@/client'
import { CustomTable } from '@/components/ui/CustomTable'
import { InlineError } from '@/components/ui/InlineError'
import Loader from '@/components/ui/Loader'
import { Search } from '@/components/ui/Search'
import { useToast } from '@/components/ui/use-toast'
import { useLanguage } from '@/context/LanguageContext'
import { QueryNames } from '@/lib/hooks/QueryConstants'
import { useUsers } from '@/lib/hooks/useUsers'
import { Permissions, USER_ROLE } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { ColumnDef, PaginationState, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { PermissionActions } from '../permission/PermissionActions'
import { DeleteUser } from './DeleteUser'
import { UserEdit } from './UserEdit'

type UserActionDialogState = {
  userId: string
  userDto: IdentityUserUpdateDto
  dialogType: 'edit' | 'permission' | 'delete'
} | null

export const UserList = () => {
  const { toast } = useToast()
  const { t } = useLanguage()
  const queryClient = useQueryClient()

  const [searchStr, setSearchStr] = useState<string>('')
  const [userActionDialog, setUserActionDialog] = useState<UserActionDialogState>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { isLoading, data, isError, error, refetch } = useUsers(
    pagination.pageIndex,
    pagination.pageSize,
    searchStr || undefined
  )

  const handleActionComplete = () => {
    queryClient.invalidateQueries({ queryKey: [QueryNames.GetUsers] })
    setUserActionDialog(null)
  }

  const columns = useMemo(
    (): ColumnDef<IdentityUserDto>[] => [
      {
        header: t('user.title'),
        columns: [
          {
            accessorKey: 'actions',
            header: t('common.actions'),
            cell: (info) => (
              <PermissionActions
                actions={[
                  {
                    icon: 'permission',
                    policy: Permissions.USERS_MANAGE_PERMISSIONS,
                    callback: () =>
                      (window.location.href = `/admin/permissions?type=user&id=${info.row.original.id}`),
                  },
                  {
                    icon: 'pencil',
                    policy: Permissions.USERS_UPDATE,
                    callback: () =>
                      setUserActionDialog({
                        userId: info.row.original.id!,
                        userDto: info.row.original as IdentityUserUpdateDto,
                        dialogType: 'edit',
                      }),
                  },
                  {
                    icon: 'trash',
                    policy: Permissions.USERS_DELETE,
                    visible: !info.row.original.userName?.includes(USER_ROLE.ADMIN),
                    callback: () =>
                      setUserActionDialog({
                        userId: info.row.original.id!,
                        userDto: info.row.original as IdentityUserUpdateDto,
                        dialogType: 'delete',
                      }),
                  },
                ]}
              />
            ),
          },
          {
            accessorKey: 'userName',
            header: t('user.userName'),
            cell: (info) => info.getValue(),
          },
          {
            accessorKey: 'email',
            header: t('common.email'),
            cell: (info) => info.getValue(),
          },
          {
            accessorKey: 'isActive',
            header: t('common.active'),
            cell: (info) => (info.getValue() ? t('common.yes') : t('common.no')),
          },
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
  )

  const table = useReactTable({
    data: data?.items ?? [],
    pageCount: data?.totalCount ?? -1,
    state: { pagination },
    columns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
  })

  if (isLoading) return <Loader />
  if (isError) return <InlineError error={error} onRetry={refetch} />

  return (
    <>
      {userActionDialog && (
        <>
          {userActionDialog.dialogType === 'edit' && (
            <UserEdit
              userId={userActionDialog.userId}
              userDto={userActionDialog.userDto}
              onDismiss={handleActionComplete}
            />
          )}
          {userActionDialog.dialogType === 'delete' && (
            <DeleteUser
              user={{
                username: userActionDialog.userDto.userName!,
                userId: userActionDialog.userId,
              }}
              onDismiss={handleActionComplete}
            />
          )}
        </>
      )}
      <Search onUpdate={setSearchStr} value={searchStr} />
      <CustomTable<IdentityUserDto>
        table={table}
        totalCount={data?.totalCount ?? 0}
        pageSize={pagination.pageSize}
      />
    </>
  )
}
