import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ==========================================
// Taxes Hook
// ==========================================
export function useTaxes() {
    const [taxes, setTaxes] = useState<any[]>([])
    const [groups, setGroups] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const fetchTaxes = useCallback(async () => {
        setLoading(true)
        setTaxes([
            { id: '1', name: 'VAT', rate: 11, code: 'VAT', tax_type: 'percentage' },
            { id: '2', name: 'Service Tax', rate: 5, code: 'SVC', tax_type: 'percentage' }
        ])
        setGroups([]) // Placeholder
        setLoading(false)
    }, [])
    useEffect(() => { fetchTaxes() }, [fetchTaxes])
    return {
        taxes, groups, loading, fetchTaxes,
        createTax: async (d: any) => { return { error: null } },
        updateTax: async (id: any, d: any) => { return { error: null } },
        deleteTax: async (id: any) => { return { error: null } },
        createGroup: async (d: any) => { return { error: null } },
        updateGroup: async (id: any, d: any) => { return { error: null } },
        deleteGroup: async (id: any) => { return { error: null } }
    }
}

// ==========================================
// Units Hook
// ==========================================
export function useUnits() {
    const [units, setUnits] = useState<any[]>([])
    const [groups, setGroups] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const fetchUnits = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase.from('units').select('*').order('name')
        setUnits(data || [])
        setGroups([]) // Placeholder
        setLoading(false)
    }, [])
    useEffect(() => { fetchUnits() }, [fetchUnits])
    return {
        units, groups, loading, fetchUnits,
        createUnit: async (d: any) => { return { error: null } },
        updateUnit: async (id: any, d: any) => { return { error: null } },
        deleteUnit: async (id: any) => { return { error: null } },
        createGroup: async (d: any) => { return { error: null } },
        updateGroup: async (id: any, d: any) => { return { error: null } },
        deleteGroup: async (id: any) => { return { error: null } }
    }
}

// ==========================================
// Users Hook
// ==========================================
export function useUsers() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase.from('profiles').select('*')
        // Mocking roles property for users as it might vary
        const usersWithRoles = data?.map(u => ({ ...u, roles: [] })) || []
        setUsers(usersWithRoles)
        setLoading(false)
    }, [])

    const assignRole = async (userId: string, roleId: string) => {
        // Placeholder implementation
        console.log('Assigning role', roleId, 'to user', userId)
        return { error: null }
    }

    const removeRole = async (userId: string, roleId: string) => {
        // Placeholder implementation
        console.log('Removing role', roleId, 'from user', userId)
        return { error: null }
    }

    useEffect(() => { fetchUsers() }, [fetchUsers])
    return {
        users, loading, fetchUsers,
        createUser: async (d: any) => { },
        updateUser: async (id: any, d: any) => { },
        deleteUser: async (id: any) => { },
        assignRole,
        removeRole
    }
}

// ==========================================
// Roles Hook
// ==========================================
export function useRoles() {
    const [roles, setRoles] = useState<any[]>([])
    const [permissions, setPermissions] = useState<any[]>([])
    const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({})
    const [loading, setLoading] = useState(false)

    const fetchRoles = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase.from('roles').select('*')

        // Mock permissions if not in DB
        const mockPermissions = [
            { id: 'perm_1', name: 'View Dashboard', namespace: 'dashboard', description: 'Can view dashboard' },
            { id: 'perm_2', name: 'Manage Products', namespace: 'products', description: 'Can create/edit products' },
            { id: 'perm_3', name: 'Manage Orders', namespace: 'orders', description: 'Can manage orders' },
            { id: 'perm_4', name: 'Manage Users', namespace: 'users', description: 'Can manage users' },
        ]

        setRoles(data || [])
        setPermissions(mockPermissions)
        // Mock role permissions
        setRolePermissions({})

        setLoading(false)
    }, [])

    const togglePermission = async (roleId: string, permissionId: string, grant: boolean) => {
        setRolePermissions(prev => {
            const current = prev[roleId] || []
            if (grant) {
                return { ...prev, [roleId]: [...current, permissionId] }
            } else {
                return { ...prev, [roleId]: current.filter(id => id !== permissionId) }
            }
        })
        return { error: null }
    }

    useEffect(() => { fetchRoles() }, [fetchRoles])
    return {
        roles, permissions, rolePermissions, loading, fetchRoles,
        createRole: async (d: any) => { },
        updateRole: async (id: any, d: any) => { },
        deleteRole: async (id: any) => { },
        togglePermission
    }
}

// ==========================================
// Rewards Hook
// ==========================================
export function useRewards() {
    const [rewards, _setRewards] = useState<any[]>([])
    const [transactions, _setTransactions] = useState<any[]>([])
    const [loading, _setLoading] = useState(false)
    return {
        rewards, transactions, loading,
        fetchRewards: async () => { },
        createReward: async (_d: any) => { return { error: null } },
        updateReward: async (_id: any, _d: any) => { return { error: null } },
        deleteReward: async (_id: any) => { return { error: null } }
    }
}

// ==========================================
// Settings Hook (General)
// ==========================================
export function useSettings() {
    const [settings, _setSettings] = useState<any>({})
    const [loading, _setLoading] = useState(false)
    return { settings, loading, fetchSettings: async () => { }, updateSettings: async (_d: any) => true, bulkUpdate: async (_d: any, _section: string) => true }
}

// ==========================================
// Media Hook
// ==========================================
export function useMedia() {
    const [media, _setMedia] = useState<any[]>([])
    const [loading, _setLoading] = useState(false)
    const uploadFile = async (file: any) => ({ url: URL.createObjectURL(file) })
    return {
        media, loading,
        fetchMedia: async () => { },
        uploadMedia: uploadFile,
        uploadFile, // Alias for legacy support
        deleteMedia: async (_id: any) => { }
    }
}

// ==========================================
// Procurement Hook
// ==========================================
export function useProcurement() {
    const [procurements, _setProcurements] = useState<any[]>([])
    const [providers, _setProviders] = useState<any[]>([])
    const [loading, _setLoading] = useState(false)
    return {
        procurements, providers, loading,
        createProcurement: async (_d: any) => { return { error: null } },
        receiveProcurement: async (_id: any) => { return { error: null } },
        createProvider: async (_d: any) => { return { error: null } }
    }
}

// ==========================================
// Notifications Hook
// ==========================================
export function useNotifications() {
    const [notifications, _setNotifications] = useState<any[]>([])
    const [loading, _setLoading] = useState(false)
    const unreadCount = notifications.filter((n: any) => !n.read).length
    return {
        notifications, loading, unreadCount,
        fetchNotifications: async () => { },
        markAsRead: async (_id: any) => { },
        markAllAsRead: async () => { },
        deleteNotification: async (_id: any) => { },
        clearAll: async () => { }
    }
}
