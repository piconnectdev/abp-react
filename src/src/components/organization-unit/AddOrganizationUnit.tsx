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
import { useLanguage } from '@/context/LanguageContext'
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
  const { t } = useLanguage()
  const create = useCreateOrganizationUnit()

  const flatUnits = flattenUnits(allUnits)

  const handleSave = async () => {
    if (!displayName.trim()) return
    try {
      await create.mutateAsync({ displayName: displayName.trim(), parentId })
      toast({ title: t('common.success'), description: t('ou.addSuccess') })
      onDismiss()
    } catch {
      toast({ title: t('common.error'), description: t('ou.addError'), variant: 'destructive' })
    }
  }

  return (
    <Dialog open onOpenChange={onDismiss}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('ou.add')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>{t('ou.displayName')} *</Label>
            <Input
              placeholder={t('ou.displayNamePlaceholder')}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label>{t('ou.parentUnit')}</Label>
            <Select
              value={parentId ?? 'none'}
              onValueChange={(v) => setParentId(v === 'none' ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('ou.rootLevel')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('ou.rootLevel')}</SelectItem>
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
          <Button variant="outline" onClick={onDismiss}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} disabled={!displayName.trim() || create.isPending}>
            {create.isPending ? t('common.loading') : t('common.save')}
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
    result.push({ id: u.id, displayName: u.displayName ?? '', indent: '　'.repeat(level) })
    if (u.children?.length) {
      result.push(...flattenUnits(u.children, level + 1))
    }
  }
  return result
}
