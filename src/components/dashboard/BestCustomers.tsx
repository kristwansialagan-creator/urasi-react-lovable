import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface TopCustomer {
    id: string
    name: string
    total_spent: number
    order_count: number
}

export function BestCustomers() {
    const { t } = useLanguage()
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
                        name: `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() || 'Unknown',
                        total_spent: 0,
                        order_count: 0
                    }
                }
                customerMap[customerId].total_spent += order.total ?? 0
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
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.topCustomers')}</CardTitle>
                <Users className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent className="pb-3">
                {customers.length === 0 ? (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('dashboard.noCustomerData')}</p>
                ) : (
                    <div className="space-y-2">
                        {customers.map((customer, index) => (
                            <div key={customer.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-xs font-medium">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium">{customer.name}</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                            {customer.order_count} {t('orders.items').toLowerCase()}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold">{formatCurrency(customer.total_spent)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
