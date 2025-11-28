'use client'

import { permissionsGet, permissionsUpdate, UpdatePermissionsDto, userGet } from '@/client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ArrowLeft, Save, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PermissionGroup } from './PermissionGroup'

interface PermissionManagementProps {
  entityType: 'role' | 'user'
  entityId: string
}

interface PermissionState {
  [key: string]: boolean
}

export default function PermissionManagement({ entityType, entityId }: PermissionManagementProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<string>('')
  const [modifiedPermissions, setModifiedPermissions] = useState<PermissionState>({})
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const providerName = entityType === 'user' ? 'U' : 'R'

  // Fetch user data to display name (if entityType is user)
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', entityId],
    queryFn: async () => {
      const response = await userGet({
        path: { id: entityId }, // Đặt id vào trong đối tượng 'path'
      })
      return response.data // Chỉ trả về đối tượng UserDto
    },
    enabled: entityType === 'user',
  })

  // Fetch permissions
  const {
    data: permissionData,
    isLoading: isPermissionsLoading,
    error,
  } = useQuery({
    queryKey: ['permissions', providerName, entityId],
    queryFn: async () => {
      const response = await permissionsGet({
        query: { providerName, providerKey: entityId },
      })
      return response.data
    },
    // Giữ dữ liệu cũ trong khi fetch dữ liệu mới để UI không bị giật
    placeholderData: (previousData) => previousData,
  })

  const handlePermissionChange = useCallback((permissionName: string, isGranted: boolean) => {
    setModifiedPermissions((prev) => ({
      ...prev,
      [permissionName]: isGranted,
    }))
  }, [])

  const mutation = useMutation({
    // Xác định kiểu dữ liệu cho mutation function để có gợi ý code tốt hơn
    mutationFn: (newPermissions: UpdatePermissionsDto) =>
      permissionsUpdate({ providerName, providerKey: entityId, body: newPermissions }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Permissions have been updated successfully.',
        variant: 'default',
      })
      // Reset trạng thái đã thay đổi sau khi lưu thành công
      setModifiedPermissions({})
      queryClient.invalidateQueries({ queryKey: ['permissions', providerName, entityId] }) // Làm mới lại dữ liệu quyền
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update permissions.',
        variant: 'destructive',
      })
    },
  })

  const handleSave = () => {
    const permissionsToUpdate = Object.entries(modifiedPermissions).map(([name, isGranted]) => ({
      name,
      isGranted,
    }))
    mutation.mutate({ permissions: permissionsToUpdate })
  }

  // Tính toán các quyền và nhóm một cách tối ưu
  const filteredGroups = useMemo(() => {
    if (!permissionData?.groups) {
      return []
    }

    // Nếu không có từ khóa tìm kiếm, chỉ cần lọc ra các nhóm có quyền
    if (!searchTerm) {
      return permissionData.groups.filter((g) => g.permissions && g.permissions.length > 0)
    }

    // Nếu có tìm kiếm, lọc các quyền bên trong mỗi nhóm
    if (searchTerm) {
      return permissionData.groups
        .map((group) => ({
          ...group,
          permissions: group.permissions?.filter((p) =>
            p.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
          ),
        }))
        .filter((group) => group.permissions && group.permissions.length > 0) // Chỉ giữ lại các group có quyền khớp với tìm kiếm
    }

    return permissionData.groups
  }, [permissionData, searchTerm])

  // Đảm bảo activeTab luôn hợp lệ, ngay cả khi kết quả tìm kiếm thay đổi
  useEffect(() => {
    const firstValidGroupName = filteredGroups[0]?.name
    // Nếu không có activeTab hoặc activeTab hiện tại không còn trong danh sách đã lọc
    if (firstValidGroupName && (!activeTab || !filteredGroups.some((g) => g.name === activeTab))) {
      setActiveTab(firstValidGroupName)
    }
  }, [filteredGroups, activeTab])

  const entityName = entityType === 'user' ? userData?.name || entityId : `Role: ${entityId}`

  if (isPermissionsLoading || isUserLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load permissions: {error.message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Manage Permissions</h1>
            <p className="text-muted-foreground">
              For {entityType}: <span className="font-semibold">{entityName}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setModifiedPermissions({})}
            disabled={Object.keys(modifiedPermissions).length === 0}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={Object.keys(modifiedPermissions).length === 0 || mutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Permissions</CardTitle>
            <div className="relative w-1/3">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              {filteredGroups?.map((group) => (
                <TabsTrigger key={group.name} value={group.name!}>
                  {group.displayName}
                </TabsTrigger>
              ))}
            </TabsList>
            {filteredGroups?.map((group) => (
              <TabsContent key={group.name} value={group.name!} className="mt-4" forceMount>
                <PermissionGroup
                  permissions={group.permissions ?? []}
                  modifiedPermissions={modifiedPermissions}
                  onPermissionChange={handlePermissionChange}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
