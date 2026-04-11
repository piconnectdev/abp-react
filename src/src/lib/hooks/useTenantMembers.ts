import { tenantMemberApi, InviteMemberDto } from '@/lib/api/admin/tenant-member-api'
import type { TenantMemberDto } from '@/lib/api/admin/tenant-member-api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QueryNames } from './QueryConstants'

export const useTenantMembers = (pageIndex: number, pageSize: number, filter?: string) => {
  return useQuery({
    queryKey: [QueryNames.GetTenantMembers, pageIndex, pageSize, filter],
    queryFn: () =>
      tenantMemberApi.getMembers({
        SkipCount: pageIndex * pageSize,
        MaxResultCount: pageSize,
        Filter: filter,
      }),
  })
}

export const useInviteTenantMember = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: InviteMemberDto) => tenantMemberApi.inviteMember(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryNames.GetTenantMembers] })
    },
  })
}

export const useRemoveTenantMember = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => tenantMemberApi.removeMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryNames.GetTenantMembers] })
    },
  })
}

export const useUpdateTenantMemberRoles = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, roleNames }: { userId: string; roleNames: string[] }) =>
      tenantMemberApi.updateRoles(userId, roleNames),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryNames.GetTenantMembers] })
    },
  })
}

export const useUpdateTenantMember = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, roles, isActive }: { id: string; roles: string[]; isActive: boolean }) =>
      tenantMemberApi.updateMember(id, { roles, isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryNames.GetTenantMembers] })
    },
  })
}

export type { TenantMemberDto }
