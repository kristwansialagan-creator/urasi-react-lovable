import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Table as TableIcon, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCurrency } from '@/lib/utils'
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

export default function CashFlowReportPage() {
    const { history, getCashFlow } = useTransactions()

    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    })
    const [cashFlow, setCashFlow] = useState({ income: 0, expense: 0, net: 0 })
    const [dailyData, setDailyData] = useState<{ date: string; income: number; expense: number }[]>([])

    useEffect(() => {
        loadData()
    }, [dateRange])

    const loadData = async () => {
        const result = await getCashFlow(dateRange.start, dateRange.end)
        setCashFlow({ income: result.income, expense: result.expense, net: result.net })

        // Group by day
        const grouped: Record<string, { income: number; expense: number }> = {}
        result.transactions.forEach((t: any) => {
            const date = (t.created_at || '').split('T')[0]
            if (!grouped[date]) grouped[date] = { income: 0, expense: 0 }
            if (t.operation === 'credit') grouped[date].income += (t.value || 0)
            else grouped[date].expense += (t.value || 0)
        })

        const days = Object.entries(grouped)
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date))
        setDailyData(days)
    }

    const chartData = {
        labels: dailyData.map(d => d.date),
        datasets: [
            {
                label: 'Income',
                data: dailyData.map(d => d.income),
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                fill: true
            },
            {
                label: 'Expense',
                data: dailyData.map(d => d.expense),
                borderColor: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                fill: true
            }
        ]
    }

    const barChartData = {
        labels: ['Income', 'Expense', 'Net'],
        datasets: [{
            label: 'Amount',
            data: [cashFlow.income, cashFlow.expense, cashFlow.net],
            backgroundColor: [
                'rgba(16, 185, 129, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                cashFlow.net >= 0 ? 'rgba(37, 99, 235, 0.8)' : 'rgba(245, 158, 11, 0.8)'
            ]
        }]
    }

    const exportCSV = () => {
        const csv = [
            ['Date', 'Type', 'Name', 'Amount', 'Status'],
            ...history.map(h => [
                (h.created_at || '').split('T')[0],
                h.operation || '',
                h.name || '',
                h.value || 0,
                h.status || ''
            ])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cashflow-report-${dateRange.start}-to-${dateRange.end}.csv`
        a.click()
    }

    const exportPDF = () => {
        const content = `
            <!DOCTYPE html>
            <html><head><title>Cash Flow Report</title>
            <style>
                body { font-family: Arial; margin: 40px; }
                h1 { color: #333; }
                .stats { display: flex; gap: 20px; margin: 20px 0; }
                .stat { padding: 15px; background: #f9f9f9; border-radius: 8px; flex: 1; }
                .income { color: #10b981; }
                .expense { color: #ef4444; }
                .net { color: #2563eb; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #f4f4f4; }
            </style></head>
            <body>
                <h1>Cash Flow Report</h1>
                <p>Period: ${dateRange.start} to ${dateRange.end}</p>
                <div class="stats">
                    <div class="stat"><div>Total Income</div><div class="income" style="font-size:20px;font-weight:bold">${formatCurrency(cashFlow.income)}</div></div>
                    <div class="stat"><div>Total Expense</div><div class="expense" style="font-size:20px;font-weight:bold">${formatCurrency(cashFlow.expense)}</div></div>
                    <div class="stat"><div>Net Cash Flow</div><div class="net" style="font-size:20px;font-weight:bold">${formatCurrency(cashFlow.net)}</div></div>
                </div>
                <table>
                    <thead><tr><th>Date</th><th>Type</th><th>Name</th><th>Amount</th></tr></thead>
                    <tbody>
                        ${history.map(h => `<tr>
                            <td>${(h.created_at || '').split('T')[0]}</td>
                            <td>${h.operation || ''}</td>
                            <td>${h.name || ''}</td>
                            <td style="color:${h.operation === 'credit' ? '#10b981' : '#ef4444'}">${formatCurrency(h.value || 0)}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </body></html>
        `
        const win = window.open('', '', 'width=900,height=700')
        if (win) { win.document.write(content); win.document.close(); win.print() }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Cash Flow Report</h1>
                <div className="flex gap-2">
                    <Button onClick={exportCSV} variant="outline"><TableIcon className="h-4 w-4 mr-2" />CSV</Button>
                    <Button onClick={exportPDF}><FileText className="h-4 w-4 mr-2" />PDF</Button>
                </div>
            </div>

            {/* Date Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4 items-end">
                        <div><label className="text-sm">Start Date</label>
                            <Input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
                        </div>
                        <div><label className="text-sm">End Date</label>
                            <Input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
                        </div>
                        <Button onClick={loadData}>Apply</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" />Total Income</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(cashFlow.income)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-500" />Total Expense</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(cashFlow.expense)}</div></CardContent>
                </Card>
                <Card className={cashFlow.net >= 0 ? 'border-green-500' : 'border-red-500'}>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4" />Net Cash Flow</CardTitle></CardHeader>
                    <CardContent><div className={`text-2xl font-bold ${cashFlow.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(cashFlow.net)}</div></CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Daily Cash Flow</CardTitle></CardHeader>
                    <CardContent><Line data={chartData} options={{ responsive: true }} /></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                    <CardContent><Bar data={barChartData} options={{ responsive: true }} /></CardContent>
                </Card>
            </div>

            {/* Transaction History */}
            <Card>
                <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
                <CardContent>
                    <table className="w-full">
                        <thead><tr className="border-b"><th className="text-left p-3">Date</th><th className="text-left p-3">Type</th><th className="text-left p-3">Name</th><th className="text-right p-3">Amount</th><th className="text-left p-3">Status</th></tr></thead>
                        <tbody>
                            {history.slice(0, 50).map(h => (
                                <tr key={h.id} className="border-b hover:bg-[hsl(var(--muted))]">
                                    <td className="p-3 text-sm">{(h.created_at || '').split('T')[0]}</td>
                                    <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${h.operation === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{h.operation}</span></td>
                                    <td className="p-3 font-medium">{h.name}</td>
                                    <td className={`p-3 text-right font-bold ${h.operation === 'credit' ? 'text-green-600' : 'text-red-600'}`}>{h.operation === 'credit' ? '+' : '-'}{formatCurrency(h.value || 0)}</td>
                                    <td className="p-3 text-sm">{h.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
