// OrganizationUnit API
// Phase 1: MOCK DATA để preview UI.
// TODO: swap mock → adminGet/Post/Put/Delete khi backend expose /api/identity/organization-units

export interface OrganizationUnitDto {
  id: string
  parentId: string | null
  code: string
  displayName: string
  memberCount: number
  roleCount: number
  children?: OrganizationUnitDto[]
}

export interface OUMemberDto {
  id: string
  userName: string
  name: string
  email: string
}

let mockData: OrganizationUnitDto[] = [
  {
    id: '1',
    parentId: null,
    code: '00001',
    displayName: 'Công ty TNHH ABC',
    memberCount: 5,
    roleCount: 2,
    children: [
      {
        id: '11',
        parentId: '1',
        code: '00001.00001',
        displayName: 'Phòng Kỹ thuật',
        memberCount: 8,
        roleCount: 1,
      },
      {
        id: '12',
        parentId: '1',
        code: '00001.00002',
        displayName: 'Phòng Kinh doanh',
        memberCount: 6,
        roleCount: 1,
      },
    ],
  },
  {
    id: '2',
    parentId: null,
    code: '00002',
    displayName: 'Chi nhánh Hà Nội',
    memberCount: 3,
    roleCount: 1,
    children: [
      {
        id: '21',
        parentId: '2',
        code: '00002.00001',
        displayName: 'Bộ phận Hỗ trợ',
        memberCount: 4,
        roleCount: 1,
      },
    ],
  },
]

function findAndUpdate(
  items: OrganizationUnitDto[],
  id: string,
  updater: (item: OrganizationUnitDto) => OrganizationUnitDto | null
): boolean {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      const result = updater(items[i])
      if (result === null) {
        items.splice(i, 1)
      } else {
        items[i] = result
      }
      return true
    }
    if (items[i].children && findAndUpdate(items[i].children!, id, updater)) return true
  }
  return false
}

export const ouApi = {
  getList: async (): Promise<{ items: OrganizationUnitDto[]; totalCount: number }> => {
    await new Promise((r) => setTimeout(r, 200)) // simulate network
    return { items: mockData, totalCount: mockData.length }
  },

  create: async (dto: {
    displayName: string
    parentId?: string | null
  }): Promise<OrganizationUnitDto> => {
    const newItem: OrganizationUnitDto = {
      id: Date.now().toString(),
      code: `${Date.now()}`,
      memberCount: 0,
      roleCount: 0,
      parentId: dto.parentId ?? null,
      displayName: dto.displayName,
      children: [],
    }
    if (dto.parentId) {
      findAndUpdate(mockData, dto.parentId, (parent) => {
        parent.children = [...(parent.children ?? []), newItem]
        return parent
      })
    } else {
      mockData = [...mockData, newItem]
    }
    return newItem
  },

  update: async (id: string, dto: { displayName: string }): Promise<OrganizationUnitDto> => {
    let updated!: OrganizationUnitDto
    findAndUpdate(mockData, id, (item) => {
      updated = { ...item, ...dto }
      return updated
    })
    return updated
  },

  delete: async (id: string): Promise<void> => {
    findAndUpdate(mockData, id, () => null)
  },

  getMembers: async (_id: string): Promise<{ items: OUMemberDto[]; totalCount: number }> => {
    return { items: [], totalCount: 0 }
  },

  addMembers: async (_id: string, _userIds: string[]): Promise<void> => {},

  removeMember: async (_id: string, _userId: string): Promise<void> => {},
}
