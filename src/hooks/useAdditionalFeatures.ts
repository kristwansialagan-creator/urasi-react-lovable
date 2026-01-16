import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Json } from '@/integrations/supabase/types'

// ==========================================
// Providers Hook
// ==========================================
export interface Provider {
    id: string
    name: string
    email: string | null
    phone: string | null
    address?: string | null
    created_at: string | null
    updated_at: string | null
}

export function useProviders() {
    const [providers, setProviders] = useState<Provider[]>([])
    const [loading, setLoading] = useState(false)

    const fetchProviders = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase.from('providers').select('*').order('name')
        setProviders(data || [])
        setLoading(false)
    }, [])

    const createProvider = async (provider: { name: string; email?: string | null; phone?: string | null }) => {
        const { data, error } = await supabase.from('providers').insert(provider).select().single()
        if (!error) fetchProviders()
        return { data, error }
    }

    const updateProvider = async (id: string, provider: { name?: string; email?: string | null; phone?: string | null }) => {
        const { data, error } = await supabase.from('providers').update(provider).eq('id', id).select().single()
        if (!error) fetchProviders()
        return { data, error }
    }

    const deleteProvider = async (id: string) => {
        const { error } = await supabase.from('providers').delete().eq('id', id)
        if (!error) fetchProviders()
        return { error }
    }

    useEffect(() => {
        fetchProviders()
    }, [fetchProviders])

    return { providers, loading, fetchProviders, createProvider, updateProvider, deleteProvider }
}

// ==========================================
// Transaction Accounts Hook
// ==========================================
export interface TransactionAccount {
    id: string
    name: string
    code: string | null
    type: string | null
    balance: number | null
    description: string | null
    created_at: string | null
    updated_at: string | null
}

export function useTransactionAccounts() {
    const [accounts, setAccounts] = useState<TransactionAccount[]>([])
    const [loading, setLoading] = useState(false)

    const fetchAccounts = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase.from('transaction_accounts').select('*').order('name')
        setAccounts(data || [])
        setLoading(false)
    }, [])

    const createAccount = async (account: { name: string; code?: string; type?: string; balance?: number; description?: string }) => {
        const { data, error } = await supabase.from('transaction_accounts').insert(account).select().single()
        if (!error) fetchAccounts()
        return { data, error }
    }

    const updateAccount = async (id: string, account: { name?: string; code?: string; type?: string; balance?: number; description?: string }) => {
        const { data, error } = await supabase.from('transaction_accounts').update(account).eq('id', id).select().single()
        if (!error) fetchAccounts()
        return { data, error }
    }

    const deleteAccount = async (id: string) => {
        const { error } = await supabase.from('transaction_accounts').delete().eq('id', id)
        if (!error) fetchAccounts()
        return { error }
    }

    useEffect(() => {
        fetchAccounts()
    }, [fetchAccounts])

    return { accounts, loading, fetchAccounts, createAccount, updateAccount, deleteAccount }
}

// ==========================================
// Modules Hook
// ==========================================
export interface Module {
    id: string
    name: string
    label: string
    description: string | null
    status: string | null
    settings: Json | null
    created_at: string | null
    updated_at: string | null
}

export function useModules() {
    const [modules, setModules] = useState<Module[]>([])
    const [loading, setLoading] = useState(false)

    const fetchModules = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase.from('modules').select('*').order('label')
        setModules(data || [])
        setLoading(false)
    }, [])

    const toggleModule = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled'
        const { data, error } = await supabase.from('modules').update({ status: newStatus }).eq('id', id).select().single()
        if (!error) fetchModules()
        return { data, error }
    }

    const updateModuleSettings = async (id: string, settings: Json) => {
        const { data, error } = await supabase.from('modules').update({ settings }).eq('id', id).select().single()
        if (!error) fetchModules()
        return { data, error }
    }

    useEffect(() => {
        fetchModules()
    }, [fetchModules])

    return { modules, loading, fetchModules, toggleModule, updateModuleSettings }
}
