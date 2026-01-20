import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export function MonthlySalesCard() {
    const [data, setData] = useState({
        last30Days: 0,
        previous30Days: 0,
        percentageChange: 0,
        last30DaysOrders: 0
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const today = new Date()
            today.setHours(23, 59, 59, 999)

            // Last 30 days (including today)
            const last30DaysStart = new Date(today)
            last30DaysStart.setDate(last30DaysStart.getDate() - 29)
            last30DaysStart.setHours(0, 0, 0, 0)

            // Previous 30 days (for comparison)
            const previous30DaysStart = new Date(last30DaysStart)
            previous30DaysStart.setDate(previous30DaysStart.getDate() - 30)

            // Last 30 days orders
            const { data: last30DaysOrders, error: last30DaysError } = await supabase
                .from('orders')
                .select('id')
                .gte('created_at', last30DaysStart.toISOString())
                .neq('payment_status', 'void')

            if (last30DaysError) throw last30DaysError

            const last30DaysOrderIds = last30DaysOrders?.map(o => o.id) || []
            let last30DaysTotal = 0

            if (last30DaysOrderIds.length > 0) {
                const { data: last30DaysPayments } = await supabase
                    .from('orders_payments')
                    .select('value')
                    .in('order_id', last30DaysOrderIds)

                last30DaysTotal = last30DaysPayments?.reduce((sum, p) => sum + (p.value || 0), 0) || 0
            }

            // Previous 30 days orders (for comparison)
            const { data: previous30DaysOrders, error: previous30DaysError } = await supabase
                .from('orders')
                .select('id')
                .gte('created_at', previous30DaysStart.toISOString())
                .lt('created_at', last30DaysStart.toISOString())
                .neq('payment_status', 'void')

            if (previous30DaysError) throw previous30DaysError

            const previous30DaysOrderIds = previous30DaysOrders?.map(o => o.id) || []
            let previous30DaysTotal = 0

            if (previous30DaysOrderIds.length > 0) {
                const { data: previous30DaysPayments } = await supabase
                    .from('orders_payments')
                    .select('value')
                    .in('order_id', previous30DaysOrderIds)

                previous30DaysTotal = previous30DaysPayments?.reduce((sum, p) => sum + (p.value || 0), 0) || 0
            }

            const percentageChange = previous30DaysTotal > 0
                ? ((last30DaysTotal - previous30DaysTotal) / previous30DaysTotal) * 100
                : 0

            setData({
                last30Days: last30DaysTotal,
                previous30Days: previous30DaysTotal,
                percentageChange,
                last30DaysOrders: last30DaysOrderIds.length
            })
        } catch (error) {
            console.error('Error fetching monthly sales data:', error)
        }
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last 30 Days Sales</CardTitle>
                <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent className="pb-3">
                <div className="text-xl font-bold">{formatCurrency(data.last30Days)}</div>
                <div className="flex items-center text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    {data.percentageChange >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                        <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <span className={data.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(data.percentageChange).toFixed(1)}%
                    </span>
                    <span className="ml-1">vs previous 30 days</span>
                </div>
                <div className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-2">
                    {data.last30DaysOrders} Orders
                </div>
            </CardContent>
        </Card>
    )
}
