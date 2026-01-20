import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Customer {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone: string | null
    pobox: string | null
    gender: string | null
    birthdate: string | null
    group_id: string | null
    account_amount: number
    credit_limit_amount: number
    purchases_amount: number
    owed_amount: number
    reward_system_points: number
    description: string | null
    author: string | null
    created_at: string
    updated_at: string
}

interface CustomerGroup {
    id: string
    name: string
    description: string | null
    reward_system_id: string | null
    minimal_credit_payment: number
    author: string | null
    created_at: string
    updated_at: string
}

interface CustomerWithGroup extends Customer {
    group?: CustomerGroup | null
}

interface UseCustomersReturn {
    customers: CustomerWithGroup[]
    groups: CustomerGroup[]
    loading: boolean
    error: string | null
    fetchCustomers: (search?: string, groupId?: string) => Promise<void>
    fetchGroups: () => Promise<void>
    getCustomer: (id: string) => Promise<CustomerWithGroup | null>
    createCustomer: (customer: Partial<Customer>) => Promise<Customer | null>
    updateCustomer: (id: string, customer: Partial<Customer>) => Promise<Customer | null>
    deleteCustomer: (id: string) => Promise<boolean>
    createGroup: (group: Partial<CustomerGroup>) => Promise<CustomerGroup | null>
    updateGroup: (id: string, group: Partial<CustomerGroup>) => Promise<CustomerGroup | null>
    deleteGroup: (id: string) => Promise<boolean>
    addToAccount: (customerId: string, amount: number, description: string) => Promise<boolean>
    deductFromAccount: (customerId: string, amount: number, description: string) => Promise<boolean>
    getTopCustomers: (limit?: number) => Promise<CustomerWithGroup[]>
}

export function useCustomers(): UseCustomersReturn {
    const [customers, setCustomers] = useState<CustomerWithGroup[]>([])
    const [groups, setGroups] = useState<CustomerGroup[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchCustomers = useCallback(async (search?: string, groupId?: string) => {
        setLoading(true)
        setError(null)
        try {
            let query = supabase
                .from('customers')
                .select(`*, group:customers_groups(*)`)
                .order('created_at', { ascending: false })

            if (search) {
                query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
            }
            if (groupId) {
                query = query.eq('group_id', groupId)
            }

            const { data, error: fetchError } = await query

            if (fetchError) throw fetchError
            setCustomers((data as CustomerWithGroup[]) || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch customers')
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchGroups = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('customers_groups')
                .select('*')
                .order('name')

            if (fetchError) throw fetchError
            setGroups((data as CustomerGroup[]) || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch groups')
        }
    }, [])

    const getCustomer = useCallback(async (id: string): Promise<CustomerWithGroup | null> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('customers')
                .select(`*, group:customers_groups(*)`)
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError
            return data as CustomerWithGroup
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch customer')
            return null
        }
    }, [])

    const createCustomer = useCallback(async (customer: Partial<Customer>): Promise<Customer | null> => {
        try {
            const { data, error: createError } = await supabase
                .from('customers')
                .insert(customer)
                .select()
                .single()

            if (createError) throw createError
            await fetchCustomers()
            return data as Customer
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create customer')
            return null
        }
    }, [fetchCustomers])

    const updateCustomer = useCallback(async (id: string, customer: Partial<Customer>): Promise<Customer | null> => {
        try {
            const { data, error: updateError } = await supabase
                .from('customers')
                .update(customer)
                .eq('id', id)
                .select()
                .single()

            if (updateError) throw updateError
            await fetchCustomers()
            return data as Customer
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update customer')
            return null
        }
    }, [fetchCustomers])

    const deleteCustomer = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from('customers')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError
            await fetchCustomers()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete customer')
            return false
        }
    }, [fetchCustomers])

    const createGroup = useCallback(async (group: Partial<CustomerGroup>): Promise<CustomerGroup | null> => {
        try {
            const { data, error: createError } = await supabase
                .from('customers_groups')
                .insert([group as any]) // Cast to any to allow Partial<T>
                .select()
                .single()

            if (createError) throw createError
            await fetchGroups()
            return data as CustomerGroup
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create group')
            return null
        }
    }, [fetchGroups])

    const updateGroup = useCallback(async (id: string, group: Partial<CustomerGroup>): Promise<CustomerGroup | null> => {
        try {
            const { data, error: updateError } = await supabase
                .from('customers_groups')
                .update(group)
                .eq('id', id)
                .select()
                .single()

            if (updateError) throw updateError
            await fetchGroups()
            return data as CustomerGroup
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update group')
            return null
        }
    }, [fetchGroups])

    const deleteGroup = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from('customers_groups')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError
            await fetchGroups()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete group')
            return false
        }
    }, [fetchGroups])

    const addToAccount = useCallback(async (customerId: string, amount: number, description: string): Promise<boolean> => {
        try {
            const customer = await getCustomer(customerId)
            if (!customer) throw new Error('Customer not found')

            const previousAmount = customer.account_amount || 0
            const nextAmount = previousAmount + amount

            await supabase
                .from('customers')
                .update({ account_amount: nextAmount } as never)
                .eq('id', customerId)

            await supabase.from('customers_account_history').insert({
                customer_id: customerId,
                operation: 'add',
                previous_amount: previousAmount,
                amount,
                next_amount: nextAmount,
                description
            } as never)

            await fetchCustomers()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add to account')
            return false
        }
    }, [getCustomer, fetchCustomers])

    const deductFromAccount = useCallback(async (customerId: string, amount: number, description: string): Promise<boolean> => {
        try {
            const customer = await getCustomer(customerId)
            if (!customer) throw new Error('Customer not found')

            const previousAmount = customer.account_amount || 0
            const nextAmount = previousAmount - amount

            await supabase
                .from('customers')
                .update({ account_amount: nextAmount } as never)
                .eq('id', customerId)

            await supabase.from('customers_account_history').insert({
                customer_id: customerId,
                operation: 'deduct',
                previous_amount: previousAmount,
                amount,
                next_amount: nextAmount,
                description
            } as never)

            await fetchCustomers()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to deduct from account')
            return false
        }
    }, [getCustomer, fetchCustomers])

    const getTopCustomers = useCallback(async (limit = 10): Promise<CustomerWithGroup[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('customers')
                .select(`*, group:customers_groups(*)`)
                .order('purchases_amount', { ascending: false })
                .limit(limit)

            if (fetchError) throw fetchError
            return (data as CustomerWithGroup[]) || []
        } catch {
            return []
        }
    }, [])

    useEffect(() => {
        fetchCustomers()
        fetchGroups()
    }, [fetchCustomers, fetchGroups])

    return {
        customers,
        groups,
        loading,
        error,
        fetchCustomers,
        fetchGroups,
        getCustomer,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        createGroup,
        updateGroup,
        deleteGroup,
        addToAccount,
        deductFromAccount,
        getTopCustomers
    }
}
