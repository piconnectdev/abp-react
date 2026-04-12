import { adminDelete, adminGet, adminPost, adminPut } from './admin-fetch'

export interface OrganizationUnitDto {
  id: string
  parentId: string | null
  code?: string | null
  displayName?: string | null
  roles?: string[]
  memberCount: number
  roleCount: number
  children?: OrganizationUnitDto[]
}

export interface OUMemberDto {
  id: string
  userId: string
  userName: string
  name: string
  email: string
}

export interface OURoleDto {
  id: string
  name: string
}

export interface OrganizationUnitUserInput {
  userIds?: string[]
  userNameOrEmail?: string[]
}

export function buildOUTree(items: OrganizationUnitDto[]): OrganizationUnitDto[] {
  const map = new Map(items.map((i) => [i.id, { ...i, children: [] as OrganizationUnitDto[] }]))
  const roots: OrganizationUnitDto[] = []
  for (const item of map.values()) {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(item)
    } else {
      roots.push(item)
    }
  }
  return roots
}

export const ouApi = {
  getList: async (): Promise<{ items: OrganizationUnitDto[]; totalCount: number }> => {
    const res = await adminGet<{ items: OrganizationUnitDto[]; totalCount: number }>(
      '/api/identity/organization-units',
      { MaxResultCount: 1000 }
    )
    return { items: buildOUTree(res.items), totalCount: res.totalCount }
  },

  create: (dto: { displayName: string; parentId?: string | null }): Promise<OrganizationUnitDto> =>
    adminPost('/api/identity/organization-units', dto),

  update: (id: string, dto: { displayName: string }): Promise<OrganizationUnitDto> =>
    adminPut(`/api/identity/organization-units/${id}`, dto),

  delete: (id: string): Promise<void> => adminDelete(`/api/identity/organization-units/${id}`),

  move: (id: string, parentId: string | null): Promise<OrganizationUnitDto> =>
    adminPost(`/api/identity/organization-units/${id}/move`, { parentId }),

  getMembers: (
    id: string,
    params?: { SkipCount?: number; MaxResultCount?: number; Filter?: string }
  ): Promise<{ items: OUMemberDto[]; totalCount: number }> =>
    adminGet(`/api/identity/organization-units/${id}/members`, params),

  addMembers: (id: string, input: OrganizationUnitUserInput): Promise<void> =>
    adminPost(`/api/identity/organization-units/${id}/members`, input),

  removeMember: (id: string, userId: string): Promise<void> =>
    adminDelete(`/api/identity/organization-units/${id}/members/${userId}`),

  getRoles: (id: string): Promise<{ items: OURoleDto[]; totalCount: number }> =>
    adminGet(`/api/identity/organization-units/${id}/roles`, { MaxResultCount: 1000 }),

  addRoles: (id: string, roleIds: string[]): Promise<void> =>
    adminPost(`/api/identity/organization-units/${id}/roles`, { roleIds }),

  removeRole: (id: string, roleId: string): Promise<void> =>
    adminDelete(`/api/identity/organization-units/${id}/roles/${roleId}`),
}
