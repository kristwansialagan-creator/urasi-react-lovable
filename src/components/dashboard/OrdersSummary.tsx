import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Receipt } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function OrdersSummary() {
    const [data, setData] = useState({
        total: 0,
        paid: 0,
        unpaid: 0,
        partial: 0,
        void: 0
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data: orders, error } = await supabase
                .from('orders')
                .select('payment_status')

            if (error) throw error

            const summary = {
                total: orders?.length || 0,
                paid: orders?.filter(o => o.payment_status === 'paid').length || 0,
                unpaid: orders?.filter(o => o.payment_status === 'unpaid').length || 0,
                partial: orders?.filter(o => o.payment_status === 'partially_paid').length || 0,
                void: orders?.filter(o => o.payment_status === 'void').length || 0
            }

            setData(summary)
        } catch (error) {
            console.error('Error fetching orders summary:', error)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders Summary</CardTitle>
                <Receipt className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold mb-4">{data.total} Orders</div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-[hsl(var(--muted-foreground))]">Paid:</span>
                        <span className="font-medium text-green-600">{data.paid}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[hsl(var(--muted-foreground))]">Partial:</span>
                        <span className="font-medium text-yellow-600">{data.partial}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[hsl(var(--muted-foreground))]">Unpaid:</span>
                        <span className="font-medium text-red-600">{data.unpaid}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[hsl(var(--muted-foreground))]">Void:</span>
                        <span className="font-medium text-gray-600">{data.void}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
