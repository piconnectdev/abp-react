import { IdentityRoleDto, IdentityUserUpdateDto, userUpdate } from '@/client'
import { useToast } from '@/components/ui/use-toast'
import { QueryNames } from '@/lib/hooks/QueryConstants'
import { useQueryClient } from '@tanstack/react-query'
import { MouseEvent, useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { v4 } from 'uuid'

import Loader from '@/components/ui/Loader'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLanguage } from '@/context/LanguageContext'
import { useAssignableRoles } from '@/lib/hooks/useAssignableRoles'
import { useUserRoles } from '@/lib/hooks/useUserRoles'
import classNames from 'clsx'

const TABS_NAME = {
  USERS_EDIT: 'user_edit',
  USERS_ROLE_ASSIGN: 'user_role_assign',
}

type RoleType = {
  name: string
  id: string
}

type UserEditProps = {
  userDto: IdentityUserUpdateDto
  userId: string
  onDismiss: () => void
}
export const UserEdit = ({ userDto, userId, onDismiss }: UserEditProps) => {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const { handleSubmit, register } = useForm()
  const [roles, setRoles] = useState<RoleType[]>([])
  const userRole = useUserRoles({ userId })
  const assignableRoles = useAssignableRoles()

  const onSubmit = async (data: unknown) => {
    const user = data as IdentityUserUpdateDto
    try {
      await userUpdate({
        path: { id: userId },
        body: { ...userDto, ...user },
      })
      await queryClient.invalidateQueries({ queryKey: [QueryNames.GetUsers] })
      await queryClient.invalidateQueries({ queryKey: [QueryNames.GetUserRoles, userId] })
      toast({
        title: t('common.success'),
        description: t('user.updateSuccess'),
        variant: 'default',
      })
      onCloseEvent()
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast({
          title: t('common.error'),
          description: t('user.updateError'),
          variant: 'destructive',
        })
      }
    }
  }

  const onCloseEvent = () => {
    setOpen(false)
    onDismiss()
  }

  useEffect(() => {
    setOpen(true)
  }, [])

  useEffect(() => {
    if (userRole.data?.items) {
      const temp: RoleType[] = []
      userRole.data.items.forEach((r) => {
        temp.push({ name: r.name!, id: r.id! })
      })
      setRoles(temp)
    }
  }, [userRole.data?.items])

  const onRoleAssignEvent = useCallback((role: IdentityRoleDto) => {
    setRoles((prev) => {
      const exists = prev.find((r) => r.id === role.id)
      if (exists) return prev.filter((r) => r.id !== role.id)
      return [...prev, { name: role.name!, id: role.id! }]
    })
  }, [])

  const onRoleAssignedSaveEvent = async (e: MouseEvent) => {
    e.preventDefault()
    const updateUserDto: IdentityUserUpdateDto = {
      ...userDto,
      roleNames: roles?.map((r) => r.name) ?? [],
    }
    await onSubmit(updateUserDto)
  }
  return (
    <Dialog open={open} onOpenChange={onCloseEvent}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('user.edit')}: {userDto.userName}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={TABS_NAME.USERS_EDIT}>
          <TabsList className="w-full">
            <TabsTrigger value={TABS_NAME.USERS_EDIT} className="w-full">
              {t('user.tabInfo')}
            </TabsTrigger>
            <TabsTrigger value={TABS_NAME.USERS_ROLE_ASSIGN} className="w-full">
              {t('user.tabRoles')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value={TABS_NAME.USERS_EDIT}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <section className="flex flex-col space-y-5">
                <Input
                  required
                  placeholder={t('user.firstName')}
                  defaultValue={userDto.name ?? ''}
                  {...register('name')}
                />

                <Input
                  required
                  placeholder={t('user.lastName')}
                  defaultValue={userDto.surname ?? ''}
                  {...register('surname')}
                />
                <Input
                  required
                  placeholder={t('user.email')}
                  defaultValue={userDto.email ?? ''}
                  {...register('email')}
                />
                <Input
                  required
                  placeholder={t('user.phone')}
                  defaultValue={userDto.phoneNumber ?? ''}
                  {...register('phoneNumber')}
                />
              </section>

              <DialogFooter className="mt-5">
                <Button
                  onClick={(e: { preventDefault: () => void }) => {
                    e.preventDefault()
                    onCloseEvent()
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit">{t('common.save')}</Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value={TABS_NAME.USERS_ROLE_ASSIGN}>
            {(assignableRoles?.isLoading || userRole?.isLoading) && <Loader />}
            {assignableRoles?.isError && (
              <div className="bg-error p-10 text-3xl">
                {t('user.rolesError')} {userDto.userName}
              </div>
            )}
            {!assignableRoles.isLoading && !assignableRoles.isError && !userRole.isLoading && (
              <>
                {assignableRoles?.data?.items?.map((r) => (
                  <div key={v4()} className={classNames('flex items-center space-x-2 pb-5')}>
                    <Checkbox
                      id={r.id}
                      name={r.name!}
                      checked={!!roles?.find((l) => l.id === r.id)}
                      onCheckedChange={() => {
                        onRoleAssignEvent(r)
                      }}
                    />
                    <label htmlFor={r.id} className="text-sm font-medium leading-none">
                      {r.name}
                    </label>
                  </div>
                ))}
              </>
            )}
            <DialogFooter className="mt-5">
              <Button
                onClick={(e: { preventDefault: () => void }) => {
                  e.preventDefault()
                  onCloseEvent()
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button onClick={onRoleAssignedSaveEvent}>{t('common.save')}</Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
