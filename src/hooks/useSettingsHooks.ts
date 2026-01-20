import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ==========================================
// Taxes Hook - FULL IMPLEMENTATION
// ==========================================
interface Tax {
    id: string
    name: string
    rate: number | null
    type: string | null
    description: string | null
    tax_group_id: string | null
    author: string | null
    created_at: string | null
    updated_at: string | null
}

interface TaxGroup {
    id: string
    name: string
    description: string | null
    created_at: string | null
    updated_at: string | null
}

export function useTaxes() {
    const [taxes, setTaxes] = useState<Tax[]>([])
    const [groups, setGroups] = useState<TaxGroup[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchTaxes = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data: taxData, error: taxErr } = await supabase
                .from('taxes')
                .select('*')
                .order('name')

            if (taxErr) throw taxErr
            setTaxes((taxData as Tax[]) || [])

            const { data: groupData, error: groupErr } = await supabase
                .from('taxes_groups')
                .select('*')
                .order('name')

            if (groupErr) throw groupErr
            setGroups((groupData as TaxGroup[]) || [])
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch taxes')
        } finally {
            setLoading(false)
        }
    }, [])

    const createTax = useCallback(async (data: Partial<Tax>) => {
        try {
            const user = await supabase.auth.getUser()
            const { error: err } = await supabase
                .from('taxes')
                .insert([{ ...data, author: user.data.user?.id }] as never)

            if (err) throw err
            await fetchTaxes()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create tax'
            setError(message)
            return { error: message }
        }
    }, [fetchTaxes])

    const updateTax = useCallback(async (id: string, data: Partial<Tax>) => {
        try {
            const { error: err } = await supabase
                .from('taxes')
                .update(data as never)
                .eq('id', id)

            if (err) throw err
            await fetchTaxes()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update tax'
            setError(message)
            return { error: message }
        }
    }, [fetchTaxes])

    const deleteTax = useCallback(async (id: string) => {
        try {
            const { error: err } = await supabase
                .from('taxes')
                .delete()
                .eq('id', id)

            if (err) throw err
            await fetchTaxes()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete tax'
            setError(message)
            return { error: message }
        }
    }, [fetchTaxes])

    const createGroup = useCallback(async (data: Partial<TaxGroup>) => {
        try {
            const { error: err } = await supabase
                .from('taxes_groups')
                .insert([data] as never)

            if (err) throw err
            await fetchTaxes()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create tax group'
            setError(message)
            return { error: message }
        }
    }, [fetchTaxes])

    const updateGroup = useCallback(async (id: string, data: Partial<TaxGroup>) => {
        try {
            const { error: err } = await supabase
                .from('taxes_groups')
                .update(data as never)
                .eq('id', id)

            if (err) throw err
            await fetchTaxes()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update tax group'
            setError(message)
            return { error: message }
        }
    }, [fetchTaxes])

    const deleteGroup = useCallback(async (id: string) => {
        try {
            const { error: err } = await supabase
                .from('taxes_groups')
                .delete()
                .eq('id', id)

            if (err) throw err
            await fetchTaxes()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete tax group'
            setError(message)
            return { error: message }
        }
    }, [fetchTaxes])

    useEffect(() => { fetchTaxes() }, [fetchTaxes])

    return {
        taxes, groups, loading, error, fetchTaxes,
        createTax, updateTax, deleteTax,
        createGroup, updateGroup, deleteGroup
    }
}

// ==========================================
// Units Hook - FULL IMPLEMENTATION
// ==========================================
interface Unit {
    id: string
    name: string
    identifier: string
    description: string | null
    value: number | null
    base_unit: boolean | null
    group_id: string | null
    author: string | null
    created_at: string | null
    updated_at: string | null
}

interface UnitGroup {
    id: string
    name: string
    description: string | null
    created_at: string | null
    updated_at: string | null
}

