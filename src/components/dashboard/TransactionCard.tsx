import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export function TransactionCard() {
    const [data, setData] = useState({
        today: 0,
        yesterday: 0,
        percentageChange: 0,
        todayOrders: 0
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)

            // Query orders and aggregate payments
            // We need to get actual payments from orders_payments table
            const { data: todayOrders, error: todayError } = await supabase
                .from('orders')
                .select('id')
                .gte('created_at', today.toISOString())
                .neq('payment_status', 'void')

            if (todayError) throw todayError

            // Get payments for today's orders
            const todayOrderIds = todayOrders?.map(o => o.id) || []
            let todayTotal = 0

            if (todayOrderIds.length > 0) {
                const { data: todayPayments } = await supabase
                    .from('orders_payments')
                    .select('value')
                    .in('order_id', todayOrderIds)

                todayTotal = todayPayments?.reduce((sum, p) => sum + (p.value || 0), 0) || 0
            }

            // Yesterday's orders
            const { data: yesterdayOrders, error: yesterdayError } = await supabase
                .from('orders')
                .select('id')
                .gte('created_at', yesterday.toISOString())
                .lt('created_at', today.toISOString())
                .neq('payment_status', 'void')

            if (yesterdayError) throw yesterdayError

            const yesterdayOrderIds = yesterdayOrders?.map(o => o.id) || []
            let yesterdayTotal = 0

            if (yesterdayOrderIds.length > 0) {
                const { data: yesterdayPayments } = await supabase
                    .from('orders_payments')
                    .select('value')
                    .in('order_id', yesterdayOrderIds)

                yesterdayTotal = yesterdayPayments?.reduce((sum, p) => sum + (p.value || 0), 0) || 0
            }

            const percentageChange = yesterdayTotal > 0
                ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
                : 0

            setData({
                today: todayTotal,
                yesterday: yesterdayTotal,
                percentageChange,
                todayOrders: todayOrderIds.length
            })
        } catch (error) {
            console.error('Error fetching transaction data:', error)
        }
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Transactions</CardTitle>
                <DollarSign className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent className="pb-3">
                <div className="text-xl font-bold">{formatCurrency(data.today)}</div>
                <div className="flex items-center text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    {data.percentageChange >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                        <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <span className={data.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(data.percentageChange).toFixed(1)}%
                    </span>
                    <span className="ml-1">from yesterday</span>
                </div>
                <div className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-2">
                    {data.todayOrders} Orders
                </div>
            </CardContent>
        </Card>
    )
}
