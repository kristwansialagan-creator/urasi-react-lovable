import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface JournalLine {
    id?: string
    journal_entry_id?: string
    account_id: string
    account_name?: string
    account_code?: string
    debit: number
    credit: number
    description?: string
    created_at?: string
}

export interface JournalEntry {
    id: string
    date: string
    reference?: string
    description?: string
    created_by?: string
    lines: JournalLine[]
    total_debit: number
    total_credit: number
    created_at: string
    updated_at: string
}

interface UseJournalEntriesReturn {
    entries: JournalEntry[]
    loading: boolean
    error: string | null
    fetchEntries: (dateFrom?: string, dateTo?: string) => Promise<void>
    getEntry: (id: string) => Promise<JournalEntry | null>
    createEntry: (entry: Omit<JournalEntry, 'id' | 'total_debit' | 'total_credit' | 'created_at' | 'updated_at'>) => Promise<JournalEntry | null>
    updateEntry: (id: string, entry: Partial<JournalEntry>) => Promise<JournalEntry | null>
    deleteEntry: (id: string) => Promise<boolean>
    validateBalance: (lines: JournalLine[]) => { valid: boolean; totalDebit: number; totalCredit: number; difference: number }
}

export function useJournalEntries(): UseJournalEntriesReturn {
    const [entries, setEntries] = useState<JournalEntry[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const validateBalance = useCallback((lines: JournalLine[]) => {
        const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0)
        const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0)
        const difference = Math.abs(totalDebit - totalCredit)

        return {
            valid: difference < 0.01, // Allow small rounding difference
            totalDebit,
            totalCredit,
            difference
        }
    }, [])

    const fetchEntries = useCallback(async (dateFrom?: string, dateTo?: string) => {
        try {
            setLoading(true)
            setError(null)

            let query = (supabase as any)
                .from('journal_entries')
                .select(`
          *,
          lines:journal_lines(
            *,
            account:transaction_accounts(name, code)
          )
        `)
                .order('date', { ascending: false })

            if (dateFrom) {
                query = query.gte('date', dateFrom)
            }
            if (dateTo) {
                query = query.lte('date', dateTo)
            }

            const { data, error: fetchError } = await query

            if (fetchError) throw fetchError

            const entriesWithTotals: JournalEntry[] = (data || []).map((entry: any) => {
                const lines: JournalLine[] = (entry.lines || []).map((line: any) => ({
                    id: line.id,
                    journal_entry_id: line.journal_entry_id,
                    account_id: line.account_id,
                    account_name: line.account?.name,
                    account_code: line.account?.code,
                    debit: line.debit || 0,
                    credit: line.credit || 0,
                    description: line.description,
                    created_at: line.created_at
                }))

                const { totalDebit, totalCredit } = validateBalance(lines)

                return {
                    id: entry.id,
                    date: entry.date,
                    reference: entry.reference,
                    description: entry.description,
                    created_by: entry.created_by,
                    lines,
                    total_debit: totalDebit,
                    total_credit: totalCredit,
                    created_at: entry.created_at,
                    updated_at: entry.updated_at
                }
            })

            setEntries(entriesWithTotals)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch journal entries')
        } finally {
            setLoading(false)
        }
    }, [validateBalance])

    const getEntry = useCallback(async (id: string): Promise<JournalEntry | null> => {
        try {
            const { data, error: fetchError } = await (supabase as any)
                .from('journal_entries')
                .select(`
          *,
          lines:journal_lines(
            *,
            account:transaction_accounts(name, code)
          )
        `)
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const lines: JournalLine[] = (data.lines || []).map((line: any) => ({
                id: line.id,
                journal_entry_id: line.journal_entry_id,
                account_id: line.account_id,
                account_name: line.account?.name,
                account_code: line.account?.code,
                debit: line.debit || 0,
                credit: line.credit || 0,
                description: line.description,
                created_at: line.created_at
            }))

            const { totalDebit, totalCredit } = validateBalance(lines)

            return {
                id: data.id,
                date: data.date,
                reference: data.reference,
                description: data.description,
                created_by: data.created_by,
                lines,
                total_debit: totalDebit,
                total_credit: totalCredit,
                created_at: data.created_at,
                updated_at: data.updated_at
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch journal entry')
            return null
        }
    }, [validateBalance])

    const createEntry = useCallback(async (
        entry: Omit<JournalEntry, 'id' | 'total_debit' | 'total_credit' | 'created_at' | 'updated_at'>
    ): Promise<JournalEntry | null> => {
        try {
            // Validate balance before creating
            const balance = validateBalance(entry.lines)
            if (!balance.valid) {
                throw new Error(`Journal entry must be balanced. Debits: $${balance.totalDebit.toFixed(2)}, Credits: $${balance.totalCredit.toFixed(2)}`)
            }

            // Create journal entry
            const { data: entryData, error: entryError } = await (supabase as any)
                .from('journal_entries')
                .insert({
                    date: entry.date,
                    reference: entry.reference,
                    description: entry.description
                })
                .select()
                .single()

            if (entryError) throw entryError

            // Create journal lines
            const linesToInsert = entry.lines.map(line => ({
                journal_entry_id: entryData.id,
                account_id: line.account_id,
                debit: line.debit || 0,
                credit: line.credit || 0,
                description: line.description
            }))

            const { error: linesError } = await (supabase as any)
                .from('journal_lines')
                .insert(linesToInsert)

            if (linesError) {
                // Rollback: delete the entry if lines failed
                await (supabase as any).from('journal_entries').delete().eq('id', entryData.id)
                throw linesError
            }

            // Fetch the complete entry
            const result = await getEntry(entryData.id)
            if (result) {
                await fetchEntries()
            }
            return result
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create journal entry')
            return null
        }
    }, [validateBalance, getEntry, fetchEntries])

    const updateEntry = useCallback(async (
        id: string,
        entry: Partial<JournalEntry>
    ): Promise<JournalEntry | null> => {
        try {
            // Update entry metadata
            const updateData: any = {}
            if (entry.date) updateData.date = entry.date
            if (entry.reference !== undefined) updateData.reference = entry.reference
            if (entry.description !== undefined) updateData.description = entry.description

            if (Object.keys(updateData).length > 0) {
                const { error: updateError } = await (supabase as any)
                    .from('journal_entries')
                    .update(updateData)
                    .eq('id', id)

                if (updateError) throw updateError
            }

            // If lines are provided, replace them
            if (entry.lines) {
                const balance = validateBalance(entry.lines)
                if (!balance.valid) {
                    throw new Error(`Journal entry must be balanced. Debits: $${balance.totalDebit.toFixed(2)}, Credits: $${balance.totalCredit.toFixed(2)}`)
                }

                // Delete existing lines
                await (supabase as any)
                    .from('journal_lines')
                    .delete()
                    .eq('journal_entry_id', id)

                // Insert new lines
                const linesToInsert = entry.lines.map(line => ({
                    journal_entry_id: id,
                    account_id: line.account_id,
                    debit: line.debit || 0,
                    credit: line.credit || 0,
                    description: line.description
                }))

                const { error: linesError } = await (supabase as any)
                    .from('journal_lines')
                    .insert(linesToInsert)

                if (linesError) throw linesError
            }

            const result = await getEntry(id)
            if (result) {
                await fetchEntries()
            }
            return result
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update journal entry')
            return null
        }
    }, [validateBalance, getEntry, fetchEntries])

    const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await (supabase as any)
                .from('journal_entries')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError
            await fetchEntries()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete journal entry')
            return false
        }
    }, [fetchEntries])

    return {
        entries,
        loading,
        error,
        fetchEntries,
        getEntry,
        createEntry,
        updateEntry,
        deleteEntry,
        validateBalance
    }
}
