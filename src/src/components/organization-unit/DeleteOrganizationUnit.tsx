'use client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { OrganizationUnitDto } from '@/lib/api/admin/organization-unit-api'
import { useDeleteOrganizationUnit } from '@/lib/hooks/useOrganizationUnits'
import { useLanguage } from '@/context/LanguageContext'

type Props = {
  unit: OrganizationUnitDto
  onDismiss: () => void
}

export const DeleteOrganizationUnit = ({ unit, onDismiss }: Props) => {
  const { toast } = useToast()
  const { t } = useLanguage()
  const del = useDeleteOrganizationUnit()

  const handleDelete = async () => {
    try {
      await del.mutateAsync(unit.id)
      toast({ title: t('common.success'), description: t('ou.deleteSuccess') })
      onDismiss()
    } catch {
      toast({ title: t('common.error'), description: t('ou.deleteError'), variant: 'destructive' })
    }
  }

  return (
    <AlertDialog open onOpenChange={onDismiss}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('ou.deleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('ou.deleteConfirm', { name: unit.displayName ?? '' })}
            {(unit.children?.length ?? 0) > 0 && (
              <span className="block mt-2 text-destructive font-medium">
                {unit.children!.length}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={del.isPending}
          >
            {del.isPending ? t('common.loading') : t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
