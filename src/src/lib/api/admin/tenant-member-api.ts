import { adminDelete, adminGet, adminPost, adminPut } from './admin-fetch'

export interface TenantMemberDto {
  id: string
  userId: string
  userName: string
  name?: string
  email: string
  roleNames: string[]
  joinedAt?: string
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
}
