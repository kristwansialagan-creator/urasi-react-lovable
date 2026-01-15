import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface StockAdjustment {
    id: string
    product_id: string
    product?: { id: string; name: string; sku: string | null }
    unit_id: string
    unit?: { id: string; identifier: string }
    quantity: number
    previous_quantity: number
    reason: string
    description: string | null
    author: string
    created_at: string
}

export function useStockAdjustment() {
    const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchAdjustments = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error: err } = await supabase
                .from('product_history')
                .select('*, product:products(id, name, sku), unit:units(id, identifier)')
                .eq('operation_type', 'adjustment')
                .order('created_at', { ascending: false })
                .limit(200)

            if (err) throw err
            setAdjustments(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const adjustStock = useCallback(async (
        productId: string,
        unitId: string,
        newQuantity: number,
        reason: string,
        description?: string
    ) => {
        setLoading(true)
        try {
            // Get current quantity
            const { data: stockData } = await supabase
                .from('product_unit_quantities')
                .select('quantity')
                .eq('product_id', productId)
                .eq('unit_id', unitId)
                .single()

            const previousQty = (stockData as { quantity: number } | null)?.quantity || 0

            // Update stock
            const { error: updateErr } = await supabase
                .from('product_unit_quantities')
                .upsert({
                    product_id: productId,
                    unit_id: unitId,
                    quantity: newQuantity
                } as never, { onConflict: 'product_id,unit_id' })

            if (updateErr) throw updateErr

            // Record history
            const user = await supabase.auth.getUser()
            const { error: histErr } = await supabase
                .from('product_history')
                .insert([{
                    product_id: productId,
                    unit_id: unitId,
                    operation_type: 'adjustment',
                    before_quantity: previousQty,
                    quantity: newQuantity - previousQty,
                    after_quantity: newQuantity,
                    description: description || reason,
                    author: user.data.user?.id
                }] as never)

            if (histErr) throw histErr

            await fetchAdjustments()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        } finally {
            setLoading(false)
        }
    }, [fetchAdjustments])

    const bulkAdjust = useCallback(async (
        adjustments: { productId: string; unitId: string; newQuantity: number }[],
        reason: string
    ) => {
        setLoading(true)
        try {
            for (const adj of adjustments) {
                await adjustStock(adj.productId, adj.unitId, adj.newQuantity, reason)
            }
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        } finally {
            setLoading(false)
        }
    }, [adjustStock])

    return {
        adjustments,
        loading,
        error,
        fetchAdjustments,
        adjustStock,
        bulkAdjust
    }
}
