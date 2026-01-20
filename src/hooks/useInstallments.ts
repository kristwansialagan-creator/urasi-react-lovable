import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Order {
    id: string
    code: string
    customer?: {
        first_name: string | null
        last_name: string | null
    } | null
    total: number | null
    payment_status: string | null
    created_at: string | null
}

interface Installment {
    id: string
    order_id: string
    amount: number
    date: string
    paid: boolean
    author: string | null
    created_at: string
    updated_at: string
    order?: Order
}

interface CreateInstallmentInput {
    order_id: string
    amount: number
    date: string
}

interface UseInstallmentsReturn {
    installments: Installment[]
    loading: boolean
    error: string | null
    fetchInstallments: (filters?: InstallmentFilters) => Promise<void>
    createInstallment: (installment: CreateInstallmentInput) => Promise<Installment | null>
    updateInstallment: (id: string, updates: Partial<Installment>) => Promise<boolean>
    deleteInstallment: (id: string) => Promise<boolean>
    markAsPaid: (id: string) => Promise<boolean>
    getInstallmentsByOrder: (orderId: string) => Promise<Installment[]>
}

interface InstallmentFilters {
    paid?: boolean
    from_date?: string
    to_date?: string
    order_id?: string
    page?: number
    limit?: number
}

export function useInstallments(): UseInstallmentsReturn {
    const [installments, setInstallments] = useState<Installment[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchInstallments = useCallback(async (filters?: InstallmentFilters) => {
        setLoading(true)
        setError(null)
        try {
            const page = filters?.page || 1
            const limit = filters?.limit || 50
            const from = (page - 1) * limit
            const to = from + limit - 1

            let query = supabase
                .from('orders_instalments')
                .select(`
                    *,
                    order:orders(
                        id,
                        code,
                        total,
                        payment_status,
                        created_at,
                        customer:customers(
                            first_name,
                            last_name
                        )
                    )
                `)
                .order('date', { ascending: true })
                .range(from, to)

            if (filters?.paid !== undefined) query = query.eq('paid', filters.paid)
            if (filters?.order_id) query = query.eq('order_id', filters.order_id)
            if (filters?.from_date) query = query.gte('date', filters.from_date)
            if (filters?.to_date) query = query.lte('date', filters.to_date)

            const { data, error: fetchError } = await query

            if (fetchError) throw fetchError
            setInstallments((data as Installment[]) || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch installments')
        } finally {
            setLoading(false)
        }
    }, [])

    const createInstallment = useCallback(async (input: CreateInstallmentInput): Promise<Installment | null> => {
        try {
            const { data, error: insertError } = await supabase
                .from('orders_instalments')
                .insert({
                    order_id: input.order_id,
                    amount: input.amount,
                    date: input.date,
                    paid: false
                } as never)
                .select()
                .single()

            if (insertError) throw insertError

            const newInstallment = data as Installment
            await fetchInstallments()
            return newInstallment
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create installment')
            return null
        }
    }, [fetchInstallments])

    const updateInstallment = useCallback(async (id: string, updates: Partial<Installment>): Promise<boolean> => {
        try {
            const { error: updateError } = await supabase
                .from('orders_instalments')
                .update(updates as never)
                .eq('id', id)

            if (updateError) throw updateError

            await fetchInstallments()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update installment')
            return false
        }
    }, [fetchInstallments])

    const deleteInstallment = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from('orders_instalments')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError

            await fetchInstallments()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete installment')
            return false
        }
    }, [fetchInstallments])

    const markAsPaid = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            
            const { error: updateError } = await supabase
                .from('orders_instalments')
                .update({
                    paid: true,
                    author: user?.id
                } as never)
                .eq('id', id)

            if (updateError) throw updateError

            await fetchInstallments()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mark installment as paid')
            return false
        }
    }, [fetchInstallments])

    const getInstallmentsByOrder = useCallback(async (orderId: string): Promise<Installment[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('orders_instalments')
                .select(`
                    *,
                    order:orders(
                        id,
                        code,
                        total,
                        payment_status,
                        created_at,
                        customer:customers(
                            first_name,
                            last_name
                        )
                    )
                `)
                .eq('order_id', orderId)
                .order('date', { ascending: true })

            if (fetchError) throw fetchError
            return (data as Installment[]) || []
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch order installments')
            return []
        }
    }, [])

    useEffect(() => {
        fetchInstallments()
    }, [fetchInstallments])

    return {
        installments,
        loading,
        error,
        fetchInstallments,
        createInstallment,
        updateInstallment,
        deleteInstallment,
        markAsPaid,
        getInstallmentsByOrder
    }
}
