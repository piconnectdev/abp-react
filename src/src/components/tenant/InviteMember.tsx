'use client'
import { Button } from '@/components/ui/button'
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
import { useInviteTenantMember } from '@/lib/hooks/useTenantMembers'
import { useState } from 'react'

type Props = {
  onDismiss: () => void
}

export const InviteMember = ({ onDismiss }: Props) => {
  const [email, setEmail] = useState('')
  const { toast } = useToast()
  const invite = useInviteTenantMember()

  const handleInvite = async () => {
    if (!email.trim()) return
    try {
      await invite.mutateAsync({ email: email.trim() })
      toast({ title: 'Đã mời', description: `Đã gửi lời mời tới ${email}` })
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
            <Label>Email *</Label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onDismiss}>Huỷ</Button>
          <Button onClick={handleInvite} disabled={!email.trim() || invite.isPending}>
            {invite.isPending ? 'Đang gửi...' : 'Mời'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
