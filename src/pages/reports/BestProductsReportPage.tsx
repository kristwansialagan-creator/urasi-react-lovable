import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Table as TableIcon, Trophy } from 'lucide-react'
import { useReports } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function BestProductsReportPage() {
    const { getTopProducts } = useReports()
    const [topProducts, setTopProducts] = useState<any[]>([])
    const [limit, setLimit] = useState(20)

    useEffect(() => { loadData() }, [limit])

    const loadData = async () => {
        const data = await getTopProducts(limit)
        setTopProducts(data)
    }

    const totalRevenue = topProducts.reduce((sum, p) => sum + p.total_sales, 0)
    const totalUnits = topProducts.reduce((sum, p) => sum + p.quantity_sold, 0)

    const chartData = {
        labels: topProducts.slice(0, 10).map(p => p.name.slice(0, 20)),
        datasets: [{ label: 'Revenue', data: topProducts.slice(0, 10).map(p => p.total_sales), backgroundColor: 'rgba(37, 99, 235, 0.8)' }]
    }

    const quantityChart = {
        labels: topProducts.slice(0, 10).map(p => p.name.slice(0, 20)),
        datasets: [{ label: 'Units Sold', data: topProducts.slice(0, 10).map(p => p.quantity_sold), backgroundColor: 'rgba(16, 185, 129, 0.8)' }]
    }

    const exportCSV = () => {
        const csv = [['Rank', 'Product', 'Units Sold', 'Revenue', 'Avg Price'], ...topProducts.map((p, i) => [i + 1, p.name, p.quantity_sold, p.total_sales, p.quantity_sold > 0 ? (p.total_sales / p.quantity_sold).toFixed(0) : 0])].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'best-products-report.csv'; a.click()
    }

    const exportPDF = () => {
        const html = `<!DOCTYPE html><html><head><title>Best Products Report</title><style>body{font-family:Arial;margin:40px}.gold{background:linear-gradient(135deg,#ffd700,#ffb800);color:#000;padding:20px;border-radius:8px;margin:20px 0}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:10px}th{background:#f4f4f4}.rank{font-size:24px;font-weight:bold}</style></head><body><h1>🏆 Best Products Report</h1><p>Top ${limit} products by revenue</p><div class="gold"><h2>🥇 #1 Best Seller: ${topProducts[0]?.name || 'N/A'}</h2><p>Revenue: ${formatCurrency(topProducts[0]?.total_sales || 0)} | Units: ${topProducts[0]?.quantity_sold || 0}</p></div><table><thead><tr><th>Rank</th><th>Product</th><th>Units</th><th>Revenue</th><th>%</th></tr></thead><tbody>${topProducts.map((p, i) => `<tr><td class="rank">${i + 1}</td><td>${p.name}</td><td>${p.quantity_sold}</td><td>${formatCurrency(p.total_sales)}</td><td>${((p.total_sales / totalRevenue) * 100).toFixed(1)}%</td></tr>`).join('')}</tbody></table></body></html>`
        const w = window.open('', '', 'width=900,height=700'); if (w) { w.document.write(html); w.document.close(); w.print() }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Trophy className="h-8 w-8 text-yellow-500" />Best Products Report</h1>
                <div className="flex gap-2">
                    <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="px-3 py-2 border rounded">
                        <option value={10}>Top 10</option><option value={20}>Top 20</option><option value={50}>Top 50</option><option value={100}>Top 100</option>
                    </select>
                    <Button onClick={exportCSV} variant="outline"><TableIcon className="h-4 w-4 mr-2" />CSV</Button>
                    <Button onClick={exportPDF}><FileText className="h-4 w-4 mr-2" />PDF</Button>
                </div>
            </div>

            {topProducts[0] && (
                <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="text-6xl">🥇</div>
                            <div>
                                <div className="text-sm opacity-80">Best Seller</div>
                                <div className="text-2xl font-bold">{topProducts[0].name}</div>
                                <div className="flex gap-4 mt-2">
                                    <span className="font-bold">{formatCurrency(topProducts[0].total_sales)}</span>
                                    <span>{topProducts[0].quantity_sold} units sold</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Revenue (Top {limit})</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-[hsl(var(--primary))]">{formatCurrency(totalRevenue)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Units Sold</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{totalUnits.toLocaleString()}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Average per Product</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(topProducts.length > 0 ? totalRevenue / topProducts.length : 0)}</div></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle>Revenue by Product</CardTitle></CardHeader><CardContent><Bar data={chartData} options={{ responsive: true, indexAxis: 'y' }} /></CardContent></Card>
                <Card><CardHeader><CardTitle>Units Sold by Product</CardTitle></CardHeader><CardContent><Bar data={quantityChart} options={{ responsive: true, indexAxis: 'y' }} /></CardContent></Card>
            </div>

            <Card><CardHeader><CardTitle>Product Ranking</CardTitle></CardHeader><CardContent>
                <table className="w-full"><thead><tr className="border-b"><th className="text-center p-3 w-16">Rank</th><th className="text-left p-3">Product</th><th className="text-right p-3">Units Sold</th><th className="text-right p-3">Revenue</th><th className="text-right p-3">Avg Price</th><th className="text-right p-3">Share</th></tr></thead>
                    <tbody>{topProducts.map((p, i) => <tr key={p.id} className={`border-b hover:bg-[hsl(var(--muted))] ${i < 3 ? 'bg-yellow-50' : ''}`}>
                        <td className="p-3 text-center"><span className={`text-2xl ${i === 0 ? '' : i === 1 ? 'opacity-70' : i === 2 ? 'opacity-50' : 'text-sm'}`}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span></td>
                        <td className="p-3 font-medium">{p.name}</td>
                        <td className="p-3 text-right">{p.quantity_sold}</td>
                        <td className="p-3 text-right font-bold text-[hsl(var(--primary))]">{formatCurrency(p.total_sales)}</td>
                        <td className="p-3 text-right text-sm">{formatCurrency(p.quantity_sold > 0 ? p.total_sales / p.quantity_sold : 0)}</td>
                        <td className="p-3 text-right"><div className="flex items-center justify-end gap-2"><div className="w-16 h-2 bg-[hsl(var(--muted))] rounded"><div className="h-2 bg-[hsl(var(--primary))] rounded" style={{ width: `${(p.total_sales / totalRevenue) * 100}%` }}></div></div><span className="text-sm">{((p.total_sales / totalRevenue) * 100).toFixed(1)}%</span></div></td>
                    </tr>)}</tbody></table>
            </CardContent></Card>
        </div>
    )
}
