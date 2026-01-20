import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { BarChart3 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

export function OrdersChart() {
    const { t, language } = useLanguage()
    const [data, setData] = useState<{ date: string; total: number; count: number }[]>([])

    useEffect(() => {
        fetchData()
    }, [language])

    const fetchData = async () => {
        try {
            const today = new Date()
            const last7Days = new Date(today)
            last7Days.setDate(today.getDate() - 7)
            last7Days.setHours(0, 0, 0, 0)

            // Get orders from last 7 days (exclude void)
            const { data: orders, error } = await supabase
                .from('orders')
                .select('id, created_at')
                .gte('created_at', last7Days.toISOString())
                .neq('payment_status', 'void')

            if (error) throw error

            // Get all order IDs
            const orderIds = orders?.map(o => o.id) || []

            // Get payments for these orders
            let paymentsMap = new Map<string, number>()
            if (orderIds.length > 0) {
                const { data: payments } = await supabase
                    .from('orders_payments')
                    .select('order_id, value')
                    .in('order_id', orderIds)

                payments?.forEach(p => {
                    const current = paymentsMap.get(p.order_id!) || 0
                    paymentsMap.set(p.order_id!, current + (p.value || 0))
                })
            }

            // Group by local date
            const groupedData: { [key: string]: { total: number; count: number } } = {}

            // Initialize last 7 days with 0 using local date
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today)
                date.setDate(date.getDate() - i)
                const dateKey = date.toLocaleDateString('en-CA') // YYYY-MM-DD local
                groupedData[dateKey] = { total: 0, count: 0 }
            }

            orders?.forEach(order => {
                if (!order.created_at) return
                // Use local date for grouping
                const orderDate = new Date(order.created_at)
                const dateKey = orderDate.toLocaleDateString('en-CA')
                if (groupedData[dateKey]) {
                    const revenue = paymentsMap.get(order.id) || 0
                    groupedData[dateKey].total += revenue
                    groupedData[dateKey].count += 1
                }
            })

            const chartData = Object.entries(groupedData).map(([date, data]) => ({
                date: new Date(date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' }),
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
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.salesLast7Days')}</CardTitle>
                <BarChart3 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent className="pb-3">
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {data.map((item, index) => (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-[hsl(var(--muted-foreground))]">{item.date}</span>
                                <span className="font-medium">{formatCurrency(item.total)}</span>
                            </div>
                            <div className="h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[hsl(var(--primary))] rounded-full transition-all"
                                    style={{ width: `${(item.total / maxValue) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.count} {t('orders.items').toLowerCase()}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
