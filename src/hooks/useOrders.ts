import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { generateOrderCode } from '@/lib/utils'
import { useSettings } from './useSettings'

interface Customer {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone: string | null
}

interface Order {
    id: string
    code: string
    type: string | null
    payment_status: string | null
    process_status: string | null
    delivery_status: string | null
    customer_id: string | null
    subtotal: number | null
    total: number | null
    tendered: number | null
    change: number | null
    voidance_reason: string | null
    note: string | null
    register_id: string | null
    created_at: string | null
    updated_at: string | null
    discount: number | null
    total_coupons: number | null
}

interface OrderProduct {
    id: string
    order_id: string | null
    product_id: string | null
    name: string | null
    quantity: number
    unit_price: number
    total_price: number
}

interface OrderPayment {
    id: string
    order_id: string | null
    payment_type_id: string | null
    value: number
}

interface PaymentType {
    id: string
    label: string
    identifier: string
    active: boolean
}

interface OrderWithDetails extends Order {
    customer?: Customer | null
    products?: OrderProduct[]
    payments?: OrderPayment[]
    installments?: any[]
}

interface CartItem {
    product_id: string
    name: string
    unit_price: number
    quantity: number
    unit_id?: string
    discount: number
    discount_type: 'flat' | 'percentage'
    tax_value: number
    total_price: number
}

interface Refund {
    id: string
    order_id: string
    status: string
    total_refunded: number
    reason: string | null
    created_at: string
}

interface RefundProduct {
    product_id: string
    quantity: number
    unit_price: number
    total_price: number
}

interface UseOrdersReturn {
    orders: OrderWithDetails[]
    totalCount: number
    paymentTypes: PaymentType[]
    loading: boolean
    error: string | null
    fetchOrders: (filters?: OrderFilters) => Promise<void>
    fetchPaymentTypes: () => Promise<void>
    getOrder: (id: string) => Promise<OrderWithDetails | null>
    createOrder: (order: CreateOrderInput) => Promise<Order | null>
    updateOrderStatus: (id: string, status: Partial<Pick<Order, 'payment_status' | 'process_status' | 'delivery_status'>>) => Promise<boolean>
    addPayment: (orderId: string, payment: { payment_type_id: string; value: number }) => Promise<boolean>
    voidOrder: (id: string, reason: string) => Promise<boolean>
    getOrderStats: () => Promise<OrderStats>
    createRefund: (orderId: string, products: RefundProduct[], reason: string) => Promise<Refund | null>
    processRefund: (refundId: string) => Promise<boolean>
}

interface OrderFilters {
    payment_status?: string
    process_status?: string
    delivery_status?: string
    customer_id?: string
    from_date?: string
    to_date?: string
    search?: string
    payment_method_id?: string
    has_installments?: boolean
    page?: number
    limit?: number
}

interface CreateOrderInput {
    type?: string
    customer_id?: string | null
    register_id?: string | null
    products: CartItem[]
    discount?: number
    discount_type?: string
    shipping?: number
    note?: string
    payments?: { payment_type_id: string; value: number }[]
}

interface OrderStats {
    total_orders: number
    total_sales: number
    paid_orders: number
    unpaid_orders: number
    partial_orders: number
}

