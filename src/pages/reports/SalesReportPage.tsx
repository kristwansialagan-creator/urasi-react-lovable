import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Table as TableIcon } from 'lucide-react'
import { useReports, useOrders } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
)

export default function SalesReportPage() {
    const { getSalesStats, getTopProducts, getPaymentBreakdown } = useReports()
    const { orders } = useOrders()

    const [stats, setStats] = useState<{
        today: { orders: number; sales: number }
        week: { orders: number; sales: number }
        month: { orders: number; sales: number }
    }>({
        today: { orders: 0, sales: 0 },
        week: { orders: 0, sales: 0 },
        month: { orders: 0, sales: 0 }
    })
    const [topProducts, setTopProducts] = useState<any[]>([])
    const [paymentBreakdown, setPaymentBreakdown] = useState<any[]>([])
    const [dailyData, setDailyData] = useState<{ date: string; sales: number }[]>([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const salesStats = await getSalesStats()
        setStats(salesStats)

        const products = await getTopProducts(10)
        setTopProducts(products)

        const payments = await getPaymentBreakdown()
        setPaymentBreakdown(payments)

        // Calculate daily sales for last 7 days
        const last7Days = [...Array(7)].map((_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - i))
            return date.toISOString().split('T')[0]
        })

        const dailySales = last7Days.map(date => {
            const dayOrders = orders.filter(o => o.created_at.startsWith(date))
            const sales = dayOrders.reduce((sum, o) => sum + o.total, 0)
            return { date, sales }
        })
        setDailyData(dailySales)
    }

    const exportCSV = () => {
        const csv = [
            ['Product', 'Units Sold', 'Total Sales'],
            ...topProducts.map(p => [p.name, p.total_quantity, p.total_sales])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
    }

    const exportPDF = () => {
        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sales Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #333; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #f4f4f4; }
                    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                    .stat-card { padding: 20px; background: #f9f9f9; border-radius: 8px; }
                    .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
                </style>
            </head>
            <body>
                <h1>Sales Report</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
                
                <div class="stats">
                    <div class="stat-card">
                        <div>Today's Sales</div>
                        <div class="stat-value">${formatCurrency(stats.today.sales)}</div>
                    </div>
                    <div class="stat-card">
                        <div>This Week</div>
                        <div class="stat-value">${formatCurrency(stats.week.sales)}</div>
                    </div>
                    <div class="stat-card">
                        <div>This Month</div>
                        <div class="stat-value">${formatCurrency(stats.month.sales)}</div>
                    </div>
                </div>

                <h2>Top Products</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Units Sold</th>
                            <th>Total Sales</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topProducts.map(p => `
                            <tr>
                                <td>${p.name}</td>
                                <td>${p.total_quantity}</td>
                                <td>${formatCurrency(p.total_sales)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <h2>Payment Methods</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Payment Type</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paymentBreakdown.map(p => `
                            <tr>
                                <td>${p.payment_type}</td>
                                <td>${formatCurrency(p.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `

        const printWindow = window.open('', '', 'width=800,height=600')
        if (printWindow) {
            printWindow.document.write(content)
            printWindow.document.close()
            printWindow.print()
        }
    }

    const dailyChartData = {
        labels: dailyData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [{
            label: 'Daily Sales',
            data: dailyData.map(d => d.sales),
            borderColor: 'rgb(37, 99, 235)',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            tension: 0.4
        }]
    }

    const productChartData = {
        labels: topProducts.slice(0, 5).map(p => p.name),
        datasets: [{
            label: 'Sales',
            data: topProducts.slice(0, 5).map(p => p.total_sales),
            backgroundColor: [
                'rgba(37, 99, 235, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)'
            ]
        }]
    }

    const paymentChartData = {
        labels: paymentBreakdown.map(p => p.payment_type),
        datasets: [{
            data: paymentBreakdown.map(p => p.total),
            backgroundColor: [
                'rgba(37, 99, 235, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)'
            ]
        }]
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Sales Reports</h1>
                <div className="flex gap-2">
                    <Button onClick={exportCSV} variant="outline">
                        <TableIcon className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button onClick={exportPDF}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Today's Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[hsl(var(--primary))]">
                            {formatCurrency(stats.today.sales)}
                        </div>
                        <div className="text-sm text-[hsl(var(--muted-foreground))]">
                            {stats.today.orders} orders
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">This Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[hsl(var(--primary))]">
                            {formatCurrency(stats.week.sales)}
                        </div>
                        <div className="text-sm text-[hsl(var(--muted-foreground))]">
                            {stats.week.orders} orders
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[hsl(var(--primary))]">
                            {formatCurrency(stats.month.sales)}
                        </div>
                        <div className="text-sm text-[hsl(var(--muted-foreground))]">
                            {stats.month.orders} orders
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Sales (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Line data={dailyChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Bar data={productChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Pie data={paymentChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Products Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {topProducts.slice(0, 10).map((product, i) => (
                                <div key={i} className="flex justify-between items-center border-b pb-2">
                                    <div>
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                            {product.total_quantity} units sold
                                        </div>
                                    </div>
                                    <div className="font-bold">
                                        {formatCurrency(product.total_sales)}
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
