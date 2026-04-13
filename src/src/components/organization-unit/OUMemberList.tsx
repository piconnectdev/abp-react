'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { OrganizationUnitDto } from '@/lib/api/admin/organization-unit-api'
import {
  useAddOUMembers,
  useOrganizationUnitMembers,
  useRemoveOUMember,
} from '@/lib/hooks/useOrganizationUnits'
import { useUsers } from '@/lib/hooks/useUsers'
import { useLanguage } from '@/context/LanguageContext'
import { Loader2, Plus, Trash2, Users } from 'lucide-react'
import { useState } from 'react'

type Props = {
  unit: OrganizationUnitDto
  onDismiss: () => void
}

export const OUMemberList = ({ unit, onDismiss }: Props) => {
  const { data, isLoading } = useOrganizationUnitMembers(unit.id)
  const remove = useRemoveOUMember(unit.id)
  const addMembers = useAddOUMembers(unit.id)
  const { toast } = useToast()
  const { t } = useLanguage()

  const [showAdd, setShowAdd] = useState(false)
  const [tenantSearch, setTenantSearch] = useState('')
  const [hostInput, setHostInput] = useState('')

  const { data: usersData, isLoading: usersLoading } = useUsers(0, 20, tenantSearch || undefined)

  const existingUserIds = new Set(data?.items?.map((m) => m.id) ?? [])

  const handleRemove = async (userId: string, userName: string) => {
    try {
      await remove.mutateAsync(userId)
      toast({ title: t('common.success'), description: t('ou.memberRemoved', { name: userName }) })
    } catch {
      toast({ title: t('common.error'), description: t('ou.memberRemoveError'), variant: 'destructive' })
    }
  }

  const handleAddTenantUser = async (userId: string, userName: string) => {
    try {
      await addMembers.mutateAsync({ userIds: [userId] })
      toast({ title: t('common.success'), description: t('ou.memberAdded', { name: userName }) })
      setTenantSearch('')
    } catch {
      toast({ title: t('common.error'), description: t('ou.memberAddError'), variant: 'destructive' })
    }
  }

  const handleAddHostUser = async () => {
    const value = hostInput.trim()
    if (!value) return
    try {
      await addMembers.mutateAsync({ userNameOrEmail: [value] })
      toast({ title: t('common.success'), description: t('ou.memberAdded', { name: value }) })
      setHostInput('')
    } catch {
      toast({ title: t('common.error'), description: t('ou.memberAddError'), variant: 'destructive' })
    }
  }

  return (
    <Sheet open onOpenChange={onDismiss}>
      <SheetContent className="w-[400px] sm:w-[520px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('ou.membersTitle', { name: unit.displayName ?? '' })}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Toggle add panel */}
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => setShowAdd((v) => !v)}
          >
            <Plus className="h-4 w-4" />
            {t('ou.addMember')}
          </Button>

          {showAdd && (
            <div className="border rounded-md p-3">
              <Tabs defaultValue="tenant">
                <TabsList className="mb-3 w-full">
                  <TabsTrigger value="tenant" className="flex-1">{t('ou.fromTenant')}</TabsTrigger>
                  <TabsTrigger value="host" className="flex-1">{t('ou.fromHost')}</TabsTrigger>
                </TabsList>

                {/* Tab 1: search tenant users */}
                <TabsContent value="tenant" className="space-y-2 mt-0">
                  <Input
                    placeholder={t('ou.searchUser')}
                    value={tenantSearch}
                    onChange={(e) => setTenantSearch(e.target.value)}
                    autoFocus
                  />
                  {usersLoading && (
                    <div className="flex justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {!usersLoading && usersData?.items && (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {usersData.items
                        .filter((u) => !existingUserIds.has(u.id!))
                        .map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center justify-between p-2 rounded hover:bg-muted"
                          >
                            <div>
                              <p className="text-sm font-medium">{u.userName}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                            <Button
                              size="sm"
                              disabled={addMembers.isPending}
                              onClick={() => handleAddTenantUser(u.id!, u.userName!)}
                            >
                              {t('common.add')}
                            </Button>
                          </div>
                        ))}
                      {usersData.items.filter((u) => !existingUserIds.has(u.id!)).length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          {t('ou.userNotFound')}
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Tab 2: add host user by username/email */}
                <TabsContent value="host" className="mt-0">
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('ou.searchUser')}
                      value={hostInput}
                      onChange={(e) => setHostInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddHostUser()}
                    />
                    <Button
                      size="sm"
                      disabled={!hostInput.trim() || addMembers.isPending}
                      onClick={handleAddHostUser}
                    >
                      {t('common.add')}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('ou.hostUserHint')}
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Current members list */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && (!data?.items || data.items.length === 0) && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>{t('ou.noMembers')}</p>
            </div>
          )}

          {!isLoading && data?.items && data.items.length > 0 && (
            <div className="space-y-2">
              {data.items.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div>
                    <p className="text-sm font-medium">{member.name || member.userName}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemove(member.id, member.userName)}
                    disabled={remove.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
