// /home/ha/tmp/abp-react/abp-react-source/abp-react/src/src/app/admin/permissions/PermissionGroup.tsx (File mới)

// /home/ha/tmp/abp-react/abp-react-source/abp-react/src/src/app/admin/permissions/PermissionGroup.tsx
'use client'

'use client'

import { PermissionGrantInfoDto } from '@/client'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useMemo } from 'react'

// Định nghĩa kiểu cho một node trong cây quyền
interface PermissionNode extends PermissionGrantInfoDto {
  children: PermissionNode[]
}

interface PermissionGroupProps {
  permissions: PermissionGrantInfoDto[]
  modifiedPermissions: { [key: string]: boolean }
  onPermissionChange: (name: string, isGranted: boolean) => void
}

function PermissionNodeComponent({
  node,
  modifiedPermissions,
  onPermissionChange,
  level = 0,
}: {
  node: PermissionNode
  modifiedPermissions: { [key: string]: boolean }
  onPermissionChange: (name: string, isGranted: boolean) => void
  level?: number
}) {
  const permissionName = node.name!
  const isGranted =
    permissionName in modifiedPermissions ? modifiedPermissions[permissionName] : node.isGranted
  const safeId = permissionName.replace(/\./g, '-')

  return (
    <div style={{ marginLeft: `${level * 2}rem` }}>
      <div className="flex items-center space-x-2 py-1">
        <Checkbox
          id={safeId}
          checked={isGranted}
          onCheckedChange={(checked) => onPermissionChange(permissionName, !!checked)}
        />
        <Label htmlFor={safeId} className="font-normal">
          {node.displayName}
        </Label>
      </div>
      {node.children.map((child) => (
        <PermissionNodeComponent
          key={child.name}
          node={child}
          modifiedPermissions={modifiedPermissions}
          onPermissionChange={onPermissionChange}
          level={level + 1}
        />
      ))}
    </div>
  )
}

export function PermissionGroup({
  permissions,
  modifiedPermissions,
  onPermissionChange,
}: PermissionGroupProps) {
  // Sử dụng useMemo để xây dựng cây chỉ một lần khi permissions thay đổi
  const permissionTree = useMemo(() => {
    const nodes: Record<string, PermissionNode> = {}
    const tree: PermissionNode[] = []

    // Khởi tạo tất cả các node
    for (const p of permissions) {
      nodes[p.name!] = { ...p, children: [] }
    }

    // Xây dựng cây
    for (const p of permissions) {
      const node = nodes[p.name!]
      if (p.parentName && nodes[p.parentName]) {
        nodes[p.parentName].children.push(node)
      } else {
        // Nếu không có parent hoặc parent không tồn tại trong nhóm này, coi nó là root
        tree.push(node)
      }
    }
    return tree
  }, [permissions])

  if (permissionTree.length === 0) {
    return <p className="text-sm text-muted-foreground">Không tìm thấy quyền nào khớp.</p>
  }

  return (
    <div className="space-y-4">
      {permissionTree.map((node) => (
        <PermissionNodeComponent
          key={node.name}
          node={node}
          modifiedPermissions={modifiedPermissions}
          onPermissionChange={onPermissionChange}
        />
      ))}
    </div>
  )
}
