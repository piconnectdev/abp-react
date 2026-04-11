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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'
import { useRoles } from '@/lib/hooks/useRoles'
import { useInviteTenantMember } from '@/lib/hooks/useTenantMembers'
import { useState } from 'react'

type Props = {
  onDismiss: () => void
}

export const InviteMember = ({ onDismiss }: Props) => {
  const [userName, setUserName] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const { toast } = useToast()
  const { tenantId } = useAuth()
  const invite = useInviteTenantMember()
  const { data: rolesData, isLoading: rolesLoading } = useRoles(0, 100)

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
    )
  }

  const handleInvite = async () => {
    if (!userName.trim() || !tenantId) return
    try {
      await invite.mutateAsync({
        tenantId,
        userName: userName.trim(),
        roles: selectedRoles,
        status: 1,
        inviteStatus: 2,
        description: '',
      })
      toast({ title: 'Đã mời', description: `Đã gửi lời mời tới ${userName}` })
      onDismiss()
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể gửi lời mời', variant: 'destructive' })
    }
  }

  return (
    <Dialog open onOpenChange={onDismiss}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mời thành viên</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Username *</Label>
            <Input
              placeholder="Nhập username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            />
          </div>

          <div className="space-y-2">
            <Label>Roles</Label>
            {rolesLoading ? (
              <p className="text-sm text-muted-foreground">Đang tải roles...</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {(rolesData?.items ?? []).map((role) => (
                  <div key={role.name} className="flex items-center gap-2">
                    <Checkbox
                      id={`invite-role-${role.name}`}
                      checked={selectedRoles.includes(role.name!)}
                      onCheckedChange={() => toggleRole(role.name!)}
                    />
                    <Label htmlFor={`invite-role-${role.name}`} className="font-normal cursor-pointer">
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
          <Button onClick={handleInvite} disabled={!userName.trim() || !tenantId || invite.isPending}>
            {invite.isPending ? 'Đang gửi...' : 'Mời'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
