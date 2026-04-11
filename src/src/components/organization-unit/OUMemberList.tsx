'use client'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useToast } from '@/components/ui/use-toast'
import { OrganizationUnitDto } from '@/lib/api/admin/organization-unit-api'
import {
  useOrganizationUnitMembers,
  useRemoveOUMember,
} from '@/lib/hooks/useOrganizationUnits'
import { Loader2, Trash2, Users } from 'lucide-react'

type Props = {
  unit: OrganizationUnitDto
  onDismiss: () => void
}

export const OUMemberList = ({ unit, onDismiss }: Props) => {
  const { data, isLoading } = useOrganizationUnitMembers(unit.id)
  const remove = useRemoveOUMember(unit.id)
  const { toast } = useToast()

  const handleRemove = async (userId: string, userName: string) => {
    try {
      await remove.mutateAsync(userId)
      toast({ title: 'Đã xoá', description: `Đã xoá ${userName} khỏi đơn vị` })
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể xoá thành viên', variant: 'destructive' })
    }
  }

  return (
    <Sheet open onOpenChange={onDismiss}>
      <SheetContent className="w-[400px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Thành viên: {unit.displayName}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && (!data?.items || data.items.length === 0) && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>Chưa có thành viên nào</p>
              <p className="text-xs mt-1">(API mock - sẽ có dữ liệu khi backend sẵn sàng)</p>
            </div>
          )}

          {!isLoading && data?.items && data.items.length > 0 && (
            <div className="space-y-2">
              {data.items.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div>
                    <p className="text-sm font-medium">{member.name || member.userName}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemove(member.id, member.userName)}
                    disabled={remove.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
