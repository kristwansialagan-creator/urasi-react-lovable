import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { BarChart3 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

export function OrdersChart() {
    const [data, setData] = useState<{ date: string; total: number; count: number }[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const today = new Date()
            const last7Days = new Date(today)
            last7Days.setDate(today.getDate() - 7)

            const { data: orders, error } = await supabase
                .from('orders')
                .select('total, created_at')
                .gte('created_at', last7Days.toISOString())
                .eq('payment_status', 'paid')

            if (error) throw error

            // Group by date
            const groupedData: { [key: string]: { total: number; count: number } } = {}

            for (let i = 6; i >= 0; i--) {
                const date = new Date(today)
                date.setDate(date.getDate() - i)
                const dateKey = date.toISOString().split('T')[0]
                groupedData[dateKey] = { total: 0, count: 0 }
            }

            orders?.forEach(order => {
                if (!order.created_at) return
                const dateKey = order.created_at.split('T')[0]
                if (groupedData[dateKey]) {
                    groupedData[dateKey].total += order.total ?? 0
                    groupedData[dateKey].count += 1
                }
            })

            const chartData = Object.entries(groupedData).map(([date, data]) => ({
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                total: data.total,
                count: data.count
            }))

            setData(chartData)
        } catch (error) {
            console.error('Error fetching orders chart data:', error)
        }
    }

    const maxValue = Math.max(...data.map(d => d.total), 1)

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales Last 7 Days</CardTitle>
                <BarChart3 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {data.map((item, index) => (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-[hsl(var(--muted-foreground))]">{item.date}</span>
                                <span className="font-medium">{formatCurrency(item.total)}</span>
                            </div>
                            <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[hsl(var(--primary))] rounded-full transition-all"
                                    style={{ width: `${(item.total / maxValue) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.count} orders</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
