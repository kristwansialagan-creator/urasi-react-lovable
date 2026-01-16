import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface Role {
    id: string
    name: string
    namespace: string
    description: string | null
    created_at: string | null
}

export interface Permission {
    id: string
    name: string
    namespace: string
    description: string | null
}

export function useRoles() {
    const [roles, setRoles] = useState<Role[]>([])
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({}) // roleId -> permissionIds
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchRoles = useCallback(async () => {
        setLoading(true)
        try {
            const { data: rolesData, error: rolesErr } = await (supabase
                .from('roles')
                .select('*')
                .order('name') as any)

            if (rolesErr) throw rolesErr
            setRoles(rolesData || [])

            const { data: permsData, error: permsErr } = await (supabase
                .from('permissions')
                .select('*')
                .order('namespace, name') as any)

            if (permsErr) throw permsErr
            setPermissions(permsData || [])

            // Fetch role_permissions map
            const { data: rpData, error: rpErr } = await (supabase
                .from('role_permissions')
                .select('role_id, permission_id') as any)

            if (rpErr) throw rpErr

            const map: Record<string, string[]> = {}
            rpData?.forEach((rp: any) => {
                if (!map[rp.role_id]) map[rp.role_id] = []
                map[rp.role_id].push(rp.permission_id)
            })
            setRolePermissions(map)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const createRole = useCallback(async (role: Partial<Role>) => {
        try {
            const { error } = await supabase
                .from('roles')
                .insert(role)
            if (error) throw error
            await fetchRoles()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchRoles])

    const updateRole = useCallback(async (id: string, updates: Partial<Role>) => {
        try {
            const { error } = await supabase
                .from('roles')
                .update(updates)
                .eq('id', id)
            if (error) throw error
            await fetchRoles()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchRoles])

    const deleteRole = useCallback(async (id: string) => {
        try {
            // First delete relations
            await supabase.from('role_permissions').delete().eq('role_id', id)
            await supabase.from('users_roles').delete().eq('role_id', id)

            const { error } = await supabase.from('roles').delete().eq('id', id)
            if (error) throw error
            await fetchRoles()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchRoles])

    const togglePermission = useCallback(async (roleId: string, permissionId: string, granted: boolean) => {
        try {
            if (granted) {
                await (supabase.from('role_permissions') as any).insert({ role_id: roleId, permission_id: permissionId })
            } else {
                await supabase.from('role_permissions').delete().eq('role_id', roleId).eq('permission_id', permissionId)
            }
            await fetchRoles() // Refresh map
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchRoles])

    return {
        roles,
        permissions,
        rolePermissions,
        loading,
        error,
        fetchRoles,
        createRole,
        updateRole,
        deleteRole,
        togglePermission
    }
}
