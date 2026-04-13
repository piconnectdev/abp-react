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
import { useLanguage } from '@/context/LanguageContext'
import { useState } from 'react'

type Props = {
  unit: OrganizationUnitDto
  onDismiss: () => void
}

export const EditOrganizationUnit = ({ unit, onDismiss }: Props) => {
  const [displayName, setDisplayName] = useState(unit.displayName ?? '')
  const { toast } = useToast()
  const { t } = useLanguage()
  const update = useUpdateOrganizationUnit()

  const handleSave = async () => {
    if (!displayName.trim()) return
    try {
      await update.mutateAsync({ id: unit.id, dto: { displayName: displayName.trim() } })
      toast({ title: t('common.success'), description: t('ou.updateSuccess') })
      onDismiss()
    } catch {
      toast({ title: t('common.error'), description: t('ou.updateError'), variant: 'destructive' })
    }
  }

  return (
    <Dialog open onOpenChange={onDismiss}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('ou.editTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>{t('ou.displayName')} *</Label>
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
          <Button variant="outline" onClick={onDismiss}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} disabled={!displayName.trim() || update.isPending}>
            {update.isPending ? t('common.loading') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
