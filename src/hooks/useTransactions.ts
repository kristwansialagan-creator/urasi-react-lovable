import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Transaction {
    id: string
    name: string
    type: 'income' | 'expense'
    status: 'active' | 'inactive'
    account_id: string | null
    account?: TransactionAccount
    value: number
    description: string | null
    recurring: boolean
    occurrence: string | null
    scheduled_date: string | null
    active: boolean
    author: string
    created_at: string
    updated_at: string
}

interface TransactionAccount {
    id: string
    name: string
    account: string
    operation: 'debit' | 'credit'
    description: string | null
    author: string
    created_at: string
    updated_at: string
}

interface TransactionHistory {
    id: string
    transaction_id: string
    transaction?: Transaction
    operation: 'debit' | 'credit'
    value: number
    name: string
    status: string
    author: string
    created_at: string
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
            const { data, error: err } = await supabase
                .from('transactions')
                .select('*, account:transactions_accounts(*)')
                .order('created_at', { ascending: false })

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
            const { data, error: err } = await supabase
                .from('transactions_accounts')
                .select('*')
                .order('name')

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
                .from('transactions_histories')
                .select('*, transaction:transactions(*)')
                .order('created_at', { ascending: false })

            if (startDate) query = query.gte('created_at', startDate)
            if (endDate) query = query.lte('created_at', endDate)

            const { data, error: err } = await query.limit(500)

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
            const transaction = transactions.find(t => t.id === transactionId)
            if (!transaction) throw new Error('Transaction not found')

            const { error: err } = await supabase
                .from('transactions_histories')
                .insert([{
                    transaction_id: transactionId,
                    operation: transaction.type === 'income' ? 'credit' : 'debit',
                    value: value || transaction.value,
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
    }, [transactions, fetchHistory])

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
            const { data, error: err } = await supabase
                .from('transactions_histories')
                .select('*')
                .gte('created_at', startDate)
                .lte('created_at', endDate)
                .order('created_at')

            if (err) throw err

            const txData = data || []
            const income = txData
                .filter((h: { operation: string }) => h.operation === 'credit')
                .reduce((sum: number, h: { value: number }) => sum + h.value, 0)

            const expense = txData
                .filter((h: { operation: string }) => h.operation === 'debit')
                .reduce((sum: number, h: { value: number }) => sum + h.value, 0)

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
