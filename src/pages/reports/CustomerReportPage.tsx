import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Table as TableIcon, Users, Search, TrendingUp } from 'lucide-react'
import { useCustomers, useReports } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

export default function CustomerReportPage() {
    const { customers, groups } = useCustomers()
    const { getTopCustomers } = useReports()

    const [search, setSearch] = useState('')
    const [topCustomers, setTopCustomers] = useState<any[]>([])

    useEffect(() => {
        getTopCustomers(10).then(setTopCustomers)
    }, [getTopCustomers])

    const totalCustomers = customers.length
    const totalRevenue = customers.reduce((sum, c) => sum + (c.purchases_amount || 0), 0)
    const avgPurchase = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

    const filteredCustomers = customers.filter(c => {
        const name = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase()
        const email = (c.email || '').toLowerCase()
        return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase())
    })

    const groupBreakdown = groups.map(g => {
        const count = customers.filter(c => c.group_id === g.id).length
        return { name: g.name, count }
    }).filter(g => g.count > 0)

    const groupChartData = {
        labels: groupBreakdown.length > 0 ? groupBreakdown.map(g => g.name) : ['No Groups'],
        datasets: [{
            data: groupBreakdown.length > 0 ? groupBreakdown.map(g => g.count) : [totalCustomers],
            backgroundColor: [
                'rgba(37, 99, 235, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)'
            ]
        }]
    }

    const topCustomersChartData = {
        labels: topCustomers.slice(0, 5).map(c => c.name),
        datasets: [{
            label: 'Total Purchases',
            data: topCustomers.slice(0, 5).map(c => c.total_purchases),
            backgroundColor: 'rgba(37, 99, 235, 0.8)'
        }]
    }

    const exportCSV = () => {
        const csv = [
            ['Name', 'Email', 'Phone', 'Group', 'Total Purchases', 'Orders', 'Reward Points'],
            ...filteredCustomers.map(c => [
                `${c.first_name || ''} ${c.last_name || ''}`.trim(),
                c.email || '',
                c.phone || '',
                groups.find(g => g.id === c.group_id)?.name || '-',
                c.purchases_amount || 0,
                c.owed_amount || 0,
                c.reward_system_points || 0
            ])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `customer-report-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
    }

    const exportPDF = () => {
        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Customer Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #333; }
                    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
                    .stat { padding: 15px; background: #f9f9f9; border-radius: 8px; }
                    .stat-value { font-size: 20px; font-weight: bold; color: #2563eb; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background: #f4f4f4; }
                </style>
            </head>
            <body>
                <h1>Customer Report</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
                
                <div class="stats">
                    <div class="stat"><div>Total Customers</div><div class="stat-value">${totalCustomers}</div></div>
                    <div class="stat"><div>Total Revenue</div><div class="stat-value">${formatCurrency(totalRevenue)}</div></div>
                    <div class="stat"><div>Avg Purchase</div><div class="stat-value">${formatCurrency(avgPurchase)}</div></div>
                </div>

                <h2>Top Customers</h2>
                <table>
                    <thead>
                        <tr><th>#</th><th>Name</th><th>Total Purchases</th><th>Orders</th></tr>
                    </thead>
                    <tbody>
                        ${topCustomers.map((c, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${c.name}</td>
                                <td>${formatCurrency(c.total_purchases)}</td>
                                <td>${c.orders_count}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <h2>All Customers</h2>
                <table>
                    <thead>
                        <tr><th>Name</th><th>Email</th><th>Phone</th><th>Group</th><th>Purchases</th></tr>
                    </thead>
                    <tbody>
                        ${filteredCustomers.map(c => `
                            <tr>
                                <td>${`${c.first_name || ''} ${c.last_name || ''}`.trim()}</td>
                                <td>${c.email || '-'}</td>
                                <td>${c.phone || '-'}</td>
                                <td>${groups.find(g => g.id === c.group_id)?.name || '-'}</td>
                                <td>${formatCurrency(c.purchases_amount || 0)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `

        const printWindow = window.open('', '', 'width=900,height=700')
        if (printWindow) {
            printWindow.document.write(content)
            printWindow.document.close()
            printWindow.print()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Customer Report</h1>
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

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Total Customers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[hsl(var(--primary))]">{totalCustomers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Average Purchase</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(avgPurchase)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Customers by Group</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Doughnut data={groupChartData} options={{ responsive: true }} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Customers by Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Bar data={topCustomersChartData} options={{ responsive: true, indexAxis: 'y' }} />
                    </CardContent>
                </Card>
            </div>

            {/* Top Customers Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Top 10 Customers</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-3">#</th>
                                <th className="text-left p-3">Customer</th>
                                <th className="text-right p-3">Total Purchases</th>
                                <th className="text-right p-3">Orders</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topCustomers.map((c, i) => (
                                <tr key={c.id} className="border-b">
                                    <td className="p-3 font-bold">{i + 1}</td>
                                    <td className="p-3 font-medium">{c.name}</td>
                                    <td className="p-3 text-right text-[hsl(var(--primary))] font-bold">
                                        {formatCurrency(c.total_purchases)}
                                    </td>
                                    <td className="p-3 text-right">{c.orders_count} orders</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* All Customers Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Customers</CardTitle>
                    <div className="mt-4">
                        <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Search className="h-4 w-4" />}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Name</th>
                                    <th className="text-left p-3">Email</th>
                                    <th className="text-left p-3">Phone</th>
                                    <th className="text-left p-3">Group</th>
                                    <th className="text-right p-3">Purchases</th>
                                    <th className="text-right p-3">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.slice(0, 50).map(c => (
                                    <tr key={c.id} className="border-b hover:bg-[hsl(var(--muted))]">
                                        <td className="p-3 font-medium">
                                            {`${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unnamed'}
                                        </td>
                                        <td className="p-3 text-sm">{c.email || '-'}</td>
                                        <td className="p-3 text-sm">{c.phone || '-'}</td>
                                        <td className="p-3">
                                            <span className="px-2 py-1 bg-[hsl(var(--muted))] rounded text-xs">
                                                {groups.find(g => g.id === c.group_id)?.name || 'Default'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right font-medium">
                                            {formatCurrency(c.purchases_amount || 0)}
                                        </td>
                                        <td className="p-3 text-right text-[hsl(var(--primary))]">
                                            {c.reward_system_points || 0} pts
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
