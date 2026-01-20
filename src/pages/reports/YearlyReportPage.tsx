import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Table as TableIcon, Calendar, TrendingUp } from 'lucide-react'
import { useOrders } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler)

export default function YearlyReportPage() {
    const { orders } = useOrders()
    const [year, setYear] = useState(new Date().getFullYear())
    const [monthlyData, setMonthlyData] = useState<{ month: string; revenue: number; orders: number }[]>([])

    useEffect(() => { processYearlyData() }, [orders, year])

    const processYearlyData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const data = months.map((month, index) => {
            const monthOrders = orders.filter(o => {
                const d = new Date(o.created_at || '')
                return d.getFullYear() === year && d.getMonth() === index && o.payment_status === 'paid'
            })
            return { month, revenue: monthOrders.reduce((sum, o) => sum + (o.total || 0), 0), orders: monthOrders.length }
        })
        setMonthlyData(data)
    }

    const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0)
    const totalOrders = monthlyData.reduce((sum, m) => sum + m.orders, 0)
    const avgMonthly = totalRevenue / 12
    const bestMonth = monthlyData.reduce((best, m) => m.revenue > best.revenue ? m : best, monthlyData[0] || { month: '-', revenue: 0 })

    const revenueChart = {
        labels: monthlyData.map(m => m.month),
        datasets: [{ label: 'Revenue', data: monthlyData.map(m => m.revenue), borderColor: 'rgba(37, 99, 235, 1)', backgroundColor: 'rgba(37, 99, 235, 0.2)', fill: true, tension: 0.4 }]
    }

    const ordersChart = {
        labels: monthlyData.map(m => m.month),
        datasets: [{ label: 'Orders', data: monthlyData.map(m => m.orders), backgroundColor: 'rgba(16, 185, 129, 0.8)' }]
    }

    const exportCSV = () => {
        const csv = [['Month', 'Orders', 'Revenue'], ...monthlyData.map(m => [m.month, m.orders, m.revenue])].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `yearly-report-${year}.csv`; a.click()
    }

    const exportPDF = () => {
        const html = `<!DOCTYPE html><html><head><title>Yearly Report ${year}</title><style>body{font-family:Arial;margin:40px}.header{background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;padding:30px;border-radius:8px;margin-bottom:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:10px}th{background:#f4f4f4}.best{background:#d4edda}</style></head><body><div class="header"><h1>📊 Yearly Report ${year}</h1><p>Total Revenue: ${formatCurrency(totalRevenue)} | Total Orders: ${totalOrders}</p></div><table><thead><tr><th>Month</th><th>Orders</th><th>Revenue</th><th>Avg Order</th></tr></thead><tbody>${monthlyData.map(m => `<tr class="${m.month === bestMonth.month ? 'best' : ''}"><td>${m.month} ${year}</td><td>${m.orders}</td><td>${formatCurrency(m.revenue)}</td><td>${formatCurrency(m.orders > 0 ? m.revenue / m.orders : 0)}</td></tr>`).join('')}<tr style="font-weight:bold;background:#f4f4f4"><td>TOTAL</td><td>${totalOrders}</td><td>${formatCurrency(totalRevenue)}</td><td>${formatCurrency(totalOrders > 0 ? totalRevenue / totalOrders : 0)}</td></tr></tbody></table></body></html>`
        const w = window.open('', '', 'width=900,height=700'); if (w) { w.document.write(html); w.document.close(); w.print() }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Calendar className="h-8 w-8" />Yearly Report</h1>
                <div className="flex gap-2">
                    <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-2 border rounded">
                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <Button onClick={exportCSV} variant="outline"><TableIcon className="h-4 w-4 mr-2" />CSV</Button>
                    <Button onClick={exportPDF}><FileText className="h-4 w-4 mr-2" />PDF</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white"><CardHeader className="pb-2"><CardTitle className="text-sm opacity-80">Total Revenue {year}</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Orders</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{totalOrders}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Average</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(avgMonthly)}</div></CardContent></Card>
                <Card className="border-yellow-500"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-yellow-500" />Best Month</CardTitle></CardHeader><CardContent><div className="text-xl font-bold">{bestMonth?.month}</div><div className="text-sm text-[hsl(var(--muted-foreground))]">{formatCurrency(bestMonth?.revenue || 0)}</div></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle>Monthly Revenue Trend</CardTitle></CardHeader><CardContent><Line data={revenueChart} options={{ responsive: true }} /></CardContent></Card>
                <Card><CardHeader><CardTitle>Orders per Month</CardTitle></CardHeader><CardContent><Bar data={ordersChart} options={{ responsive: true }} /></CardContent></Card>
            </div>

            <Card><CardHeader><CardTitle>Monthly Breakdown</CardTitle></CardHeader><CardContent>
                <table className="w-full"><thead><tr className="border-b"><th className="text-left p-3">Month</th><th className="text-right p-3">Orders</th><th className="text-right p-3">Revenue</th><th className="text-right p-3">Avg Order</th><th className="text-right p-3">Growth</th></tr></thead>
                    <tbody>{monthlyData.map((m, i) => {
                        const prevRev = i > 0 ? monthlyData[i - 1].revenue : 0
                        const growth = prevRev > 0 ? ((m.revenue - prevRev) / prevRev) * 100 : 0
                        return <tr key={m.month} className={`border-b hover:bg-[hsl(var(--muted))] ${m.month === bestMonth.month ? 'bg-yellow-50' : ''}`}>
                            <td className="p-3 font-medium">{m.month} {year}</td>
                            <td className="p-3 text-right">{m.orders}</td>
                            <td className="p-3 text-right font-bold text-[hsl(var(--primary))]">{formatCurrency(m.revenue)}</td>
                            <td className="p-3 text-right text-sm">{formatCurrency(m.orders > 0 ? m.revenue / m.orders : 0)}</td>
                            <td className={`p-3 text-right ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>{i > 0 ? `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%` : '-'}</td>
                        </tr>
                    })}</tbody></table>
            </CardContent></Card>
        </div>
    )
}
