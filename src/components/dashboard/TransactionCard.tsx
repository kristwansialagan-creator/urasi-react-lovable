import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export function TransactionCard() {
    const [data, setData] = useState({
        today: 0,
        yesterday: 0,
        percentageChange: 0
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

            // Today's transactions
            const { data: todayData, error: todayError } = await supabase
                .from('orders')
                .select('total')
                .gte('created_at', today.toISOString())
                .eq('payment_status', 'paid')

            if (todayError) throw todayError
            const todayTotal = todayData?.reduce((sum, order) => sum + order.total, 0) || 0

            // Yesterday's transactions
            const { data: yesterdayData, error: yesterdayError } = await supabase
                .from('orders')
                .select('total')
                .gte('created_at', yesterday.toISOString())
                .lt('created_at', today.toISOString())
                .eq('payment_status', 'paid')

            if (yesterdayError) throw yesterdayError
            const yesterdayTotal = yesterdayData?.reduce((sum, order) => sum + order.total, 0) || 0

            const percentageChange = yesterdayTotal > 0
                ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
                : 0

            setData({
                today: todayTotal,
                yesterday: yesterdayTotal,
                percentageChange
            })
        } catch (error) {
            console.error('Error fetching transaction data:', error)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Transactions</CardTitle>
                <DollarSign className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.today)}</div>
                <div className="flex items-center text-xs text-[hsl(var(--muted-foreground))] mt-2">
                    {data.percentageChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={data.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(data.percentageChange).toFixed(1)}%
                    </span>
                    <span className="ml-1">from yesterday</span>
                </div>
            </CardContent>
        </Card>
    )
}
