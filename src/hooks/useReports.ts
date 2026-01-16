import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface SalesStats {
    today: { orders: number; sales: number }
    week: { orders: number; sales: number }
    month: { orders: number; sales: number }
}

interface TopProduct {
    id: string
    name: string
    quantity_sold: number
    total_sales: number
}

interface TopCustomer {
    id: string
    name: string
    total_purchases: number
    orders_count: number
}

interface PaymentBreakdown {
    identifier: string
    label: string
    total: number
    count: number
}

interface UseReportsReturn {
    loading: boolean
    error: string | null
    getSalesStats: () => Promise<SalesStats>
    getDailySales: (days?: number) => Promise<any[]>
    getTopProducts: (limit?: number) => Promise<TopProduct[]>
    getTopCustomers: (limit?: number) => Promise<TopCustomer[]>
    getPaymentBreakdown: () => Promise<PaymentBreakdown[]>
    getLowStockCount: () => Promise<number>
    getOrdersByStatus: () => Promise<{ status: string; count: number }[]>
}

interface OrderRow {
    total: number
    payment_status?: string
}

interface OrderProductRow {
    product_id: string | null
    name: string | null
    quantity: number
    total_price: number
}

interface CustomerRow {
    id: string
    first_name: string | null
    last_name: string | null
    purchases_amount: number
}

interface StockRow {
    id: string
    quantity: number
    low_quantity: number
}

