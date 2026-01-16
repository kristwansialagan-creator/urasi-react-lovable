import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Tax {
    id: string
    name: string
    rate: number | null
    type: string | null
    description: string | null
    author: string | null
    created_at: string | null
    updated_at: string | null
}

interface TaxGroup {
    id: string
    name: string
    description: string | null
    taxes?: Tax[] | null
    author: string | null
    created_at: string | null
}

export function useTaxes() {
    const [taxes, setTaxes] = useState<Tax[]>([])
    const [groups, setGroups] = useState<TaxGroup[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchTaxes = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error: err } = await (supabase
                .from('taxes')
                .select('*')
                .order('name') as any)

            if (err) throw err
            setTaxes(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchGroups = useCallback(async () => {
        try {
            const { data, error: err } = await (supabase
                .from('taxes_groups')
                .select('*')
                .order('name') as any)

            if (err) throw err
            setGroups(data || [])
        } catch (err: any) {
            setError(err.message)
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
            return true
        } catch (err: any) {
            setError(err.message)
            return false
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
            return true
        } catch (err: any) {
            setError(err.message)
            return false
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
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchTaxes])

    const createGroup = useCallback(async (data: Partial<TaxGroup>) => {
        try {
            const user = await supabase.auth.getUser()
            const { error: err } = await supabase
                .from('taxes_groups')
                .insert([{ ...data, author: user.data.user?.id }] as never)

            if (err) throw err
            await fetchGroups()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchGroups])

    const updateGroup = useCallback(async (id: string, data: Partial<TaxGroup>) => {
        try {
            const { error: err } = await supabase
                .from('taxes_groups')
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
                .from('taxes_groups')
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

    const calculateTax = useCallback((amount: number, taxId: string) => {
        const tax = taxes.find(t => t.id === taxId)
        if (!tax || tax.rate === null) return 0

        if (tax.type === 'percentage') {
            return amount * (tax.rate / 100)
        }
        return tax.rate
    }, [taxes])

    return {
        taxes,
        groups,
        loading,
        error,
        fetchTaxes,
        fetchGroups,
        createTax,
        updateTax,
        deleteTax,
        createGroup,
        updateGroup,
        deleteGroup,
        calculateTax
    }
}