export function useOrders(): UseOrdersReturn {
    const [orders, setOrders] = useState<OrderWithDetails[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { settings } = useSettings()

    const fetchOrders = useCallback(async (filters?: OrderFilters) => {
        setLoading(true)
        setError(null)
        try {
            const paymentsRelation = filters?.payment_method_id ? 'payments:orders_payments!inner(*)' : 'payments:orders_payments(*)'
            const page = filters?.page || 1
            const limit = filters?.limit || 20
            const from = (page - 1) * limit
            const to = from + limit - 1

            let query = supabase
                .from('orders')
                .select(`
                    *,
                    customer:customers(*),
                    products:orders_products(*),
                    ${paymentsRelation},
                    installments:orders_instalments(*)
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to)

            if (filters?.payment_status) query = query.eq('payment_status', filters.payment_status)
            if (filters?.process_status) query = query.eq('process_status', filters.process_status)
            if (filters?.delivery_status) query = query.eq('delivery_status', filters.delivery_status)
            if (filters?.customer_id) query = query.eq('customer_id', filters.customer_id)
            if (filters?.from_date) query = query.gte('created_at', filters.from_date)
            if (filters?.to_date) query = query.lte('created_at', filters.to_date)
            if (filters?.search) query = query.ilike('code', `%${filters.search}%`)
            if (filters?.payment_method_id) query = query.eq('payments.payment_type_id', filters.payment_method_id)
            if (filters?.has_installments !== undefined) {
                if (filters.has_installments) {
                    query = query.not('installments.id', 'is', null)
                } else {
                    query = query.is('installments.id', null)
                }
            }

            const { data, count, error: fetchError } = await (query as any)

            if (fetchError) throw fetchError
            setOrders((data as OrderWithDetails[]) || [])
            setTotalCount(count || 0)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch orders')
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchPaymentTypes = useCallback(async () => {
        try {
            const { data, error: fetchError } = await (supabase
                .from('payment_types')
                .select('*')
                .eq('active', true)
                .order('priority') as any)

            if (fetchError) throw fetchError
            setPaymentTypes((data as PaymentType[]) || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch payment types')
        }
    }, [])

    const getOrder = useCallback(async (id: string): Promise<OrderWithDetails | null> => {
        try {
            const { data, error: fetchError } = await (supabase
                .from('orders')
                .select(`
                    *,
                    customer:customers(*),
                    products:orders_products(*),
                    payments:orders_payments(*)
                `)
                .eq('id', id)
                .single() as any)

            if (fetchError) throw fetchError
            return data as OrderWithDetails
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch order')
            return null
        }
    }, [])

    const createOrder = useCallback(async (input: CreateOrderInput): Promise<Order | null> => {
        try {
            const subtotal = input.products.reduce((sum, p) => sum + p.total_price, 0)
            const discount = input.discount || 0
            const shipping = input.shipping || 0
            const taxValue = input.products.reduce((sum, p) => sum + p.tax_value, 0)
            const total = subtotal - discount + shipping
            const tendered = input.payments?.reduce((sum, p) => sum + p.value, 0) || 0
            const change = Math.max(0, tendered - total)
            const paymentStatus = tendered >= total ? 'paid' : tendered > 0 ? 'partially_paid' : 'unpaid'

            // Generate order code using settings prefix
            const orderCodePrefix = settings.order_code_prefix || 'ORD-'
            const orderCode = generateOrderCode(orderCodePrefix)

            console.log('Creating order with settings:', settings)
            console.log('Generated order code:', orderCode)

            // Get customer billing address if customer selected
            let billingAddress = null
            if (input.customer_id) {
                const { data: addressData } = await supabase
                    .from('customers_addresses')
                    .select('*')
                    .eq('customer_id', input.customer_id)
                    .eq('type', 'billing')
                    .single()

                if (addressData) {
                    billingAddress = {
                        address_1: addressData.address_1,
                        address_2: addressData.address_2,
                        city: addressData.city,
                        country: addressData.country,
                        pobox: addressData.pobox
                    }
                }
            }

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    code: orderCode,
                    type: input.type || 'in-store',
                    customer_id: input.customer_id,
                    billing_address: billingAddress,
                    register_id: input.register_id,
                    subtotal,
                    products_total: subtotal,
                    discount,
                    discount_type: input.discount_type || 'flat',
                    shipping,
                    tax_value: taxValue,
                    total,
                    tendered,
                    change,
                    payment_status: paymentStatus,
                    note: input.note
                } as never)
                .select()
                .single()

            if (orderError) throw orderError

            const orderData = order as Order

            if (input.products.length > 0) {
                const orderProducts = input.products.map(p => ({
                    order_id: orderData.id,
                    product_id: p.product_id,
                    name: p.name,
                    unit_id: p.unit_id,
                    quantity: p.quantity,
                    unit_price: p.unit_price,
                    discount: p.discount,
                    discount_type: p.discount_type,
                    tax_value: p.tax_value,
                    total_price: p.total_price
                }))

                // Insert order products and get their IDs
                const { data: insertedProducts, error: productsError } = await supabase
                    .from('orders_products')
                    .insert(orderProducts as never)
                    .select('id, product_id, unit_id, quantity')

                if (productsError) throw productsError

                // Deduct stock using FEFO for each product
                for (const orderedProduct of (insertedProducts || [])) {
                    if (!orderedProduct.unit_id || !orderedProduct.product_id) continue

                    const unitId = orderedProduct.unit_id as string // Guaranteed non-null after check above
                    const productId = orderedProduct.product_id as string // Guaranteed non-null after check above

                    // Get batches sorted by expiry date (FEFO)
                    const { data: availableBatches, error: fetchError } = await supabase
                        .from('stock_batches')
                        .select('*')
                        .eq('product_id', productId)
                        .eq('unit_id', unitId)
                        .gt('quantity', 0)
                        .order('expiry_date', { ascending: true, nullsFirst: false })

                    if (fetchError) throw fetchError

                    if (!availableBatches || availableBatches.length === 0) {
                        console.warn(`No stock batches for product ${orderedProduct.product_id}`)
                        continue
                    }

                    let remaining = Number(orderedProduct.quantity)
                    const batchDeductions: Array<{
                        order_product_id: string
                        batch_id: string
                        batch_number: string
                        expiry_date: string | null
                        quantity_deducted: number
                        purchase_price: number | null
                    }> = []

                    for (const batch of availableBatches) {
                        if (remaining <= 0) break

                        const toDeduct = Math.min(Number(batch.quantity), remaining)

                        // Update batch quantity
                        await supabase
                            .from('stock_batches')
                            .update({ quantity: Number(batch.quantity) - toDeduct } as never)
                            .eq('id', batch.id)

                        batchDeductions.push({
                            order_product_id: orderedProduct.id,
                            batch_id: batch.id,
                            batch_number: batch.batch_number,
                            expiry_date: batch.expiry_date,
                            quantity_deducted: toDeduct,
                            purchase_price: batch.purchase_price ?? null
                        })

                        remaining -= toDeduct
                    }

                    // Insert batch deductions record
                    if (batchDeductions.length > 0) {
                        await supabase
                            .from('orders_products_batches')
                            .insert(batchDeductions as never)
                    }

                    // Sync total quantity in product_unit_quantities
                    const { data: totalData } = await supabase
                        .from('stock_batches')
                        .select('quantity')
                        .eq('product_id', productId)
                        .eq('unit_id', unitId)

                    const totalStock = (totalData || []).reduce((sum, b) => sum + Number(b.quantity), 0)

                    await supabase
                        .from('product_unit_quantities')
                        .upsert({
                            product_id: productId,
                            unit_id: unitId,
                            quantity: totalStock
                        } as never, { onConflict: 'product_id,unit_id' })
                }
            }

            if (input.payments && input.payments.length > 0) {
                const orderPayments = input.payments.map(p => ({
                    order_id: orderData.id,
                    payment_type_id: p.payment_type_id,
                    value: p.value
                }))

                await supabase.from('orders_payments').insert(orderPayments as never)
            }

            await fetchOrders()
            return orderData
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create order')
            return null
        }
    }, [fetchOrders, settings])

    const updateOrderStatus = useCallback(async (
        id: string,
        status: Partial<Pick<Order, 'payment_status' | 'process_status' | 'delivery_status'>>
    ): Promise<boolean> => {
        try {
            const { error: updateError } = await supabase
                .from('orders')
                .update(status as never)
                .eq('id', id)

            if (updateError) throw updateError
            await fetchOrders()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update order status')
            return false
        }
    }, [fetchOrders])

    const addPayment = useCallback(async (orderId: string, payment: { payment_type_id: string; value: number }): Promise<boolean> => {
        try {
            const order = await getOrder(orderId)
            if (!order) throw new Error('Order not found')

            await supabase.from('orders_payments').insert({
                order_id: orderId,
                payment_type_id: payment.payment_type_id,
                value: payment.value
            } as never)

            const totalTendered = (order.tendered || 0) + payment.value
            const newStatus = totalTendered >= (order.total || 0) ? 'paid' : 'partially_paid'

            await supabase.from('orders').update({
                tendered: totalTendered,
                change: Math.max(0, totalTendered - (order.total || 0)),
                payment_status: newStatus
            } as never).eq('id', orderId)

            await fetchOrders()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add payment')
            return false
        }
    }, [getOrder, fetchOrders])

    const voidOrder = useCallback(async (id: string, reason: string): Promise<boolean> => {
        try {
            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    payment_status: 'void',
                    voidance_reason: reason
                } as never)
                .eq('id', id)

            if (updateError) throw updateError
            await fetchOrders()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to void order')
            return false
        }
    }, [fetchOrders])

    const getOrderStats = useCallback(async (): Promise<OrderStats> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select('payment_status, total')

            if (fetchError) throw fetchError

            const orderRows = (data || []) as { payment_status: string; total: number }[]

            return {
                total_orders: orderRows.length,
                total_sales: orderRows.reduce((sum, o) => sum + (o.total || 0), 0),
                paid_orders: orderRows.filter(o => o.payment_status === 'paid').length,
                unpaid_orders: orderRows.filter(o => o.payment_status === 'unpaid').length,
                partial_orders: orderRows.filter(o => o.payment_status === 'partially_paid').length
            }
        } catch {
            return { total_orders: 0, total_sales: 0, paid_orders: 0, unpaid_orders: 0, partial_orders: 0 }
        }
    }, [])

    const createRefund = useCallback(async (
        orderId: string,
        products: RefundProduct[],
        reason: string
    ): Promise<Refund | null> => {
        try {
            const totalRefunded = products.reduce((sum, p) => sum + p.total_price, 0)

            const { data: refund, error: refundError } = await supabase
                .from('orders_refunds')
                .insert({
                    order_id: orderId,
                    status: 'pending',
                    total_refunded: totalRefunded,
                    reason
                } as never)
                .select()
                .single()

            if (refundError) throw refundError

            const refundData = refund as any

            // Add refund products
            const refundProducts = products.map(p => ({
                order_refund_id: refundData.id,
                product_id: p.product_id,
                quantity: p.quantity,
                unit_price: p.unit_price,
                total_price: p.total_price
            }))

            await supabase.from('orders_product_refunds').insert(refundProducts as never)

            return refundData
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create refund')
            return null
        }
    }, [])

    const processRefund = useCallback(async (refundId: string): Promise<boolean> => {
        try {
            // Get refund products
            const { data: refundProducts } = await (supabase
                .from('orders_product_refunds')
                .select('product_id, quantity')
                .eq('order_refund_id', refundId) as any)

            if (!refundProducts) return false

            // Reverse stock for each product
            for (const product of refundProducts as any[]) {
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

            // Update refund status
            await supabase
                .from('orders_refunds')
                .update({ status: 'completed' } as never)
                .eq('id', refundId)

            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process refund')
            return false
        }
    }, [])

    useEffect(() => {
        fetchOrders()
        fetchPaymentTypes()
    }, [fetchOrders, fetchPaymentTypes])

    return {
        orders,
        totalCount,
        paymentTypes,
        loading,
        error,
        fetchOrders,
        fetchPaymentTypes,
        getOrder,
        createOrder,
        updateOrderStatus,
        addPayment,
        voidOrder,
        getOrderStats,
        createRefund,
        processRefund
    }
}
