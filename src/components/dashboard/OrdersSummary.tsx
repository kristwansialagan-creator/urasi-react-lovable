import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Receipt } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SalesStats {
    today: { orders: number; sales: number }
    week: { orders: number; sales: number }
    month: { orders: number; sales: number }
}

interface OrdersSummaryProps {
    salesStats: SalesStats
}

interface StatusBreakdown {
    paid: number
    unpaid: number
    partial: number
    void: number
}

type TimeframeType = 'today' | 'week' | 'month'

export function OrdersSummary({ salesStats }: OrdersSummaryProps) {
    const [timeframe, setTimeframe] = useState<TimeframeType>('week')
    const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown>({
        paid: 0,
        unpaid: 0,
        partial: 0,
        void: 0
    })

    const fetchStatusBreakdown = async (selectedTimeframe: TimeframeType) => {
        try {
            const now = new Date()
            let startDate: Date

            switch (selectedTimeframe) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                    break
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    break
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                    break
            }

            const { data: orders, error } = await supabase
                .from('orders')
                .select('payment_status')
                .gte('created_at', startDate.toISOString())
                .neq('payment_status', 'void')

            if (error) throw error

            const breakdown = {
                paid: orders?.filter(o => o.payment_status === 'paid').length || 0,
                unpaid: orders?.filter(o => o.payment_status === 'unpaid').length || 0,
                partial: orders?.filter(o => o.payment_status === 'partially_paid').length || 0,
                void: 0 // Excluded voids from the query
            }

            setStatusBreakdown(breakdown)
        } catch (error) {
            console.error('Error fetching status breakdown:', error)
        }
    }

    const handleTimeframeChange = (newTimeframe: TimeframeType) => {
        setTimeframe(newTimeframe)
        fetchStatusBreakdown(newTimeframe)
    }

    // Fetch initial data
    useState(() => {
        fetchStatusBreakdown(timeframe)
    })

    const currentStats = salesStats[timeframe]
    const totalOrders = currentStats.orders

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders Summary</CardTitle>
                <Receipt className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent className="pb-3">
                {/* Timeframe Selector */}
                <div className="flex gap-1 mb-3 bg-muted rounded-lg p-1">
                    <button
                        onClick={() => handleTimeframeChange('today')}
                        className={`flex-1 text-xs px-2 py-1 rounded transition-colors ${timeframe === 'today'
                                ? 'bg-background shadow-sm font-medium'
                                : 'hover:bg-background/50'
                            }`}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => handleTimeframeChange('week')}
                        className={`flex-1 text-xs px-2 py-1 rounded transition-colors ${timeframe === 'week'
                                ? 'bg-background shadow-sm font-medium'
                                : 'hover:bg-background/50'
                            }`}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => handleTimeframeChange('month')}
                        className={`flex-1 text-xs px-2 py-1 rounded transition-colors ${timeframe === 'month'
                                ? 'bg-background shadow-sm font-medium'
                                : 'hover:bg-background/50'
                            }`}
                    >
                        Month
                    </button>
                </div>

                <div className="text-xl font-bold mb-3">{totalOrders} Orders</div>
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-[hsl(var(--muted-foreground))]">Paid:</span>
                        <span className="font-medium text-green-600">{statusBreakdown.paid}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-[hsl(var(--muted-foreground))]">Partial:</span>
                        <span className="font-medium text-yellow-600">{statusBreakdown.partial}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-[hsl(var(--muted-foreground))]">Unpaid:</span>
                        <span className="font-medium text-red-600">{statusBreakdown.unpaid}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
