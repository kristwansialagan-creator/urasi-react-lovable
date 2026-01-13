import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, Package, Users, DollarSign, Download, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const salesSummary = [
    { label: 'Today', orders: 48, revenue: 12500000 },
    { label: 'This Week', orders: 245, revenue: 62500000 },
    { label: 'This Month', orders: 1024, revenue: 285000000 },
]

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">View sales and performance reports</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2"><Calendar className="h-4 w-4" />Date Range</Button>
                    <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {salesSummary.map((item, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.label}</p>
                            <p className="text-3xl font-bold mt-2">{formatCurrency(item.revenue)}</p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{item.orders} orders</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Sales Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-[hsl(var(--muted))]/50 rounded-lg">
                            <p className="text-[hsl(var(--muted-foreground))]">Sales Chart Placeholder</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-[hsl(var(--muted))]/50 rounded-lg">
                            <p className="text-[hsl(var(--muted-foreground))]">Revenue Chart Placeholder</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Top Products</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {['Coca Cola 500ml', 'Indomie Goreng', 'Aqua 600ml', 'Chitato Original', 'Teh Botol Sosro'].map((product, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-[hsl(var(--muted))]/50">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                        <span>{product}</span>
                                    </div>
                                    <span className="font-medium">{formatCurrency((100 - i * 15) * 10000)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Top Customers</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {['Sarah Williams', 'Jane Smith', 'John Doe', 'Mike Johnson', 'David Brown'].map((customer, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-[hsl(var(--muted))]/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white text-sm font-semibold">{customer[0]}</div>
                                        <span>{customer}</span>
                                    </div>
                                    <span className="font-medium">{formatCurrency((200 - i * 30) * 10000)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Payment Methods</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[{ method: 'Cash', amount: 8500000, percent: 68 }, { method: 'Card', amount: 2500000, percent: 20 }, { method: 'Account', amount: 1500000, percent: 12 }].map((payment) => (
                                <div key={payment.method} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>{payment.method}</span>
                                        <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-[hsl(var(--muted))]">
                                        <div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${payment.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
