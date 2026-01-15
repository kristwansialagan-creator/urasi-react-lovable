import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Permission {
    id: string
    namespace: string
    name: string
    description: string | null
    created_at: string
}

interface Role {
    id: string
    name: string
    namespace: string
    description: string | null
    locked: boolean
    created_at: string
}

interface UsePermissionsReturn {
    permissions: Permission[]
    roles: Role[]
    loading: boolean
    error: string | null
    fetchUserPermissions: (userId: string) => Promise<void>
    hasPermission: (permission: string) => boolean
    hasRole: (role: string) => boolean
    can: (action: string, resource: string) => boolean
}

export function usePermissions(): UsePermissionsReturn {
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchUserPermissions = useCallback(async (uid: string) => {
        setLoading(true)
        setError(null)
        try {
            // Fetch user roles
            const { data: userRoles, error: rolesError } = await supabase
                .from('users_roles')
                .select(`
                    role:roles(*)
                `)
                .eq('user_id', uid)

            if (rolesError) throw rolesError

            const userRoleData = (userRoles || []) as { role: Role }[]
            const roleList = userRoleData
                .map(ur => ur.role)
                .filter(Boolean) as Role[]

            setRoles(roleList)

            // Fetch permissions for those roles
            if (roleList.length > 0) {
                const roleIds = roleList.map(r => r.id)
                const { data: rolePerms, error: permsError } = await supabase
                    .from('role_permissions')
                    .select(`
                        permission:permissions(*)
                    `)
                    .in('role_id', roleIds)

                if (permsError) throw permsError

                const rolePermData = (rolePerms || []) as { permission: Permission }[]
                const permList = rolePermData
                    .map(rp => rp.permission)
                    .filter(Boolean) as Permission[]

                // Remove duplicates
                const uniquePerms = Array.from(
                    new Map(permList.map(p => [p.id, p])).values()
                )

                setPermissions(uniquePerms)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch permissions')
        } finally {
            setLoading(false)
        }
    }, [])

    const hasPermission = useCallback((permission: string): boolean => {
        return permissions.some(p => p.name === permission || `${p.namespace}.${p.name}` === permission)
    }, [permissions])

    const hasRole = useCallback((role: string): boolean => {
        return roles.some(r => r.name === role)
    }, [roles])

    const can = useCallback((action: string, resource: string): boolean => {
        const permissionName = `${resource}.${action}`
        return hasPermission(permissionName) || hasRole('admin')
    }, [hasPermission, hasRole])

    return {
        permissions,
        roles,
        loading,
        error,
        fetchUserPermissions,
        hasPermission,
        hasRole,
        can
    }
}
