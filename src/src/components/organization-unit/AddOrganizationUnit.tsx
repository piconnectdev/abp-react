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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateOrganizationUnit } from '@/lib/hooks/useOrganizationUnits'
import { useToast } from '@/components/ui/use-toast'
import { OrganizationUnitDto } from '@/lib/api/admin/organization-unit-api'
import { useState } from 'react'

type Props = {
  allUnits: OrganizationUnitDto[]
  defaultParentId?: string | null
  onDismiss: () => void
}

export const AddOrganizationUnit = ({ allUnits, defaultParentId, onDismiss }: Props) => {
  const [displayName, setDisplayName] = useState('')
  const [parentId, setParentId] = useState<string | null>(defaultParentId ?? null)
  const { toast } = useToast()
  const create = useCreateOrganizationUnit()

  const flatUnits = flattenUnits(allUnits)

  const handleSave = async () => {
    if (!displayName.trim()) return
    try {
      await create.mutateAsync({ displayName: displayName.trim(), parentId })
      toast({ title: 'Thành công', description: 'Đã tạo đơn vị tổ chức' })
      onDismiss()
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể tạo đơn vị tổ chức', variant: 'destructive' })
    }
  }

  return (
    <Dialog open onOpenChange={onDismiss}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm đơn vị tổ chức</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Tên đơn vị *</Label>
            <Input
              placeholder="Nhập tên đơn vị"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label>Đơn vị cha (tuỳ chọn)</Label>
            <Select
              value={parentId ?? 'none'}
              onValueChange={(v) => setParentId(v === 'none' ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Không có (đơn vị gốc)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không có (đơn vị gốc)</SelectItem>
                {flatUnits.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.indent}{u.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onDismiss}>Huỷ</Button>
          <Button onClick={handleSave} disabled={!displayName.trim() || create.isPending}>
            {create.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function flattenUnits(
  units: OrganizationUnitDto[],
  level = 0
): { id: string; displayName: string; indent: string }[] {
  const result: { id: string; displayName: string; indent: string }[] = []
  for (const u of units) {
    result.push({ id: u.id, displayName: u.displayName, indent: '　'.repeat(level) })
    if (u.children?.length) {
      result.push(...flattenUnits(u.children, level + 1))
    }
  }
  return result
}
