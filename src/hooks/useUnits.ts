import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Unit {
    id: string
    name: string
    identifier: string
    description: string | null
    value: number
    base_unit: boolean
    group_id: string | null
    group?: UnitGroup
    author: string
    created_at: string
}

interface UnitGroup {
    id: string
    name: string
    description: string | null
    author: string
    created_at: string
}

export function useUnits() {
    const [units, setUnits] = useState<Unit[]>([])
    const [groups, setGroups] = useState<UnitGroup[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchUnits = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error: err } = await supabase
                .from('units')
                .select('*, group:units_groups(*)')
                .order('name')

            if (err) throw err
            setUnits(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchGroups = useCallback(async () => {
        try {
            const { data, error: err } = await supabase
                .from('units_groups')
                .select('*')
                .order('name')

            if (err) throw err
            setGroups(data || [])
        } catch (err: any) {
            setError(err.message)
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
            return true
        } catch (err: any) {
            setError(err.message)
            return false
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
            return true
        } catch (err: any) {
            setError(err.message)
            return false
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
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchUnits])

    const createGroup = useCallback(async (data: Partial<UnitGroup>) => {
        try {
            const user = await supabase.auth.getUser()
            const { error: err } = await supabase
                .from('units_groups')
                .insert([{ ...data, author: user.data.user?.id }] as never)

            if (err) throw err
            await fetchGroups()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchGroups])

    const updateGroup = useCallback(async (id: string, data: Partial<UnitGroup>) => {
        try {
            const { error: err } = await supabase
                .from('units_groups')
                .update(data as never)
                .eq('id', id)

            if (err) throw err
            await fetchGroups()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchGroups])

    const deleteGroup = useCallback(async (id: string) => {
        try {
            const { error: err } = await supabase
                .from('units_groups')
                .delete()
                .eq('id', id)

            if (err) throw err
            await fetchGroups()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchGroups])

    const convert = useCallback((value: number, fromUnit: string, toUnit: string) => {
        const from = units.find(u => u.id === fromUnit)
        const to = units.find(u => u.id === toUnit)
        if (!from || !to) return value

        // Convert to base unit then to target
        const baseValue = value * from.value
        return baseValue / to.value
    }, [units])

    return {
        units,
        groups,
        loading,
        error,
        fetchUnits,
        fetchGroups,
        createUnit,
        updateUnit,
        deleteUnit,
        createGroup,
        updateGroup,
        deleteGroup,
        convert
    }
}
