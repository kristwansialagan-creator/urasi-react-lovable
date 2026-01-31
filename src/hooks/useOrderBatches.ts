import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface OrderProductBatch {
    id: string
    order_product_id: string
    batch_id: string
    batch_number: string
    expiry_date: string | null
    quantity_deducted: number
    purchase_price: number | null
    created_at: string | null
}

export function useOrderBatches() {
    const [batches, setBatches] = useState<OrderProductBatch[]>([])
    const [loading, setLoading] = useState(false)

    const fetchBatchesByOrderProduct = useCallback(async (orderProductId: string): Promise<OrderProductBatch[]> => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('orders_products_batches')
                .select('*')
                .eq('order_product_id', orderProductId)
                .order('created_at')

            if (error) throw error
            setBatches(data || [])
            return data || []
        } catch (err) {
            console.error('Error fetching order product batches:', err)
            return []
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchBatchesByOrder = useCallback(async (orderId: string): Promise<OrderProductBatch[]> => {
        try {
            setLoading(true)
            // Get all order products for this order
            const { data: orderProducts } = await supabase
                .from('orders_products')
                .select('id')
                .eq('order_id', orderId)

            if (!orderProducts || orderProducts.length === 0) return []

            const orderProductIds = orderProducts.map(op => op.id)

            const { data, error } = await supabase
                .from('orders_products_batches')
                .select('*')
                .in('order_product_id', orderProductIds)
                .order('created_at')

            if (error) throw error
            setBatches(data || [])
            return data || []
        } catch (err) {
            console.error('Error fetching order batches:', err)
            return []
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        batches,
        loading,
        fetchBatchesByOrderProduct,
        fetchBatchesByOrder
    }
}
