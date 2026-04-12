'use client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useToast } from '@/components/ui/use-toast'
import { OrganizationUnitDto } from '@/lib/api/admin/organization-unit-api'
import { useAddOURoles, useRemoveOURole } from '@/lib/hooks/useOrganizationUnits'
import { useRoles } from '@/lib/hooks/useRoles'
import { Loader2, ShieldCheck } from 'lucide-react'

type Props = {
  unit: OrganizationUnitDto
  onDismiss: () => void
}

export const OURoleList = ({ unit, onDismiss }: Props) => {
  const { data: allRolesData, isLoading } = useRoles(0, 100)
  const addRoles = useAddOURoles()
  const removeRole = useRemoveOURole()
  const { toast } = useToast()

  // unit.roles contains role names from the DTO
  const currentRoleNames = new Set(unit.roles ?? [])

  const handleToggle = async (roleId: string, roleName: string, isChecked: boolean) => {
    try {
      if (isChecked) {
        await addRoles.mutateAsync({ id: unit.id, roleIds: [roleId] })
        toast({ title: 'Đã thêm', description: `Đã gán role ${roleName}` })
      } else {
        await removeRole.mutateAsync({ id: unit.id, roleId })
        toast({ title: 'Đã xoá', description: `Đã bỏ role ${roleName}` })
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật role', variant: 'destructive' })
    }
  }

  const isPending = addRoles.isPending || removeRole.isPending

  return (
    <Sheet open onOpenChange={onDismiss}>
      <SheetContent className="w-[400px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Roles: {unit.displayName}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && (
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {(allRolesData?.items ?? []).map((role) => {
                const checked = currentRoleNames.has(role.name!)
                return (
                  <div key={role.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted">
                    <Checkbox
                      id={`ou-role-${role.id}`}
                      checked={checked}
                      disabled={isPending}
                      onCheckedChange={(v) => handleToggle(role.id!, role.name!, !!v)}
                    />
                    <Label
                      htmlFor={`ou-role-${role.id}`}
                      className="cursor-pointer font-normal flex-1"
                    >
                      {role.name}
                    </Label>
                  </div>
                )
              })}
              {(allRolesData?.items ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Không có role nào</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-4">
          <Button variant="outline" onClick={onDismiss}>
            Đóng
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
