import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Provider {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
    description: string | null
    active: boolean
    created_at: string
}

interface ProcurementProduct {
    id: string
    procurement_id: string | null
    product_id: string | null
    product_name: string | null
    quantity: number
    purchase_price: number
    total_price: number
}

interface Procurement {
    id: string
    name: string
    provider_id: string | null
    status: string
    payment_status: string
    total_price: number
    delivery_status: string
    delivery_date: string | null
    created_at: string
    provider?: Provider
    products?: ProcurementProduct[]
}

interface UseProcurementReturn {
    procurements: Procurement[]
    providers: Provider[]
    loading: boolean
    error: string | null
    fetchProcurements: () => Promise<void>
    fetchProviders: () => Promise<void>
    createProcurement: (procurement: {
        provider_id: string
        products: { product_id: string; quantity: number; purchase_price: number }[]
    }) => Promise<Procurement | null>
    receiveProcurement: (procurementId: string) => Promise<boolean>
    updateProcurementStatus: (id: string, status: string) => Promise<boolean>
    createProvider: (provider: Partial<Provider>) => Promise<Provider | null>
}

export function useProcurement(): UseProcurementReturn {
    const [procurements, setProcurements] = useState<Procurement[]>([])
    const [providers, setProviders] = useState<Provider[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchProcurements = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error: fetchError } = await supabase
                .from('procurements')
                .select(`
                    *,
                    provider:providers(*),
                    products:procurements_products(*)
                `)
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError
            setProcurements((data as Procurement[]) || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch procurements')
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchProviders = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('providers')
                .select('*')
                .eq('active', true)
                .order('name')

            if (fetchError) throw fetchError
            setProviders((data as Provider[]) || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch providers')
        }
    }, [])

    const createProcurement = useCallback(async (input: {
        provider_id: string
        products: { product_id: string; quantity: number; purchase_price: number }[]
    }): Promise<Procurement | null> => {
        try {
            const totalPrice = input.products.reduce((sum, p) => sum + (p.quantity * p.purchase_price), 0)

            const { data: procurement, error: procError } = await supabase
                .from('procurements')
                .insert({
                    provider_id: input.provider_id,
                    status: 'pending',
                    payment_status: 'unpaid',
                    delivery_status: 'pending',
                    total_price: totalPrice
                } as never)
                .select()
                .single()

            if (procError) throw procError

            const procData = procurement as Procurement

            // Add products
            const products = input.products.map(p => ({
                procurement_id: procData.id,
                product_id: p.product_id,
                quantity: p.quantity,
                purchase_price: p.purchase_price,
                total_price: p.quantity * p.purchase_price
            }))

            await supabase.from('procurements_products').insert(products as never)

            await fetchProcurements()
            return procData
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create procurement')
            return null
        }
    }, [fetchProcurements])

    const receiveProcurement = useCallback(async (procurementId: string): Promise<boolean> => {
        try {
            // Get procurement products
            const { data: products } = await supabase
                .from('procurements_products')
                .select('product_id, quantity')
                .eq('procurement_id', procurementId)

            if (!products) return false

            // Update stock for each product
            for (const product of products as { product_id: string; quantity: number }[]) {
                const { data: currentStock } = await supabase
                    .from('product_unit_quantities')
                    .select('quantity')
                    .eq('product_id', product.product_id)
                    .single()

                if (currentStock) {
                    const stockData = currentStock as { quantity: number }
                    await supabase
                        .from('product_unit_quantities')
                        .update({ quantity: stockData.quantity + product.quantity } as never)
                        .eq('product_id', product.product_id)
                }
            }

            // Update procurement status
            await supabase
                .from('procurements')
                .update({
                    status: 'completed',
                    delivery_status: 'delivered'
                } as never)
                .eq('id', procurementId)

            await fetchProcurements()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to receive procurement')
            return false
        }
    }, [fetchProcurements])

    const updateProcurementStatus = useCallback(async (id: string, status: string): Promise<boolean> => {
        try {
            const { error: updateError } = await supabase
                .from('procurements')
                .update({ status } as never)
                .eq('id', id)

            if (updateError) throw updateError
            await fetchProcurements()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update status')
            return false
        }
    }, [fetchProcurements])

    const createProvider = useCallback(async (provider: Partial<Provider>): Promise<Provider | null> => {
        try {
            const { data, error: createError } = await supabase
                .from('providers')
                .insert(provider as never)
                .select()
                .single()

            if (createError) throw createError
            await fetchProviders()
            return data as Provider
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create provider')
            return null
        }
    }, [fetchProviders])

    useEffect(() => {
        fetchProcurements()
        fetchProviders()
    }, [fetchProcurements, fetchProviders])

    return {
        procurements,
        providers,
        loading,
        error,
        fetchProcurements,
        fetchProviders,
        createProcurement,
        receiveProcurement,
        updateProcurementStatus,
        createProvider
    }
}
