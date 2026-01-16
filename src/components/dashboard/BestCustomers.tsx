import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface TopCustomer {
    id: string
    name: string
    total_spent: number
    order_count: number
}

export function BestCustomers() {
    const [customers, setCustomers] = useState<TopCustomer[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data: orders, error } = await supabase
                .from('orders')
                .select(`
                    total,
                    customer:customers(id, first_name, last_name)
                `)
                .eq('payment_status', 'paid')
                .not('customer_id', 'is', null)

            if (error) throw error

            // Group by customer
            const customerMap: { [key: string]: TopCustomer } = {}

            orders?.forEach(order => {
                if (!order.customer) return
                const customerId = order.customer.id
                if (!customerMap[customerId]) {
                    customerMap[customerId] = {
                        id: customerId,
                        name: `${order.customer.first_name} ${order.customer.last_name}`,
                        total_spent: 0,
                        order_count: 0
                    }
                }
                customerMap[customerId].total_spent += order.total
                customerMap[customerId].order_count += 1
            })

            // Sort by total spent and take top 5
            const topCustomers = Object.values(customerMap)
                .sort((a, b) => b.total_spent - a.total_spent)
                .slice(0, 5)

            setCustomers(topCustomers)
        } catch (error) {
            console.error('Error fetching best customers:', error)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Customers</CardTitle>
                <Users className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent>
                {customers.length === 0 ? (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">No customer data yet</p>
                ) : (
                    <div className="space-y-3">
                        {customers.map((customer, index) => (
                            <div key={customer.id} className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-sm font-medium">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{customer.name}</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                            {customer.order_count} order{customer.order_count !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold">{formatCurrency(customer.total_spent)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
