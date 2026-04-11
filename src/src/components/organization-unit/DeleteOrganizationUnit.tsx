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

type Props = {
  unit: OrganizationUnitDto
  onDismiss: () => void
}

export const DeleteOrganizationUnit = ({ unit, onDismiss }: Props) => {
  const { toast } = useToast()
  const del = useDeleteOrganizationUnit()

  const handleDelete = async () => {
    try {
      await del.mutateAsync(unit.id)
      toast({ title: 'Đã xoá', description: `Đã xoá "${unit.displayName}"` })
      onDismiss()
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể xoá đơn vị tổ chức', variant: 'destructive' })
    }
  }

  return (
    <AlertDialog open onOpenChange={onDismiss}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xoá đơn vị tổ chức</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn xoá <strong>{unit.displayName}</strong>?
            {(unit.children?.length ?? 0) > 0 && (
              <span className="block mt-2 text-destructive font-medium">
                Cảnh báo: Đơn vị này có {unit.children!.length} đơn vị con sẽ bị xoá theo.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Huỷ</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={del.isPending}
          >
            {del.isPending ? 'Đang xoá...' : 'Xoá'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
