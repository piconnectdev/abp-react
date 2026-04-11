'use client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { useRoles } from '@/lib/hooks/useRoles'
import { useUpdateTenantMember } from '@/lib/hooks/useTenantMembers'
import { TenantMemberDto } from '@/lib/api/admin/tenant-member-api'
import { useState } from 'react'

type Props = {
  member: TenantMemberDto
  onDismiss: () => void
}

export const EditMemberDialog = ({ member, onDismiss }: Props) => {
  const { toast } = useToast()
  const update = useUpdateTenantMember()
  const { data: rolesData, isLoading: rolesLoading } = useRoles(0, 100)

  const [selectedRoles, setSelectedRoles] = useState<string[]>(member.roles ?? [])
  const [isActive, setIsActive] = useState<boolean>(member.isActive ?? true)

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
    )
  }

  const handleSave = async () => {
    try {
      await update.mutateAsync({ id: member.userId, roles: selectedRoles, isActive })
      toast({ title: 'Đã cập nhật', description: `Đã cập nhật ${member.userName}` })
      onDismiss()
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật thành viên', variant: 'destructive' })
    }
  }

  return (
    <Dialog open onOpenChange={onDismiss}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thành viên — {member.userName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Kích hoạt</Label>
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="space-y-2">
            <Label>Roles</Label>
            {rolesLoading ? (
              <p className="text-sm text-muted-foreground">Đang tải roles...</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                {(rolesData?.items ?? []).map((role) => (
                  <div key={role.name} className="flex items-center gap-2">
                    <Checkbox
                      id={`role-${role.name}`}
                      checked={selectedRoles.includes(role.name!)}
                      onCheckedChange={() => toggleRole(role.name!)}
                    />
                    <Label htmlFor={`role-${role.name}`} className="font-normal cursor-pointer">
                      {role.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onDismiss}>Huỷ</Button>
          <Button onClick={handleSave} disabled={update.isPending}>
            {update.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
