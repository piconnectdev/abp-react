import { adminDelete, adminGet, adminPost, adminPut } from './admin-fetch'

export interface TenantMemberDto {
  id: string
  userId: string
  userName: string
  email: string
  tenantId?: string
  tenantName?: string
  roles: string[]
  status?: number
  inviteStatus?: number
  isActive?: boolean
  isOwner?: boolean
  description?: string
  info?: string
  joinedDate?: string
  invitedAt?: string
  acceptedAt?: string
}

export interface InviteMemberDto {
  email: string
  roleNames?: string[]
}

export const tenantMemberApi = {
  // GET /api/v1/tenant-members/members
  getMembers: (params?: {
    SkipCount?: number
    MaxResultCount?: number
    Filter?: string
  }): Promise<{ items: TenantMemberDto[]; totalCount: number }> =>
    adminGet('/api/v1/tenant-members/members', params as Record<string, unknown>),

  // POST /api/v1/tenant-members/members
  inviteMember: (dto: InviteMemberDto): Promise<TenantMemberDto> =>
    adminPost('/api/v1/tenant-members/members', dto),

  // DELETE /api/v1/tenant-members/members/{userId}
  removeMember: (userId: string): Promise<void> =>
    adminDelete(`/api/v1/tenant-members/members/${userId}`),

  // PUT /api/v1/tenant-members/members/{userId}/roles
  updateRoles: (userId: string, roleNames: string[]): Promise<void> =>
    adminPut(`/api/v1/tenant-members/members/${userId}/roles`, { roleNames }),

  // PUT /api/v1/tenant-members/members/{id}
  updateMember: (id: string, dto: { roles: string[]; isActive: boolean }): Promise<TenantMemberDto> =>
    adminPut(`/api/v1/tenant-members/members/${id}`, dto),
}
