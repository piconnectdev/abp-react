'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OrganizationUnitDto } from '@/lib/api/admin/organization-unit-api'
import { Permissions } from '@/lib/utils'
import { useAppConfig } from '@/lib/hooks/useAppConfig'
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { AddOrganizationUnit } from './AddOrganizationUnit'
import { DeleteOrganizationUnit } from './DeleteOrganizationUnit'
import { EditOrganizationUnit } from './EditOrganizationUnit'
import { OUMemberList } from './OUMemberList'

type DialogState =
  | { type: 'add'; parentId: string | null }
  | { type: 'edit'; unit: OrganizationUnitDto }
  | { type: 'delete'; unit: OrganizationUnitDto }
  | { type: 'members'; unit: OrganizationUnitDto }
  | null

type Props = {
  units: OrganizationUnitDto[]
}

export const OrganizationUnitTree = ({ units }: Props) => {
  const [dialog, setDialog] = useState<DialogState>(null)
  const { data: appConfig } = useAppConfig()
  const policies = appConfig?.auth?.grantedPolicies ?? {}

  const canCreate = !!policies[Permissions.ORG_UNITS_CREATE]
  const canUpdate = !!policies[Permissions.ORG_UNITS_UPDATE]
  const canDelete = !!policies[Permissions.ORG_UNITS_DELETE]
  const canManageMembers = !!policies[Permissions.ORG_UNITS_MANAGE_MEMBERS]

  return (
    <div className="space-y-1">
      {units.map((unit) => (
        <OUTreeNode
          key={unit.id}
          unit={unit}
          allUnits={units}
          level={0}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
          canManageMembers={canManageMembers}
          onAction={setDialog}
        />
      ))}

      {dialog?.type === 'add' && (
        <AddOrganizationUnit
          allUnits={units}
          defaultParentId={dialog.parentId}
          onDismiss={() => setDialog(null)}
        />
      )}
      {dialog?.type === 'edit' && (
        <EditOrganizationUnit unit={dialog.unit} onDismiss={() => setDialog(null)} />
      )}
      {dialog?.type === 'delete' && (
        <DeleteOrganizationUnit unit={dialog.unit} onDismiss={() => setDialog(null)} />
      )}
      {dialog?.type === 'members' && (
        <OUMemberList unit={dialog.unit} onDismiss={() => setDialog(null)} />
      )}
    </div>
  )
}

type NodeProps = {
  unit: OrganizationUnitDto
  allUnits: OrganizationUnitDto[]
  level: number
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  canManageMembers: boolean
  onAction: (d: DialogState) => void
}

function OUTreeNode({
  unit,
  allUnits,
  level,
  canCreate,
  canUpdate,
  canDelete,
  canManageMembers,
  onAction,
}: NodeProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = (unit.children?.length ?? 0) > 0

  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-muted/50 group"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {/* Expand toggle */}
        <button
          className="w-5 h-5 flex items-center justify-center text-muted-foreground shrink-0"
          onClick={() => setExpanded((e) => !e)}
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <span className="w-4" />
          )}
        </button>

        {/* Name + badges */}
        <span className="flex-1 text-sm font-medium">{unit.displayName}</span>
        <span className="text-xs text-muted-foreground font-mono hidden sm:inline">{unit.code}</span>
        <Badge variant="secondary" className="text-xs hidden sm:flex">
          <Users className="h-3 w-3 mr-1" />
          {unit.memberCount}
        </Badge>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canManageMembers && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              title="Quản lý thành viên"
              onClick={() => onAction({ type: 'members', unit })}
            >
              <Users className="h-3.5 w-3.5" />
            </Button>
          )}
          {canCreate && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              title="Thêm đơn vị con"
              onClick={() => onAction({ type: 'add', parentId: unit.id })}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          {canUpdate && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              title="Chỉnh sửa"
              onClick={() => onAction({ type: 'edit', unit })}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {canDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-destructive hover:text-destructive"
              title="Xoá"
              onClick={() => onAction({ type: 'delete', unit })}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div>
          {unit.children!.map((child) => (
            <OUTreeNode
              key={child.id}
              unit={child}
              allUnits={allUnits}
              level={level + 1}
              canCreate={canCreate}
              canUpdate={canUpdate}
              canDelete={canDelete}
              canManageMembers={canManageMembers}
              onAction={onAction}
            />
          ))}
        </div>
      )}
    </div>
  )
}
