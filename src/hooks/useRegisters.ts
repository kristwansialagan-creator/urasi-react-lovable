import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { createSystemNotification, formatCurrency, NotificationTypes } from '@/services/notificationService'
import { useAuth } from '@/contexts/AuthContext'

interface Register {
    id: string
    name: string
    description: string | null
    status: string
    balance: number
    used_by: string | null
    author: string | null
    created_at: string
    updated_at: string
}

interface RegisterHistory {
    id: string
    register_id: string
    action: string
    transaction_type: string | null
    value: number
    balance_before: number
    balance_after: number
    description: string | null
    order_id: string | null
    created_at: string
}

interface UseRegistersReturn {
    registers: Register[]
    loading: boolean
    error: string | null
    fetchRegisters: () => Promise<void>
    getRegister: (id: string) => Promise<Register | null>
    getRegisterHistory: (id: string) => Promise<RegisterHistory[]>
    createRegister: (register: { name: string; description?: string }) => Promise<Register | null>
    updateRegister: (id: string, register: Partial<Register>) => Promise<Register | null>
    deleteRegister: (id: string) => Promise<boolean>
    openRegister: (id: string, openingBalance: number) => Promise<boolean>
    closeRegister: (id: string) => Promise<boolean>
    cashIn: (id: string, amount: number, description: string) => Promise<boolean>
    cashOut: (id: string, amount: number, description: string) => Promise<boolean>
    getActiveRegister: () => Register | null
}

