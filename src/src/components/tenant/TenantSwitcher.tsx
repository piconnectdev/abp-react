'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'
import { useTenants } from '@/lib/hooks/useTenants'
import { Building2, ChevronDown, LogOut } from 'lucide-react'
import { useState } from 'react'

export const TenantSwitcher = () => {
  const { tenantId, tenantToken, switchTenant, returnToHost } = useAuth()
  const { data: tenantsData } = useTenants(0, 50)
  const { toast } = useToast()
  const [isSwitching, setIsSwitching] = useState(false)

  const currentTenant = tenantsData?.items?.find((t) => t.id === tenantId)
  const isInTenant = !!tenantToken

  const handleSwitch = async (id: string, name: string) => {
    if (id === tenantId) return
    setIsSwitching(true)
    try {
      await switchTenant(id)
      toast({ title: 'Đã chuyển tenant', description: `Đang làm việc trong: ${name}` })
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể chuyển tenant', variant: 'destructive' })
    } finally {
      setIsSwitching(false)
    }
  }

  const handleReturnToHost = () => {
    returnToHost()
    toast({ title: 'Đã quay về Host', description: 'Đang dùng token Host' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8" disabled={isSwitching}>
          <Building2 className="h-3.5 w-3.5" />
          <span className="max-w-[120px] truncate text-xs">
            {isInTenant ? (currentTenant?.name ?? 'Tenant') : 'Host'}
          </span>
          {isInTenant && (
            <Badge variant="secondary" className="text-xs px-1 py-0">T</Badge>
          )}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Chuyển tenant
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Host option */}
        <DropdownMenuItem
          onClick={handleReturnToHost}
          className={!isInTenant ? 'bg-primary/5 font-medium' : ''}
        >
          <Building2 className="h-4 w-4 mr-2 opacity-60" />
          Host
          {!isInTenant && <Badge variant="secondary" className="ml-auto text-xs">Hiện tại</Badge>}
        </DropdownMenuItem>

        {tenantsData?.items && tenantsData.items.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {tenantsData.items.map((tenant) => (
              <DropdownMenuItem
                key={tenant.id}
                onClick={() => handleSwitch(tenant.id!, tenant.name!)}
                className={tenant.id === tenantId && isInTenant ? 'bg-primary/5 font-medium' : ''}
              >
                <Building2 className="h-4 w-4 mr-2 opacity-60" />
                <span className="truncate">{tenant.name}</span>
                {tenant.id === tenantId && isInTenant && (
                  <Badge variant="secondary" className="ml-auto text-xs">Hiện tại</Badge>
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}

        {isInTenant && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleReturnToHost} className="text-muted-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              Quay về Host
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
