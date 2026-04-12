import { ouApi } from '@/lib/api/admin/organization-unit-api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QueryNames } from './QueryConstants'

export const useOrganizationUnits = () => {
  return useQuery({
    queryKey: [QueryNames.GetOrganizationUnits],
    queryFn: () => ouApi.getList(),
  })
}

export const useCreateOrganizationUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: { displayName: string; parentId?: string | null }) => ouApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryNames.GetOrganizationUnits] })
    },
  })
}

export const useUpdateOrganizationUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { displayName: string } }) =>
      ouApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryNames.GetOrganizationUnits] })
    },
  })
}

export const useDeleteOrganizationUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ouApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryNames.GetOrganizationUnits] })
    },
  })
}

export const useOrganizationUnitMembers = (ouId: string | null) => {
  return useQuery({
    queryKey: [QueryNames.GetOrganizationUnitMembers, ouId],
    queryFn: () => ouApi.getMembers(ouId!),
    enabled: !!ouId,
  })
}

export const useAddOUMembers = (ouId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userIds: string[]) => ouApi.addMembers(ouId, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryNames.GetOrganizationUnitMembers, ouId] })
      queryClient.invalidateQueries({ queryKey: [QueryNames.GetOrganizationUnits] })
    },
  })
}

export const useRemoveOUMember = (ouId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => ouApi.removeMember(ouId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryNames.GetOrganizationUnitMembers, ouId] })
      queryClient.invalidateQueries({ queryKey: [QueryNames.GetOrganizationUnits] })
    },
  })
}

export const useMoveOrganizationUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, parentId }: { id: string; parentId: string | null }) =>
      ouApi.move(id, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryNames.GetOrganizationUnits] })
    },
  })
}

export const useOrganizationUnitRoles = (ouId: string | null) => {
  return useQuery({
    queryKey: [QueryNames.GetOrganizationUnitRoles, ouId],
    queryFn: () => ouApi.getRoles(ouId!),
    enabled: !!ouId,
  })
}

export const useAddOURoles = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) => ouApi.addRoles(id, roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryNames.GetOrganizationUnits] })
    },
  })
}

export const useRemoveOURole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) => ouApi.removeRole(id, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryNames.GetOrganizationUnits] })
    },
  })
}
