import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface UserProfile {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
    role: string // Simple role column
    created_at: string
    roles?: { id: string; name: string }[] // Joined roles
}

export function useUsers() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            // Fetch profiles
            const { data: profiles, error: err } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (err) throw err

            // Fetch roles for these users
            const { data: userRoles, error: rolesErr } = await supabase
                .from('users_roles')
                .select('user_id, role:roles(id, name)')

            if (rolesErr) throw rolesErr

            // Map roles to users
            const usersWithRoles = profiles.map((p: any) => {
                const myRoles = userRoles
                    .filter((ur: any) => ur.user_id === p.id)
                    .map((ur: any) => ur.role)
                return { ...p, roles: myRoles }
            })

            setUsers(usersWithRoles)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const updateUser = useCallback(async (id: string, updates: Partial<UserProfile>) => {
        try {
            const { error } = await (supabase
                .from('profiles') as any)
                .update(updates)
                .eq('id', id)

            if (error) throw error
            await fetchUsers()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchUsers])

    const assignRole = useCallback(async (userId: string, roleId: string) => {
        try {
            // Check if already exists
            const { data } = await supabase
                .from('users_roles')
                .select('*')
                .eq('user_id', userId)
                .eq('role_id', roleId)
                .single()

            if (data) return true // Already assigned

            const { error } = await supabase
                .from('users_roles')
                .insert({ user_id: userId, role_id: roleId } as any)

            if (error) throw error
            await fetchUsers()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchUsers])

    const removeRole = useCallback(async (userId: string, roleId: string) => {
        try {
            const { error } = await supabase
                .from('users_roles')
                .delete()
                .eq('user_id', userId)
                .eq('role_id', roleId)

            if (error) throw error
            await fetchUsers()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchUsers])

    return {
        users,
        loading,
        error,
        fetchUsers,
        updateUser,
        assignRole,
        removeRole
    }
}
