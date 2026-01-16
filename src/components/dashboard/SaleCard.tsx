import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export function SaleCard() {
    const [data, setData] = useState({
        thisWeek: 0,
        lastWeek: 0,
        percentageChange: 0
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const today = new Date()
            const thisWeekStart = new Date(today)
            thisWeekStart.setDate(today.getDate() - today.getDay())
            thisWeekStart.setHours(0, 0, 0, 0)

            const lastWeekStart = new Date(thisWeekStart)
            lastWeekStart.setDate(lastWeekStart.getDate() - 7)

            // This week's sales
            const { data: thisWeekData, error: thisWeekError } = await supabase
                .from('orders')
                .select('total')
                .gte('created_at', thisWeekStart.toISOString())
                .eq('payment_status', 'paid')

            if (thisWeekError) throw thisWeekError
            const thisWeekTotal = thisWeekData?.reduce((sum, order) => sum + order.total, 0) || 0

            // Last week's sales
            const { data: lastWeekData, error: lastWeekError } = await supabase
                .from('orders')
                .select('total')
                .gte('created_at', lastWeekStart.toISOString())
                .lt('created_at', thisWeekStart.toISOString())
                .eq('payment_status', 'paid')

            if (lastWeekError) throw lastWeekError
            const lastWeekTotal = lastWeekData?.reduce((sum, order) => sum + order.total, 0) || 0

            const percentageChange = lastWeekTotal > 0
                ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100
                : 0

            setData({
                thisWeek: thisWeekTotal,
                lastWeek: lastWeekTotal,
                percentageChange
            })
        } catch (error) {
            console.error('Error fetching sales data:', error)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Sales</CardTitle>
                <ShoppingCart className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.thisWeek)}</div>
                <div className="flex items-center text-xs text-[hsl(var(--muted-foreground))] mt-2">
                    {data.percentageChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={data.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(data.percentageChange).toFixed(1)}%
                    </span>
                    <span className="ml-1">from last week</span>
                </div>
            </CardContent>
        </Card>
    )
}
