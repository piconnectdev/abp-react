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
import { useLanguage } from '@/context/LanguageContext'
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
  const { t } = useLanguage()

  const candidates = flattenExcluding(allUnits, unit.id)

  const handleMove = async () => {
    const newParentId = selectedParentId === '__root__' ? null : selectedParentId
    if (newParentId === unit.parentId) {
      onDismiss()
      return
    }
    try {
      await move.mutateAsync({ id: unit.id, parentId: newParentId })
      toast({ title: t('common.success'), description: t('ou.moveSuccess') })
      onDismiss()
    } catch {
      toast({ title: t('common.error'), description: t('ou.moveError'), variant: 'destructive' })
    }
  }

  return (
    <Dialog open onOpenChange={onDismiss}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('ou.moveTitle')}: {unit.displayName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label>{t('ou.parentUnit')}</Label>
          <Select value={selectedParentId} onValueChange={setSelectedParentId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__root__">{t('ou.rootLevel')}</SelectItem>
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
            {t('common.cancel')}
          </Button>
          <Button onClick={handleMove} disabled={move.isPending}>
            {move.isPending ? t('common.loading') : t('ou.move')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