export function useUnits() {
    const [units, setUnits] = useState<Unit[]>([])
    const [groups, setGroups] = useState<UnitGroup[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchUnits = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data: unitData, error: unitErr } = await supabase
                .from('units')
                .select('*')
                .order('name')

            if (unitErr) throw unitErr
            setUnits((unitData as Unit[]) || [])

            const { data: groupData, error: groupErr } = await supabase
                .from('units_groups')
                .select('*')
                .order('name')

            if (!groupErr) {
                setGroups((groupData as UnitGroup[]) || [])
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch units')
        } finally {
            setLoading(false)
        }
    }, [])

    const createUnit = useCallback(async (data: Partial<Unit>) => {
        try {
            const user = await supabase.auth.getUser()
            const { error: err } = await supabase
                .from('units')
                .insert([{ ...data, author: user.data.user?.id }] as never)

            if (err) throw err
            await fetchUnits()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create unit'
            setError(message)
            return { error: message }
        }
    }, [fetchUnits])

    const updateUnit = useCallback(async (id: string, data: Partial<Unit>) => {
        try {
            const { error: err } = await supabase
                .from('units')
                .update(data as never)
                .eq('id', id)

            if (err) throw err
            await fetchUnits()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update unit'
            setError(message)
            return { error: message }
        }
    }, [fetchUnits])

    const deleteUnit = useCallback(async (id: string) => {
        try {
            const { error: err } = await supabase
                .from('units')
                .delete()
                .eq('id', id)

            if (err) throw err
            await fetchUnits()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete unit'
            setError(message)
            return { error: message }
        }
    }, [fetchUnits])

    const createGroup = useCallback(async (data: Partial<UnitGroup>) => {
        try {
            const { error: err } = await supabase
                .from('units_groups')
                .insert([data] as never)

            if (err) throw err
            await fetchUnits()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create unit group'
            setError(message)
            return { error: message }
        }
    }, [fetchUnits])

    const updateGroup = useCallback(async (id: string, data: Partial<UnitGroup>) => {
        try {
            const { error: err } = await supabase
                .from('units_groups')
                .update(data as never)
                .eq('id', id)

            if (err) throw err
            await fetchUnits()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update unit group'
            setError(message)
            return { error: message }
        }
    }, [fetchUnits])

    const deleteGroup = useCallback(async (id: string) => {
        try {
            const { error: err } = await supabase
                .from('units_groups')
                .delete()
                .eq('id', id)

            if (err) throw err
            await fetchUnits()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete unit group'
            setError(message)
            return { error: message }
        }
    }, [fetchUnits])

    useEffect(() => { fetchUnits() }, [fetchUnits])

    return {
        units, groups, loading, error, fetchUnits,
        createUnit, updateUnit, deleteUnit,
        createGroup, updateGroup, deleteGroup
    }
}

// ==========================================
// Users Hook - FULL IMPLEMENTATION
// ==========================================
interface User {
    id: string
    email: string | null
    username: string | null
    first_name: string | null
    second_name: string | null
    phone: string | null
    avatar_url: string | null
    role: string | null
    active: boolean | null
    total_sales: number | null
    total_sales_count: number | null
    created_at: string | null
    updated_at: string | null
    roles?: string[]
}

export function useUsers() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error: err } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (err) throw err

            // Map users with empty roles array (user_roles table may not exist)
            setUsers((data as User[])?.map(u => ({ ...u, roles: [] })) || [])
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch users')
        } finally {
            setLoading(false)
        }
    }, [])

    const createUser = useCallback(async (data: Partial<User>) => {
        try {
            // Note: Creating users requires Supabase Auth admin API
            // This just creates a profile entry
            const { error: err } = await supabase
                .from('profiles')
                .insert([data] as never)

            if (err) throw err
            await fetchUsers()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create user'
            setError(message)
            return { error: message }
        }
    }, [fetchUsers])

    const updateUser = useCallback(async (id: string, data: Partial<User>) => {
        try {
            const { error: err } = await supabase
                .from('profiles')
                .update(data as never)
                .eq('id', id)

            if (err) throw err
            await fetchUsers()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update user'
            setError(message)
            return { error: message }
        }
    }, [fetchUsers])

    const deleteUser = useCallback(async (id: string) => {
        try {
            // Soft delete by setting active to false
            const { error: err } = await supabase
                .from('profiles')
                .update({ active: false } as never)
                .eq('id', id)

            if (err) throw err
            await fetchUsers()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete user'
            setError(message)
            return { error: message }
        }
    }, [fetchUsers])

    const assignRole = useCallback(async (userId: string, roleId: string) => {
        try {
            // Update the user's role in the profiles table
            const { error: err } = await supabase
                .from('profiles')
                .update({ role: roleId } as never)
                .eq('id', userId)

            if (err) throw err
            await fetchUsers()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to assign role'
            setError(message)
            return { error: message }
        }
    }, [fetchUsers])

    const removeRole = useCallback(async (userId: string, _roleId: string) => {
        try {
            // Remove role by setting to default 'user'
            const { error: err } = await supabase
                .from('profiles')
                .update({ role: 'user' } as never)
                .eq('id', userId)

            if (err) throw err
            await fetchUsers()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to remove role'
            setError(message)
            return { error: message }
        }
    }, [fetchUsers])

    useEffect(() => { fetchUsers() }, [fetchUsers])

    return {
        users, loading, error, fetchUsers,
        createUser, updateUser, deleteUser,
        assignRole, removeRole
    }
}

// ==========================================
// Roles Hook - FULL IMPLEMENTATION
// ==========================================
interface Role {
    id: string
    name: string
    namespace: string
    description: string | null
    locked: boolean | null
    created_at: string | null
    updated_at: string | null
}

interface Permission {
    id: string
    name: string
    namespace: string
    description: string | null
    created_at: string | null
    updated_at: string | null
}

