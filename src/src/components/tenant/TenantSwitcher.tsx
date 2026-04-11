'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'
import { useTenants } from '@/lib/hooks/useTenants'
import { Building2, ChevronDown, LogOut } from 'lucide-react'
import { useState } from 'react'

export const TenantSwitcher = () => {
  const { tenantId, tenantToken, switchTenant, returnToHost } = useAuth()
  const { data: tenantsData } = useTenants(0, 200)
  const { toast } = useToast()
  const [isSwitching, setIsSwitching] = useState(false)
  const [open, setOpen] = useState(false)

  const currentTenant = tenantsData?.items?.find((t) => t.id === tenantId)
  const isInTenant = !!tenantToken

  const handleSwitch = async (id: string, name: string) => {
    setOpen(false)
    if (id === tenantId && isInTenant) return
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
    setOpen(false)
    returnToHost()
    toast({ title: 'Đã quay về Host', description: 'Đang dùng token Host' })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <Command>
          <CommandInput placeholder="Tìm tenant..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy tenant.</CommandEmpty>
            <CommandGroup heading="Chuyển tenant">
              <CommandItem
                onSelect={handleReturnToHost}
                className={!isInTenant ? 'font-medium' : ''}
              >
                <Building2 className="h-4 w-4 mr-2 opacity-60" />
                Host
                {!isInTenant && (
                  <Badge variant="secondary" className="ml-auto text-xs">Hiện tại</Badge>
                )}
              </CommandItem>
              {tenantsData?.items?.map((tenant) => (
                <CommandItem
                  key={tenant.id}
                  onSelect={() => handleSwitch(tenant.id!, tenant.name!)}
                  className={tenant.id === tenantId && isInTenant ? 'font-medium' : ''}
                >
                  <Building2 className="h-4 w-4 mr-2 opacity-60" />
                  <span className="truncate">{tenant.name}</span>
                  {tenant.id === tenantId && isInTenant && (
                    <Badge variant="secondary" className="ml-auto text-xs">Hiện tại</Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {isInTenant && (
              <CommandGroup>
                <CommandItem onSelect={handleReturnToHost} className="text-muted-foreground">
                  <LogOut className="h-4 w-4 mr-2" />
                  Quay về Host
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
