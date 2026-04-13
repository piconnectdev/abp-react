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
import {
  useAddOURoles,
  useOrganizationUnitRoles,
  useRemoveOURole,
} from '@/lib/hooks/useOrganizationUnits'
import { useRoles } from '@/lib/hooks/useRoles'
import { useLanguage } from '@/context/LanguageContext'
import { Loader2, ShieldCheck } from 'lucide-react'

type Props = {
  unit: OrganizationUnitDto
  onDismiss: () => void
}

export const OURoleList = ({ unit, onDismiss }: Props) => {
  // Live data from API — updates after each toggle (query invalidated on success)
  const { data: ouRolesData, isLoading: ouRolesLoading } = useOrganizationUnitRoles(unit.id)
  const { data: allRolesData, isLoading: allRolesLoading } = useRoles(0, 100)
  const addRoles = useAddOURoles()
  const removeRole = useRemoveOURole()
  const { toast } = useToast()
  const { t } = useLanguage()

  const currentRoleIds = new Set(ouRolesData?.items?.map((r) => r.id) ?? [])
  const isLoading = ouRolesLoading || allRolesLoading
  const isPending = addRoles.isPending || removeRole.isPending

  const handleToggle = async (roleId: string, roleName: string, isChecked: boolean) => {
    try {
      if (isChecked) {
        await addRoles.mutateAsync({ id: unit.id, roleIds: [roleId] })
        toast({ title: t('common.success'), description: t('ou.roleAdded', { name: roleName }) })
      } else {
        await removeRole.mutateAsync({ id: unit.id, roleId })
        toast({ title: t('common.success'), description: t('ou.roleRemoved', { name: roleName }) })
      }
    } catch {
      toast({ title: t('common.error'), description: t('ou.roleUpdateError'), variant: 'destructive' })
    }
  }

  return (
    <Sheet open onOpenChange={onDismiss}>
      <SheetContent className="w-[400px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            {t('ou.rolesTitle', { name: unit.displayName ?? '' })}
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
              {(allRolesData?.items ?? []).map((role) => (
                <div key={role.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted">
                  <Checkbox
                    id={`ou-role-${role.id}`}
                    checked={currentRoleIds.has(role.id!)}
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
              ))}
              {(allRolesData?.items ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">{t('ou.noRoles')}</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-4">
          <Button variant="outline" onClick={onDismiss}>
            {t('common.close')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