export function useReports(): UseReportsReturn {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getSalesStats = useCallback(async (): Promise<SalesStats> => {
        setLoading(true)
        try {
            const now = new Date()
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
            const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

            const { data: todayData } = await supabase
                .from('orders')
                .select('total')
                .gte('created_at', todayStart)
                .neq('payment_status', 'void')

            const { data: weekData } = await supabase
                .from('orders')
                .select('total')
                .gte('created_at', weekStart)
                .neq('payment_status', 'void')

            const { data: monthData } = await supabase
                .from('orders')
                .select('total')
                .gte('created_at', monthStart)
                .neq('payment_status', 'void')

            const todayRows = (todayData || []) as OrderRow[]
            const weekRows = (weekData || []) as OrderRow[]
            const monthRows = (monthData || []) as OrderRow[]

            return {
                today: {
                    orders: todayRows.length,
                    sales: todayRows.reduce((sum, o) => sum + (o.total || 0), 0)
                },
                week: {
                    orders: weekRows.length,
                    sales: weekRows.reduce((sum, o) => sum + (o.total || 0), 0)
                },
                month: {
                    orders: monthRows.length,
                    sales: monthRows.reduce((sum, o) => sum + (o.total || 0), 0)
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get sales stats')
            return {
                today: { orders: 0, sales: 0 },
                week: { orders: 0, sales: 0 },
                month: { orders: 0, sales: 0 }
            }
        } finally {
            setLoading(false)
        }
    }, [])

    const getDailySales = useCallback(async (days = 7): Promise<any[]> => {
        try {
            const fromDate = new Date()
            fromDate.setDate(fromDate.getDate() - days)
            fromDate.setHours(0, 0, 0, 0)

            const { data: orders, error: fetchError } = await supabase
                .from('orders')
                .select('created_at, total')
                .gte('created_at', fromDate.toISOString())
                .neq('payment_status', 'void')
                .order('created_at', { ascending: true })

            if (fetchError) throw fetchError

            // Aggregate by date
            const salesMap = new Map<string, { date: string; sales: number; orders: number }>()

            // Initialize last 7 days with 0
            for (let i = 0; i <= days; i++) {
                const d = new Date()
                d.setDate(d.getDate() - (days - i))
                const dateStr = d.toISOString().split('T')[0]
                salesMap.set(dateStr, { date: dateStr, sales: 0, orders: 0 })
            }

            orders?.forEach((order: any) => {
                const dateStr = new Date(order.created_at).toISOString().split('T')[0]
                if (salesMap.has(dateStr)) {
                    const current = salesMap.get(dateStr)!
                    current.sales += order.total || 0
                    current.orders += 1
                }
            })

            return Array.from(salesMap.values())
        } catch (err) {
            console.error('Error fetching daily sales:', err)
            return []
        }
    }, [])

    const getTopProducts = useCallback(async (limit = 10): Promise<TopProduct[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('orders_products')
                .select('product_id, name, quantity, total_price')
                .eq('status', 'sold')

            if (fetchError) throw fetchError

            const rows = (data || []) as OrderProductRow[]
            const productMap = new Map<string, TopProduct>()

            rows.forEach(item => {
                if (!item.product_id) return
                const existing = productMap.get(item.product_id)
                if (existing) {
                    existing.quantity_sold += item.quantity || 0
                    existing.total_sales += item.total_price || 0
                } else {
                    productMap.set(item.product_id, {
                        id: item.product_id,
                        name: item.name || 'Unknown',
                        quantity_sold: item.quantity || 0,
                        total_sales: item.total_price || 0
                    })
                }
            })

            return Array.from(productMap.values())
                .sort((a, b) => b.total_sales - a.total_sales)
                .slice(0, limit)
        } catch {
            return []
        }
    }, [])

    const getTopCustomers = useCallback(async (limit = 10): Promise<TopCustomer[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('customers')
                .select('id, first_name, last_name, purchases_amount')
                .order('purchases_amount', { ascending: false })
                .limit(limit)

            if (fetchError) throw fetchError

            const rows = (data || []) as CustomerRow[]
            const customerIds = rows.map(c => c.id)

            const { data: orderCounts } = await supabase
                .from('orders')
                .select('customer_id')
                .in('customer_id', customerIds)

            const countMap = new Map<string, number>()
            const orderRows = (orderCounts || []) as { customer_id: string | null }[]
            orderRows.forEach(o => {
                if (o.customer_id) {
                    countMap.set(o.customer_id, (countMap.get(o.customer_id) || 0) + 1)
                }
            })

            return rows.map(c => ({
                id: c.id,
                name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unknown',
                total_purchases: c.purchases_amount || 0,
                orders_count: countMap.get(c.id) || 0
            }))
        } catch {
            return []
        }
    }, [])

    const getPaymentBreakdown = useCallback(async (): Promise<PaymentBreakdown[]> => {
        try {
            const { data: payments, error: fetchError } = await supabase
                .from('orders_payments')
                .select('value, payment_type_id')

            if (fetchError) throw fetchError

            const { data: types } = await supabase
                .from('payment_types')
                .select('id, identifier, label')

            const typeMap = new Map<string, { identifier: string; label: string }>()
            const typeRows = (types || []) as { id: string; identifier: string; label: string }[]
            typeRows.forEach(t => typeMap.set(t.id, { identifier: t.identifier, label: t.label }))

            const breakdownMap = new Map<string, PaymentBreakdown>()
            const paymentRows = (payments || []) as { value: number; payment_type_id: string | null }[]

            paymentRows.forEach(p => {
                if (!p.payment_type_id) return
                const pt = typeMap.get(p.payment_type_id)
                if (!pt) return

                const existing = breakdownMap.get(pt.identifier)
                if (existing) {
                    existing.total += p.value || 0
                    existing.count += 1
                } else {
                    breakdownMap.set(pt.identifier, {
                        identifier: pt.identifier,
                        label: pt.label,
                        total: p.value || 0,
                        count: 1
                    })
                }
            })

            return Array.from(breakdownMap.values())
                .sort((a, b) => b.total - a.total)
        } catch {
            return []
        }
    }, [])

    const getLowStockCount = useCallback(async (): Promise<number> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('product_unit_quantities')
                .select('id, quantity, low_quantity')
                .eq('stock_alert_enabled', true)

            if (fetchError) throw fetchError

            const rows = (data || []) as StockRow[]
            return rows.filter(p => p.quantity < p.low_quantity).length
        } catch {
            return 0
        }
    }, [])

    const getOrdersByStatus = useCallback(async (): Promise<{ status: string; count: number }[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select('payment_status')

            if (fetchError) throw fetchError

            const rows = (data || []) as { payment_status: string }[]
            const statusMap = new Map<string, number>()
            rows.forEach(o => {
                statusMap.set(o.payment_status, (statusMap.get(o.payment_status) || 0) + 1)
            })

            return Array.from(statusMap.entries()).map(([status, count]) => ({
                status,
                count
            }))
        } catch {
            return []
        }
    }, [])

    return {
        loading,
        error,
        getSalesStats,
        getDailySales,
        getTopProducts,
        getTopCustomers,
        getPaymentBreakdown,
        getLowStockCount,
        getOrdersByStatus
    }
}
