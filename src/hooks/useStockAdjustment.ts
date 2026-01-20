import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface StockAdjustment {
    id: string
    product_id: string | null
    product?: { id: string; name: string; sku: string | null } | null
    unit_id: string | null
    unit?: { id: string; identifier: string } | null
    before_quantity: number | null
    after_quantity: number | null
    quantity: number | null
    description: string | null
    author: string | null
    created_at: string | null
    operation_type: string | null
}

export function useStockAdjustment() {
    const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    const fetchAdjustments = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error: err } = await (supabase
                .from('products_history')
                .select('*, product:products(id, name, sku), unit:units(id, identifier)')
                .eq('operation_type', 'adjustment')
                .order('created_at', { ascending: false })
                .limit(200) as any)

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
            // Get current quantity from product_unit_quantities
            const { data: stockData, error: stockErr } = await supabase
                .from('product_unit_quantities')
                .select('id, quantity')
                .eq('product_id', productId)
                .eq('unit_id', unitId)
                .maybeSingle()

            if (stockErr) throw stockErr

            const previousQty = stockData?.quantity || 0

            // Update or insert stock
            if (stockData?.id) {
                const { error: updateErr } = await supabase
                    .from('product_unit_quantities')
                    .update({ quantity: newQuantity })
                    .eq('id', stockData.id)

                if (updateErr) throw updateErr
            } else {
                const { error: insertErr } = await supabase
                    .from('product_unit_quantities')
                    .insert([{
                        product_id: productId,
                        unit_id: unitId,
                        quantity: newQuantity
                    }])

                if (insertErr) throw insertErr
            }

            // Record history
            const user = await supabase.auth.getUser()
            const { error: histErr } = await supabase
                .from('products_history')
                .insert([{
                    product_id: productId,
                    unit_id: unitId,
                    operation_type: 'adjustment',
                    before_quantity: previousQty,
                    quantity: newQuantity - previousQty,
                    after_quantity: newQuantity,
                    description: description || reason,
                    author: user.data.user?.id
                }])

            if (histErr) throw histErr

            toast({
                title: 'Stock Adjusted',
                description: `Stock updated from ${previousQty} to ${newQuantity}`
            })

            await fetchAdjustments()
            return true
        } catch (err: any) {
            setError(err.message)
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive'
            })
            return false
        } finally {
            setLoading(false)
        }
    }, [fetchAdjustments, toast])

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