export function useRoles() {
    const [roles, setRoles] = useState<Role[]>([])
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchRoles = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data: roleData, error: roleErr } = await supabase
                .from('roles')
                .select('*')
                .order('name')

            if (roleErr) throw roleErr
            setRoles((roleData as Role[]) || [])

            // Fetch permissions
            const { data: permData, error: permErr } = await supabase
                .from('permissions')
                .select('*')
                .order('namespace, name')

            if (permErr) throw permErr
            setPermissions((permData as Permission[]) || [])

            // Fetch role-permission mappings
            const { data: rpData } = await supabase
                .from('role_permissions')
                .select('role_id, permission_id')

            const mappings: Record<string, string[]> = {}
            if (rpData) {
                (rpData as { role_id: string | null; permission_id: string | null }[]).forEach((rp) => {
                    if (rp.role_id && rp.permission_id) {
                        if (!mappings[rp.role_id]) mappings[rp.role_id] = []
                        mappings[rp.role_id].push(rp.permission_id)
                    }
                })
            }
            setRolePermissions(mappings)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch roles')
        } finally {
            setLoading(false)
        }
    }, [])

    const createRole = useCallback(async (data: Partial<Role>) => {
        try {
            const { error: err } = await supabase
                .from('roles')
                .insert([data] as never)

            if (err) throw err
            await fetchRoles()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create role'
            setError(message)
            return { error: message }
        }
    }, [fetchRoles])

    const updateRole = useCallback(async (id: string, data: Partial<Role>) => {
        try {
            const { error: err } = await supabase
                .from('roles')
                .update(data as never)
                .eq('id', id)

            if (err) throw err
            await fetchRoles()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update role'
            setError(message)
            return { error: message }
        }
    }, [fetchRoles])

    const deleteRole = useCallback(async (id: string) => {
        try {
            // First delete role permissions
            await supabase
                .from('role_permissions')
                .delete()
                .eq('role_id', id)

            const { error: err } = await supabase
                .from('roles')
                .delete()
                .eq('id', id)

            if (err) throw err
            await fetchRoles()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete role'
            setError(message)
            return { error: message }
        }
    }, [fetchRoles])

    const togglePermission = useCallback(async (roleId: string, permissionId: string, grant: boolean) => {
        try {
            if (grant) {
                const { error: err } = await supabase
                    .from('role_permissions')
                    .insert([{ role_id: roleId, permission_id: permissionId }] as never)

                if (err) throw err
            } else {
                const { error: err } = await supabase
                    .from('role_permissions')
                    .delete()
                    .eq('role_id', roleId)
                    .eq('permission_id', permissionId)

                if (err) throw err
            }
            await fetchRoles()
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to toggle permission'
            setError(message)
            return { error: message }
        }
    }, [fetchRoles])

    useEffect(() => { fetchRoles() }, [fetchRoles])

    return {
        roles, permissions, rolePermissions, loading, error, fetchRoles,
        createRole, updateRole, deleteRole, togglePermission
    }
}

// ==========================================
// Settings Hook - FULL IMPLEMENTATION
// ==========================================
interface Setting {
    id: string
    key: string
    value: Record<string, unknown> | null
    category: string | null
    description: string | null
    created_at: string | null
    updated_at: string | null
}

export function useSettings() {
    const [settings, setSettings] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchSettings = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error: err } = await supabase
                .from('settings')
                .select('*')

            if (err) throw err

            // Convert array to key-value object
            const settingsObj: Record<string, any> = {}
            ;(data as Setting[] || []).forEach(s => {
                settingsObj[s.key] = s.value
            })
            setSettings(settingsObj)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch settings')
        } finally {
            setLoading(false)
        }
    }, [])

    const updateSettings = useCallback(async (data: Record<string, any>) => {
        try {
            for (const [key, value] of Object.entries(data)) {
                const { data: existing } = await supabase
                    .from('settings')
                    .select('id')
                    .eq('key', key)
                    .single()

                if (existing) {
                    await supabase
                        .from('settings')
                        .update({ value } as never)
                        .eq('key', key)
                } else {
                    await supabase
                        .from('settings')
                        .insert([{ key, value }] as never)
                }
            }
            await fetchSettings()
            return true
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update settings')
            return false
        }
    }, [fetchSettings])

    const bulkUpdate = useCallback(async (data: Record<string, any>, section: string) => {
        try {
            // Update settings with category/section
            for (const [key, value] of Object.entries(data)) {
                const fullKey = `${section}.${key}`
                const { data: existing } = await supabase
                    .from('settings')
                    .select('id')
                    .eq('key', fullKey)
                    .single()

                if (existing) {
                    await supabase
                        .from('settings')
                        .update({ value, category: section } as never)
                        .eq('key', fullKey)
                } else {
                    await supabase
                        .from('settings')
                        .insert([{ key: fullKey, value, category: section }] as never)
                }
            }
            await fetchSettings()
            return true
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to bulk update settings')
            return false
        }
    }, [fetchSettings])

    useEffect(() => { fetchSettings() }, [fetchSettings])

    return { settings, loading, error, fetchSettings, updateSettings, bulkUpdate }
}