export function useRegisters(): UseRegistersReturn {
    const [registers, setRegisters] = useState<Register[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    const fetchRegisters = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error: fetchError } = await supabase
                .from('registers')
                .select('*')
                .order('name')

            if (fetchError) throw fetchError
            setRegisters((data as Register[]) || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch registers')
        } finally {
            setLoading(false)
        }
    }, [])

    const getRegister = useCallback(async (id: string): Promise<Register | null> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('registers')
                .select('*')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError
            return data as Register
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch register')
            return null
        }
    }, [])

    const getRegisterHistory = useCallback(async (id: string): Promise<RegisterHistory[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('registers_history')
                .select('*')
                .eq('register_id', id)
                .order('created_at', { ascending: false })
                .limit(100)

            if (fetchError) throw fetchError
            return (data as RegisterHistory[]) || []
        } catch {
            return []
        }
    }, [])

    const createRegister = useCallback(async (register: { name: string; description?: string }): Promise<Register | null> => {
        try {
            const { data, error: createError } = await supabase
                .from('registers')
                .insert(register)
                .select()
                .single()

            if (createError) throw createError
            await fetchRegisters()
            return data as Register
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create register')
            return null
        }
    }, [fetchRegisters])

    const updateRegister = useCallback(async (id: string, register: Partial<Register>): Promise<Register | null> => {
        try {
            const { data, error: updateError } = await supabase
                .from('registers')
                .update(register)
                .eq('id', id)
                .select()
                .single()

            if (updateError) throw updateError
            await fetchRegisters()
            return data as Register
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update register')
            return null
        }
    }, [fetchRegisters])

    const deleteRegister = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from('registers')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError
            await fetchRegisters()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete register')
            return false
        }
    }, [fetchRegisters])

    const openRegister = useCallback(async (id: string, openingBalance: number): Promise<boolean> => {
        try {
            const register = await getRegister(id)
            if (!register) throw new Error('Register not found')
            if (register.status === 'opened') throw new Error('Register is already open')

            await supabase
                .from('registers')
                .update({ status: 'opened', balance: openingBalance } as never)
                .eq('id', id)

            await supabase.from('registers_history').insert({
                register_id: id,
                action: 'opening',
                transaction_type: 'positive',
                value: openingBalance,
                balance_before: 0,
                balance_after: openingBalance,
                description: 'Register opened'
            } as never)

            // Create notification for register opening
            if (user?.id) {
                createSystemNotification({
                    userId: user.id,
                    title: 'Register Opened',
                    description: `${register.name} opened with balance ${formatCurrency(openingBalance)}`,
                    type: NotificationTypes.REGISTER_OPENED,
                    url: '/registers',
                    source: 'register',
                    entityType: 'register',
                    entityId: id,
                    identifier: `register_open_${id}_${Date.now()}`
                }).catch(err => console.error('Failed to create register open notification:', err))
            }

            await fetchRegisters()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to open register')
            return false
        }
    }, [getRegister, fetchRegisters, user?.id])

    const closeRegister = useCallback(async (id: string): Promise<boolean> => {
        try {
            const register = await getRegister(id)
            if (!register) throw new Error('Register not found')
            if (register.status === 'closed') throw new Error('Register is already closed')

            const closingBalance = register.balance

            await supabase
                .from('registers')
                .update({ status: 'closed', balance: 0, used_by: null } as never)
                .eq('id', id)

            await supabase.from('registers_history').insert({
                register_id: id,
                action: 'closing',
                transaction_type: 'negative',
                value: closingBalance,
                balance_before: closingBalance,
                balance_after: 0,
                description: 'Register closed'
            } as never)

            // Create notification for register closing
            if (user?.id) {
                createSystemNotification({
                    userId: user.id,
                    title: 'Register Closed',
                    description: `${register.name} closed. Final balance: ${formatCurrency(closingBalance)}`,
                    type: NotificationTypes.REGISTER_CLOSED,
                    url: '/registers',
                    source: 'register',
                    entityType: 'register',
                    entityId: id,
                    identifier: `register_close_${id}_${Date.now()}`
                }).catch(err => console.error('Failed to create register close notification:', err))
            }

            await fetchRegisters()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to close register')
            return false
        }
    }, [getRegister, fetchRegisters, user?.id])

    const cashIn = useCallback(async (id: string, amount: number, description: string): Promise<boolean> => {
        try {
            const register = await getRegister(id)
            if (!register) throw new Error('Register not found')
            if (register.status !== 'opened') throw new Error('Register is not open')

            const newBalance = (register.balance || 0) + amount

            await supabase
                .from('registers')
                .update({ balance: newBalance } as never)
                .eq('id', id)

            await supabase.from('registers_history').insert({
                register_id: id,
                action: 'cash-in',
                transaction_type: 'positive',
                value: amount,
                balance_before: register.balance || 0,
                balance_after: newBalance,
                description
            } as never)

            await fetchRegisters()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to cash in')
            return false
        }
    }, [getRegister, fetchRegisters])

    const cashOut = useCallback(async (id: string, amount: number, description: string): Promise<boolean> => {
        try {
            const register = await getRegister(id)
            if (!register) throw new Error('Register not found')
            if (register.status !== 'opened') throw new Error('Register is not open')
            if ((register.balance || 0) < amount) throw new Error('Insufficient balance')

            const newBalance = (register.balance || 0) - amount

            await supabase
                .from('registers')
                .update({ balance: newBalance } as never)
                .eq('id', id)

            await supabase.from('registers_history').insert({
                register_id: id,
                action: 'cash-out',
                transaction_type: 'negative',
                value: amount,
                balance_before: register.balance || 0,
                balance_after: newBalance,
                description
            } as never)

            await fetchRegisters()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to cash out')
            return false
        }
    }, [getRegister, fetchRegisters])

    const getActiveRegister = useCallback((): Register | null => {
        return registers.find(r => r.status === 'opened') || null
    }, [registers])

    useEffect(() => {
        fetchRegisters()
    }, [fetchRegisters])

    return {
        registers,
        loading,
        error,
        fetchRegisters,
        getRegister,
        getRegisterHistory,
        createRegister,
        updateRegister,
        deleteRegister,
        openRegister,
        closeRegister,
        cashIn,
        cashOut,
        getActiveRegister
    }
}
