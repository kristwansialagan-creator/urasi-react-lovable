import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Table as TableIcon, TrendingUp, DollarSign, Percent } from 'lucide-react'
import { useOrders } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

export default function ProfitReportPage() {
    const { orders } = useOrders()

    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    })
    const [profitData, setProfitData] = useState({
        revenue: 0, cost: 0, profit: 0, margin: 0, orders: 0
    })
    const [dailyProfit, setDailyProfit] = useState<{ date: string; revenue: number; cost: number; profit: number }[]>([])

    useEffect(() => {
        calculateProfit()
    }, [orders, dateRange])

    const calculateProfit = () => {
        const filtered = orders.filter(o => {
            const date = (o.created_at || '').split('T')[0]
            return date >= dateRange.start && date <= dateRange.end && o.payment_status === 'paid'
        })

        const revenue = filtered.reduce((sum, o) => sum + (o.total || 0), 0)
        // Estimate cost as 60% of revenue (adjust based on actual cost data)
        const costRatio = 0.6
        const cost = revenue * costRatio
        const profit = revenue - cost
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0

        setProfitData({ revenue, cost, profit, margin, orders: filtered.length })

        // Group by day
        const grouped: Record<string, { revenue: number; cost: number }> = {}
        filtered.forEach(o => {
            const date = (o.created_at || '').split('T')[0]
            if (!grouped[date]) grouped[date] = { revenue: 0, cost: 0 }
            grouped[date].revenue += (o.total || 0)
            grouped[date].cost += (o.total || 0) * costRatio
        })

        const days = Object.entries(grouped)
            .map(([date, data]) => ({ date, ...data, profit: data.revenue - data.cost }))
            .sort((a, b) => a.date.localeCompare(b.date))
        setDailyProfit(days)
    }

    const chartData = {
        labels: dailyProfit.map(d => d.date),
        datasets: [
            { label: 'Revenue', data: dailyProfit.map(d => d.revenue), borderColor: 'rgba(37, 99, 235, 1)', backgroundColor: 'rgba(37, 99, 235, 0.2)', fill: true },
            { label: 'Cost', data: dailyProfit.map(d => d.cost), borderColor: 'rgba(239, 68, 68, 1)', backgroundColor: 'rgba(239, 68, 68, 0.2)', fill: true },
            { label: 'Profit', data: dailyProfit.map(d => d.profit), borderColor: 'rgba(16, 185, 129, 1)', backgroundColor: 'rgba(16, 185, 129, 0.2)', fill: true }
        ]
    }

    const summaryChart = {
        labels: ['Revenue', 'Cost', 'Profit'],
        datasets: [{ data: [profitData.revenue, profitData.cost, profitData.profit], backgroundColor: ['#2563eb', '#ef4444', '#10b981'] }]
    }

    const exportCSV = () => {
        const csv = [['Date', 'Revenue', 'Cost', 'Profit'], ...dailyProfit.map(d => [d.date, d.revenue, d.cost, d.profit])].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `profit-report-${dateRange.start}.csv`; a.click()
    }

    const exportPDF = () => {
        const html = `<!DOCTYPE html><html><head><title>Profit Report</title><style>body{font-family:Arial;margin:40px}h1{color:#333}.stats{display:flex;gap:20px;margin:20px 0}.stat{padding:15px;background:#f9f9f9;border-radius:8px;flex:1}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:10px}th{background:#f4f4f4}</style></head><body><h1>Profit Report</h1><p>${dateRange.start} to ${dateRange.end}</p><div class="stats"><div class="stat"><div>Revenue</div><div style="font-size:20px;color:#2563eb">${formatCurrency(profitData.revenue)}</div></div><div class="stat"><div>Cost</div><div style="font-size:20px;color:#ef4444">${formatCurrency(profitData.cost)}</div></div><div class="stat"><div>Profit</div><div style="font-size:20px;color:#10b981">${formatCurrency(profitData.profit)}</div></div><div class="stat"><div>Margin</div><div style="font-size:20px">${profitData.margin.toFixed(1)}%</div></div></div><table><thead><tr><th>Date</th><th>Revenue</th><th>Cost</th><th>Profit</th></tr></thead><tbody>${dailyProfit.map(d => `<tr><td>${d.date}</td><td>${formatCurrency(d.revenue)}</td><td>${formatCurrency(d.cost)}</td><td>${formatCurrency(d.profit)}</td></tr>`).join('')}</tbody></table></body></html>`
        const w = window.open('', '', 'width=900,height=700'); if (w) { w.document.write(html); w.document.close(); w.print() }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Profit Report</h1>
                <div className="flex gap-2">
                    <Button onClick={exportCSV} variant="outline"><TableIcon className="h-4 w-4 mr-2" />CSV</Button>
                    <Button onClick={exportPDF}><FileText className="h-4 w-4 mr-2" />PDF</Button>
                </div>
            </div>

            <Card><CardContent className="pt-6">
                <div className="flex gap-4 items-end">
                    <div><label className="text-sm">Start</label><Input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} /></div>
                    <div><label className="text-sm">End</label><Input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} /></div>
                    <Button onClick={calculateProfit}>Apply</Button>
                </div>
            </CardContent></Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4" />Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-[hsl(var(--primary))]">{formatCurrency(profitData.revenue)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Cost</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(profitData.cost)}</div></CardContent></Card>
                <Card className="border-green-500"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" />Profit</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(profitData.profit)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Percent className="h-4 w-4" />Margin</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{profitData.margin.toFixed(1)}%</div></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle>Daily Profit Trend</CardTitle></CardHeader><CardContent><Line data={chartData} options={{ responsive: true }} /></CardContent></Card>
                <Card><CardHeader><CardTitle>Summary</CardTitle></CardHeader><CardContent><Bar data={summaryChart} options={{ responsive: true }} /></CardContent></Card>
            </div>

            <Card><CardHeader><CardTitle>Daily Breakdown</CardTitle></CardHeader><CardContent>
                <table className="w-full"><thead><tr className="border-b"><th className="text-left p-3">Date</th><th className="text-right p-3">Revenue</th><th className="text-right p-3">Cost</th><th className="text-right p-3">Profit</th><th className="text-right p-3">Margin</th></tr></thead>
                    <tbody>{dailyProfit.map(d => <tr key={d.date} className="border-b"><td className="p-3">{d.date}</td><td className="p-3 text-right">{formatCurrency(d.revenue)}</td><td className="p-3 text-right text-red-600">{formatCurrency(d.cost)}</td><td className="p-3 text-right text-green-600 font-bold">{formatCurrency(d.profit)}</td><td className="p-3 text-right">{d.revenue > 0 ? ((d.profit / d.revenue) * 100).toFixed(1) : 0}%</td></tr>)}</tbody>
                </table>
            </CardContent></Card>
        </div>
    )
}
