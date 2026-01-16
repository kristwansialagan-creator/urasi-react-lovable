import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Table as TableIcon, CreditCard } from 'lucide-react'
import { useReports } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function PaymentTypesReportPage() {
    const { getPaymentBreakdown } = useReports()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_dateRange, _setDateRange] = useState({
        start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    })
    const [paymentData, setPaymentData] = useState<{ label: string; total: number; count: number }[]>([])

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        const data = await getPaymentBreakdown()
        setPaymentData(data)
    }

    const totalAmount = paymentData.reduce((sum, p) => sum + p.total, 0)
    const totalTransactions = paymentData.reduce((sum, p) => sum + p.count, 0)

    const colors = [
        'rgba(37, 99, 235, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(236, 72, 153, 0.8)'
    ]

    const pieChartData = {
        labels: paymentData.map(p => p.label),
        datasets: [{ data: paymentData.map(p => p.total), backgroundColor: colors }]
    }

    const barChartData = {
        labels: paymentData.map(p => p.label),
        datasets: [
            { label: 'Amount', data: paymentData.map(p => p.total), backgroundColor: 'rgba(37, 99, 235, 0.8)' },
            { label: 'Transactions', data: paymentData.map(p => p.count * 1000), backgroundColor: 'rgba(16, 185, 129, 0.8)' }
        ]
    }

    const exportCSV = () => {
        const csv = [['Payment Type', 'Amount', 'Transactions', 'Percentage'], ...paymentData.map(p => [p.label, p.total, p.count, ((p.total / totalAmount) * 100).toFixed(1) + '%'])].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `payment-types-report.csv`; a.click()
    }

    const exportPDF = () => {
        const html = `<!DOCTYPE html><html><head><title>Payment Types Report</title><style>body{font-family:Arial;margin:40px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:10px}th{background:#f4f4f4}.total{font-weight:bold;background:#e8e8e8}</style></head><body><h1>Payment Types Report</h1><p>Generated: ${new Date().toLocaleString()}</p><table><thead><tr><th>Payment Type</th><th>Amount</th><th>Transactions</th><th>Percentage</th></tr></thead><tbody>${paymentData.map(p => `<tr><td>${p.label}</td><td>${formatCurrency(p.total)}</td><td>${p.count}</td><td>${((p.total / totalAmount) * 100).toFixed(1)}%</td></tr>`).join('')}<tr class="total"><td>TOTAL</td><td>${formatCurrency(totalAmount)}</td><td>${totalTransactions}</td><td>100%</td></tr></tbody></table></body></html>`
        const w = window.open('', '', 'width=900,height=700'); if (w) { w.document.write(html); w.document.close(); w.print() }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><CreditCard className="h-8 w-8" />Payment Types Report</h1>
                <div className="flex gap-2">
                    <Button onClick={exportCSV} variant="outline"><TableIcon className="h-4 w-4 mr-2" />CSV</Button>
                    <Button onClick={exportPDF}><FileText className="h-4 w-4 mr-2" />PDF</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-[hsl(var(--primary))]">{formatCurrency(totalAmount)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Payment Methods</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{paymentData.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Transactions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{totalTransactions}</div></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle>Payment Distribution</CardTitle></CardHeader><CardContent><Pie data={pieChartData} options={{ responsive: true }} /></CardContent></Card>
                <Card><CardHeader><CardTitle>Comparison</CardTitle></CardHeader><CardContent><Bar data={barChartData} options={{ responsive: true }} /></CardContent></Card>
            </div>

            <Card><CardHeader><CardTitle>Payment Type Details</CardTitle></CardHeader><CardContent>
                <table className="w-full"><thead><tr className="border-b"><th className="text-left p-3">Payment Type</th><th className="text-right p-3">Amount</th><th className="text-right p-3">Transactions</th><th className="text-right p-3">Avg per Transaction</th><th className="text-right p-3">Percentage</th></tr></thead>
                    <tbody>
                        {paymentData.map((p, i) => <tr key={i} className="border-b hover:bg-[hsl(var(--muted))]"><td className="p-3 font-medium">{p.label}</td><td className="p-3 text-right font-bold">{formatCurrency(p.total)}</td><td className="p-3 text-right">{p.count}</td><td className="p-3 text-right">{formatCurrency(p.count > 0 ? p.total / p.count : 0)}</td><td className="p-3 text-right"><span className="px-2 py-1 bg-[hsl(var(--muted))] rounded text-sm">{((p.total / totalAmount) * 100).toFixed(1)}%</span></td></tr>)}
                        <tr className="border-t-2 bg-[hsl(var(--muted))]"><td className="p-3 font-bold">TOTAL</td><td className="p-3 text-right font-bold text-[hsl(var(--primary))]">{formatCurrency(totalAmount)}</td><td className="p-3 text-right font-bold">{totalTransactions}</td><td className="p-3 text-right font-bold">{formatCurrency(totalTransactions > 0 ? totalAmount / totalTransactions : 0)}</td><td className="p-3 text-right font-bold">100%</td></tr>
                    </tbody></table>
            </CardContent></Card>
        </div>
    )
}
