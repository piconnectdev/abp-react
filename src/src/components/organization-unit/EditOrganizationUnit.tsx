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
import { OrganizationUnitDto } from '@/lib/api/admin/organization-unit-api'
import { useUpdateOrganizationUnit } from '@/lib/hooks/useOrganizationUnits'
import { useState } from 'react'

type Props = {
  unit: OrganizationUnitDto
  onDismiss: () => void
}

export const EditOrganizationUnit = ({ unit, onDismiss }: Props) => {
  const [displayName, setDisplayName] = useState(unit.displayName)
  const { toast } = useToast()
  const update = useUpdateOrganizationUnit()

  const handleSave = async () => {
    if (!displayName.trim()) return
    try {
      await update.mutateAsync({ id: unit.id, dto: { displayName: displayName.trim() } })
      toast({ title: 'Thành công', description: 'Đã cập nhật đơn vị tổ chức' })
      onDismiss()
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật', variant: 'destructive' })
    }
  }

  return (
    <Dialog open onOpenChange={onDismiss}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa: {unit.displayName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Tên đơn vị *</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Mã: <span className="font-mono">{unit.code}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onDismiss}>Huỷ</Button>
          <Button onClick={handleSave} disabled={!displayName.trim() || update.isPending}>
            {update.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
