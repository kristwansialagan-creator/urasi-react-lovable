import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Transaction {
    id: string
    name: string
    type: string | null
    status: string | null
    account_id: string | null
    account?: TransactionAccount | null
    value: number | null
    description: string | null
    recurring?: boolean | null
    occurrence: string | null
    scheduled_date: string | null
    active: boolean | null
    author: string | null
    created_at: string | null
    updated_at: string | null
}

interface TransactionAccount {
    id: string
    name: string
    account: string
    operation: string | null
    description: string | null
    author: string | null
    created_at: string | null
    updated_at: string | null
}

interface TransactionHistory {
    id: string
    transaction_id: string | null
    transaction?: Transaction | null
    operation: string | null
    value: number | null
    name: string | null
    status: string | null
    author: string | null
    created_at: string | null
}

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [accounts, setAccounts] = useState<TransactionAccount[]>([])
    const [history, setHistory] = useState<TransactionHistory[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchTransactions = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error: err } = await (supabase
                .from('transactions')
                .select('*, account:transactions_accounts(*)')
                .order('created_at', { ascending: false }) as any)

            if (err) throw err
            setTransactions(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchAccounts = useCallback(async () => {
        try {
            const { data, error: err } = await (supabase
                .from('transactions_accounts')
                .select('*')
                .order('name') as any)

            if (err) throw err
            setAccounts(data || [])
        } catch (err: any) {
            setError(err.message)
        }
    }, [])

    const fetchHistory = useCallback(async (startDate?: string, endDate?: string) => {
        setLoading(true)
        try {
            let query = supabase
                .from('transactions_history')
                .select('*, transaction:transactions(*)')
                .order('created_at', { ascending: false })

            if (startDate) query = query.gte('created_at', startDate)
            if (endDate) query = query.lte('created_at', endDate)

            const { data, error: err } = await (query.limit(500) as any)

            if (err) throw err
            setHistory(data || [])
            return data || []
        } catch (err: any) {
            setError(err.message)
            return []
        } finally {
            setLoading(false)
        }
    }, [])

    const createTransaction = useCallback(async (data: Partial<Transaction>) => {
        try {
            const { error: err } = await supabase
                .from('transactions')
                .insert([{ ...data, author: (await supabase.auth.getUser()).data.user?.id }] as never)

            if (err) throw err
            await fetchTransactions()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchTransactions])

    const updateTransaction = useCallback(async (id: string, data: Partial<Transaction>) => {
        try {
            const { error: err } = await supabase
                .from('transactions')
                .update(data as never)
                .eq('id', id)

            if (err) throw err
            await fetchTransactions()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchTransactions])

    const deleteTransaction = useCallback(async (id: string) => {
        try {
            const { error: err } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id)

            if (err) throw err
            await fetchTransactions()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchTransactions])

    const executeTransaction = useCallback(async (transactionId: string, value?: number) => {
        try {
            // Fetch transaction directly from DB to avoid stale state issues
            const { data: transaction, error: fetchErr } = await supabase
                .from('transactions')
                .select('*')
                .eq('id', transactionId)
                .single()

            if (fetchErr || !transaction) throw new Error('Transaction not found')

            const { error: err } = await supabase
                .from('transactions_history')
                .insert([{
                    transaction_id: transactionId,
                    operation: transaction.type === 'income' ? 'credit' : 'debit',
                    value: value || transaction.value || 0,
                    name: transaction.name,
                    status: 'completed',
                    author: (await supabase.auth.getUser()).data.user?.id
                }] as never)

            if (err) throw err
            await fetchHistory()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchHistory])

    const createAccount = useCallback(async (data: Partial<TransactionAccount>) => {
        try {
            const { error: err } = await supabase
                .from('transactions_accounts')
                .insert([{ ...data, author: (await supabase.auth.getUser()).data.user?.id }] as never)

            if (err) throw err
            await fetchAccounts()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchAccounts])

    const updateAccount = useCallback(async (id: string, data: Partial<TransactionAccount>) => {
        try {
            const { error: err } = await supabase
                .from('transactions_accounts')
                .update(data as never)
                .eq('id', id)

            if (err) throw err
            await fetchAccounts()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchAccounts])

    const deleteAccount = useCallback(async (id: string) => {
        try {
            const { error: err } = await supabase
                .from('transactions_accounts')
                .delete()
                .eq('id', id)

            if (err) throw err
            await fetchAccounts()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchAccounts])

    const getCashFlow = useCallback(async (startDate: string, endDate: string) => {
        try {
            const { data, error: err } = await (supabase
                .from('transactions_history')
                .select('*')
                .gte('created_at', startDate)
                .lte('created_at', endDate)
                .order('created_at') as any)

            if (err) throw err

            const txData = data || []
            const income = txData
                .filter((h: any) => h.operation === 'credit')
                .reduce((sum: number, h: any) => sum + (h.value || 0), 0)

            const expense = txData
                .filter((h: any) => h.operation === 'debit')
                .reduce((sum: number, h: any) => sum + (h.value || 0), 0)

            return { income, expense, net: income - expense, transactions: txData }
        } catch (err: any) {
            setError(err.message)
            return { income: 0, expense: 0, net: 0, transactions: [] }
        }
    }, [])

    useEffect(() => {
        fetchTransactions()
        fetchAccounts()
        fetchHistory()
    }, [fetchTransactions, fetchAccounts, fetchHistory])

    return {
        transactions,
        accounts,
        history,
        loading,
        error,
        fetchTransactions,
        fetchAccounts,
        fetchHistory,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        executeTransaction,
        createAccount,
        updateAccount,
        deleteAccount,
        getCashFlow
    }
}
