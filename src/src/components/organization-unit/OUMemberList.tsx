'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useToast } from '@/components/ui/use-toast'
import { OrganizationUnitDto } from '@/lib/api/admin/organization-unit-api'
import {
  useAddOUMembers,
  useOrganizationUnitMembers,
  useRemoveOUMember,
} from '@/lib/hooks/useOrganizationUnits'
import { useUsers } from '@/lib/hooks/useUsers'
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
  const [searchStr, setSearchStr] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const { data: usersData, isLoading: usersLoading } = useUsers(0, 20, searchStr || undefined)

  const handleRemove = async (userId: string, userName: string) => {
    try {
      await remove.mutateAsync(userId)
      toast({ title: 'Đã xoá', description: `Đã xoá ${userName} khỏi đơn vị` })
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể xoá thành viên', variant: 'destructive' })
    }
  }

  const handleAddUser = async (userId: string, userName: string) => {
    try {
      await addMembers.mutateAsync([userId])
      toast({ title: 'Đã thêm', description: `Đã thêm ${userName} vào đơn vị` })
      setShowSearch(false)
      setSearchStr('')
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể thêm thành viên', variant: 'destructive' })
    }
  }

  const existingUserIds = new Set(data?.items?.map((m) => m.userId) ?? [])

  return (
    <Sheet open onOpenChange={onDismiss}>
      <SheetContent className="w-[400px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Thành viên: {unit.displayName}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => setShowSearch((v) => !v)}
          >
            <Plus className="h-4 w-4" />
            Thêm thành viên
          </Button>

          {showSearch && (
            <div className="space-y-2 border rounded-md p-3">
              <Input
                placeholder="Tìm user..."
                value={searchStr}
                onChange={(e) => setSearchStr(e.target.value)}
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
                          onClick={() => handleAddUser(u.id!, u.userName!)}
                        >
                          Thêm
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && (!data?.items || data.items.length === 0) && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>Chưa có thành viên nào</p>
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
