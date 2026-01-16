import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, Eye, Printer, RotateCcw, Receipt, DollarSign, Loader2 } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useOrders } from '@/hooks'

export default function OrdersPage() {
    const navigate = useNavigate()
    const { orders, loading, error, fetchOrders, voidOrder } = useOrders()
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (search) {
            const debounce = setTimeout(() => fetchOrders({ search }), 300)
            return () => clearTimeout(debounce)
        } else {
            fetchOrders()
        }
    }, [search, fetchOrders])

    const getPaymentStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            partially_paid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            void: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
        }
        const labels: Record<string, string> = { paid: 'Paid', unpaid: 'Unpaid', partially_paid: 'Partial', void: 'Void' }
        return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.unpaid}`}>{labels[status] || status}</span>
    }

    const handleVoid = async (id: string) => {
        const reason = prompt('Enter reason for voiding this order:')
        if (reason) {
            await voidOrder(id, reason)
        }
    }

    // Calculate stats
    const totalOrders = orders.length
    const paidOrders = orders.filter(o => o.payment_status === 'paid').length
    const partialOrders = orders.filter(o => o.payment_status === 'partially_paid').length
    const unpaidOrders = orders.filter(o => o.payment_status === 'unpaid').length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage and track all orders</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-500/10"><Receipt className="h-6 w-6 text-blue-500" /></div>
                        <div><p className="text-sm text-[hsl(var(--muted-foreground))]">Total Orders</p><p className="text-2xl font-bold">{totalOrders}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-500/10"><DollarSign className="h-6 w-6 text-green-500" /></div>
                        <div><p className="text-sm text-[hsl(var(--muted-foreground))]">Paid</p><p className="text-2xl font-bold">{paidOrders}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-yellow-500/10"><Receipt className="h-6 w-6 text-yellow-500" /></div>
                        <div><p className="text-sm text-[hsl(var(--muted-foreground))]">Partial</p><p className="text-2xl font-bold">{partialOrders}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-red-500/10"><Receipt className="h-6 w-6 text-red-500" /></div>
                        <div><p className="text-sm text-[hsl(var(--muted-foreground))]">Unpaid</p><p className="text-2xl font-bold">{unpaidOrders}</p></div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1"><Input placeholder="Search orders by code..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="h-4 w-4" />} /></div>
                        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />Filter</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>All Orders</CardTitle></CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-[hsl(var(--destructive))]">{error}</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No orders yet. Start selling from the POS!</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Order ID</th>
                                        <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Customer</th>
                                        <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Date</th>
                                        <th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Total</th>
                                        <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Payment</th>
                                        <th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-[hsl(var(--muted))]/50">
                                            <td className="py-3 px-4 font-medium">{order.code}</td>
                                            <td className="py-3 px-4">
                                                {order.customer
                                                    ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim()
                                                    : 'Walk-in'}
                                            </td>
                                            <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{formatDateTime(order.created_at)}</td>
                                            <td className="py-3 px-4 text-right font-medium">{formatCurrency(order.total)}</td>
                                            <td className="py-3 px-4">{getPaymentStatusBadge(order.payment_status)}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" title="View" onClick={() => navigate(`/app/orders/${order.id}`)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" title="Print">
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                    {order.payment_status !== 'void' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Void"
                                                            onClick={() => handleVoid(order.id)}
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
