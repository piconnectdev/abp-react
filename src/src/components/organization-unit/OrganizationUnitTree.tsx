'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrganizationUnitDto } from '@/lib/api/admin/organization-unit-api'
import { useAppConfig } from '@/lib/hooks/useAppConfig'
import { Permissions } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import { ChevronDown, ChevronRight, Cog, MoveVertical, Pencil, Plus, ShieldCheck, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { AddOrganizationUnit } from './AddOrganizationUnit'
import { DeleteOrganizationUnit } from './DeleteOrganizationUnit'
import { EditOrganizationUnit } from './EditOrganizationUnit'
import { MoveOrganizationUnit } from './MoveOrganizationUnit'
import { OUMemberList } from './OUMemberList'
import { OURoleList } from './OURoleList'

type DialogState =
  | { type: 'add'; parentId: string | null }
  | { type: 'edit'; unit: OrganizationUnitDto }
  | { type: 'delete'; unit: OrganizationUnitDto }
  | { type: 'members'; unit: OrganizationUnitDto }
  | { type: 'roles'; unit: OrganizationUnitDto }
  | { type: 'move'; unit: OrganizationUnitDto }
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
  const canManageRoles = !!policies[Permissions.ORG_UNITS_MANAGE_ROLES]

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
          canManageRoles={canManageRoles}
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
      {dialog?.type === 'roles' && (
        <OURoleList unit={dialog.unit} onDismiss={() => setDialog(null)} />
      )}
      {dialog?.type === 'move' && (
        <MoveOrganizationUnit
          unit={dialog.unit}
          allUnits={units}
          onDismiss={() => setDialog(null)}
        />
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
  canManageRoles: boolean
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
  canManageRoles,
  onAction,
}: NodeProps) {
  const [expanded, setExpanded] = useState(true)
  const { t } = useLanguage()
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
        {unit.code && (
          <span className="text-xs text-muted-foreground font-mono hidden md:inline">{unit.code}</span>
        )}
        {hasChildren && (
          <Badge variant="outline" className="text-xs hidden sm:flex" title={t('ou.children')}>
            {unit.children!.length}
          </Badge>
        )}
        <Badge
          variant="secondary"
          className="text-xs hidden sm:flex"
          title={`${unit.memberCount} ${t('ou.members')}`}
        >
          <Users className="h-3 w-3 mr-1" />
          {unit.memberCount}
        </Badge>
        {unit.roleCount > 0 && (
          <Badge
            variant="secondary"
            className="text-xs hidden sm:flex"
            title={(unit.roles ?? []).join(', ') || `${unit.roleCount} ${t('ou.roles')}`}
          >
            <ShieldCheck className="h-3 w-3 mr-1" />
            {unit.roleCount}
          </Badge>
        )}

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
            >
              <Cog className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">{t('common.actions')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canCreate && (
              <DropdownMenuItem onClick={() => onAction({ type: 'add', parentId: unit.id })}>
                <Plus className="h-4 w-4 mr-2" />
                {t('ou.addChild')}
              </DropdownMenuItem>
            )}
            {canUpdate && (
              <DropdownMenuItem onClick={() => onAction({ type: 'edit', unit })}>
                <Pencil className="h-4 w-4 mr-2" />
                {t('ou.edit')}
              </DropdownMenuItem>
            )}
            {canUpdate && (
              <DropdownMenuItem onClick={() => onAction({ type: 'move', unit })}>
                <MoveVertical className="h-4 w-4 mr-2" />
                {t('ou.move')}
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onAction({ type: 'delete', unit })}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('ou.delete')}
              </DropdownMenuItem>
            )}
            {(canCreate || canUpdate || canDelete) && (
              <DropdownMenuSeparator />
            )}
            <DropdownMenuItem onClick={() => onAction({ type: 'members', unit })}>
              <Users className="h-4 w-4 mr-2" />
              {t('ou.members')}
            </DropdownMenuItem>
            {canManageRoles && <DropdownMenuSeparator />}
            {canManageRoles && (
              <DropdownMenuItem onClick={() => onAction({ type: 'roles', unit })}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                {t('ou.roles')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
              canManageRoles={canManageRoles}
              onAction={onAction}
            />
          ))}
        </div>
      )}
    </div>
  )
}
