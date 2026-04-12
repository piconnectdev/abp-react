'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { OrganizationUnitDto } from '@/lib/api/admin/organization-unit-api'
import { useMoveOrganizationUnit } from '@/lib/hooks/useOrganizationUnits'
import { useState } from 'react'

type Props = {
  unit: OrganizationUnitDto
  allUnits: OrganizationUnitDto[]
  onDismiss: () => void
}

// Flatten nested tree, excluding the target unit and all its descendants
function flattenExcluding(
  units: OrganizationUnitDto[],
  excludeId: string
): OrganizationUnitDto[] {
  const result: OrganizationUnitDto[] = []
  function walk(items: OrganizationUnitDto[]) {
    for (const item of items) {
      if (item.id === excludeId) continue
      result.push(item)
      if (item.children?.length) walk(item.children)
    }
  }
  walk(units)
  return result
}

export const MoveOrganizationUnit = ({ unit, allUnits, onDismiss }: Props) => {
  const [selectedParentId, setSelectedParentId] = useState<string>(unit.parentId ?? '__root__')
  const move = useMoveOrganizationUnit()
  const { toast } = useToast()

  const candidates = flattenExcluding(allUnits, unit.id)

  const handleMove = async () => {
    const newParentId = selectedParentId === '__root__' ? null : selectedParentId
    if (newParentId === unit.parentId) {
      onDismiss()
      return
    }
    try {
      await move.mutateAsync({ id: unit.id, parentId: newParentId })
      toast({ title: 'Đã di chuyển', description: `Đã di chuyển "${unit.displayName}"` })
      onDismiss()
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể di chuyển đơn vị', variant: 'destructive' })
    }
  }

  return (
    <Dialog open onOpenChange={onDismiss}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Di chuyển: {unit.displayName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label>Đơn vị cha mới</Label>
          <Select value={selectedParentId} onValueChange={setSelectedParentId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__root__">(Gốc — không có cha)</SelectItem>
              {candidates.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.code} — {u.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onDismiss}>
            Huỷ
          </Button>
          <Button onClick={handleMove} disabled={move.isPending}>
            {move.isPending ? 'Đang di chuyển...' : 'Di chuyển'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
