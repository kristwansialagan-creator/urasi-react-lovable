import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, Eye, Printer, RotateCcw, Receipt, DollarSign } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'

const ordersData = [
    { id: 'ORD-240111-0001', customer: 'John Doe', total: 250000, paymentStatus: 'paid', processStatus: 'complete', date: '2024-01-11T10:30:00' },
    { id: 'ORD-240111-0002', customer: 'Jane Smith', total: 175000, paymentStatus: 'paid', processStatus: 'complete', date: '2024-01-11T10:45:00' },
    { id: 'ORD-240111-0003', customer: 'Walk-in', total: 85000, paymentStatus: 'paid', processStatus: 'complete', date: '2024-01-11T11:00:00' },
    { id: 'ORD-240111-0004', customer: 'Mike Johnson', total: 520000, paymentStatus: 'partially_paid', processStatus: 'pending', date: '2024-01-11T11:15:00' },
    { id: 'ORD-240111-0005', customer: 'Walk-in', total: 45000, paymentStatus: 'paid', processStatus: 'complete', date: '2024-01-11T11:30:00' },
    { id: 'ORD-240111-0006', customer: 'Sarah Williams', total: 320000, paymentStatus: 'unpaid', processStatus: 'pending', date: '2024-01-11T12:00:00' },
]

export default function OrdersPage() {
    const [search, setSearch] = useState('')

    const getPaymentStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            partially_paid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        }
        const labels: Record<string, string> = { paid: 'Paid', unpaid: 'Unpaid', partially_paid: 'Partial' }
        return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>
    }

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
                        <div><p className="text-sm text-[hsl(var(--muted-foreground))]">Total Orders</p><p className="text-2xl font-bold">48</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-500/10"><DollarSign className="h-6 w-6 text-green-500" /></div>
                        <div><p className="text-sm text-[hsl(var(--muted-foreground))]">Paid</p><p className="text-2xl font-bold">42</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-yellow-500/10"><Receipt className="h-6 w-6 text-yellow-500" /></div>
                        <div><p className="text-sm text-[hsl(var(--muted-foreground))]">Partial</p><p className="text-2xl font-bold">3</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-red-500/10"><Receipt className="h-6 w-6 text-red-500" /></div>
                        <div><p className="text-sm text-[hsl(var(--muted-foreground))]">Unpaid</p><p className="text-2xl font-bold">3</p></div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1"><Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="h-4 w-4" />} /></div>
                        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />Filter</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>All Orders</CardTitle></CardHeader>
                <CardContent>
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
                                {ordersData.map((order) => (
                                    <tr key={order.id} className="border-b hover:bg-[hsl(var(--muted))]/50">
                                        <td className="py-3 px-4 font-medium">{order.id}</td>
                                        <td className="py-3 px-4">{order.customer}</td>
                                        <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{formatDateTime(order.date)}</td>
                                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(order.total)}</td>
                                        <td className="py-3 px-4">{getPaymentStatusBadge(order.paymentStatus)}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon"><Printer className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon"><RotateCcw className="h-4 w-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
