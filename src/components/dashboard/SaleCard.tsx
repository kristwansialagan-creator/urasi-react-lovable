import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export function SaleCard() {
    const [data, setData] = useState({
        thisWeek: 0,
        lastWeek: 0,
        percentageChange: 0,
        last7DaysOrders: 0
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const today = new Date()
            today.setHours(23, 59, 59, 999) // End of today

            // Last 7 days (including today)
            const last7DaysStart = new Date(today)
            last7DaysStart.setDate(last7DaysStart.getDate() - 6)
            last7DaysStart.setHours(0, 0, 0, 0)

            // Previous 7 days (for comparison)
            const previous7DaysStart = new Date(last7DaysStart)
            previous7DaysStart.setDate(previous7DaysStart.getDate() - 7)

            // Last 7 days orders
            const { data: last7DaysOrders, error: last7DaysError } = await supabase
                .from('orders')
                .select('id')
                .gte('created_at', last7DaysStart.toISOString())
                .neq('payment_status', 'void')

            if (last7DaysError) throw last7DaysError

            const last7DaysOrderIds = last7DaysOrders?.map(o => o.id) || []
            let last7DaysTotal = 0

            if (last7DaysOrderIds.length > 0) {
                const { data: last7DaysPayments } = await supabase
                    .from('orders_payments')
                    .select('value')
                    .in('order_id', last7DaysOrderIds)

                last7DaysTotal = last7DaysPayments?.reduce((sum, p) => sum + (p.value || 0), 0) || 0
            }

            // Previous 7 days orders (for comparison)
            const { data: previous7DaysOrders, error: previous7DaysError } = await supabase
                .from('orders')
                .select('id')
                .gte('created_at', previous7DaysStart.toISOString())
                .lt('created_at', last7DaysStart.toISOString())
                .neq('payment_status', 'void')

            if (previous7DaysError) throw previous7DaysError

            const previous7DaysOrderIds = previous7DaysOrders?.map(o => o.id) || []
            let previous7DaysTotal = 0

            if (previous7DaysOrderIds.length > 0) {
                const { data: previous7DaysPayments } = await supabase
                    .from('orders_payments')
                    .select('value')
                    .in('order_id', previous7DaysOrderIds)

                previous7DaysTotal = previous7DaysPayments?.reduce((sum, p) => sum + (p.value || 0), 0) || 0
            }

            const percentageChange = previous7DaysTotal > 0
                ? ((last7DaysTotal - previous7DaysTotal) / previous7DaysTotal) * 100
                : 0

            setData({
                thisWeek: last7DaysTotal,
                lastWeek: previous7DaysTotal,
                percentageChange,
                last7DaysOrders: last7DaysOrderIds.length
            })
        } catch (error) {
            console.error('Error fetching sales data:', error)
        }
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last 7 Days Sales</CardTitle>
                <ShoppingCart className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent className="pb-3">
                <div className="text-xl font-bold">{formatCurrency(data.thisWeek)}</div>
                <div className="flex items-center text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    {data.percentageChange >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                        <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <span className={data.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(data.percentageChange).toFixed(1)}%
                    </span>
                    <span className="ml-1">vs previous 7 days</span>
                </div>
                <div className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-2">
                    {data.last7DaysOrders} Orders
                </div>
            </CardContent>
        </Card>
    )
}
