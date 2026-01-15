import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Table as TableIcon, ShoppingBag } from 'lucide-react'
import { useOrders } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface SoldProduct { id: string; name: string; sku: string | null; quantity: number; revenue: number; orders: number }

export default function SoldStockReportPage() {
    const { orders } = useOrders()
    const [dateRange, setDateRange] = useState({ start: new Date(new Date().setDate(1)).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] })
    const [soldProducts, setSoldProducts] = useState<SoldProduct[]>([])

    useEffect(() => { processData() }, [orders, dateRange])

    const processData = () => {
        const filtered = orders.filter(o => {
            const d = o.created_at.split('T')[0]
            return d >= dateRange.start && d <= dateRange.end && o.payment_status === 'paid'
        })

        const productMap: Record<string, SoldProduct> = {}
        filtered.forEach(o => {
            (o.products || []).forEach((p: any) => {
                if (!productMap[p.product_id]) {
                    productMap[p.product_id] = { id: p.product_id, name: p.name || 'Unknown', sku: p.sku || null, quantity: 0, revenue: 0, orders: 0 }
                }
                productMap[p.product_id].quantity += p.quantity || 1
                productMap[p.product_id].revenue += p.total_price || 0
                productMap[p.product_id].orders++
            })
        })

        const sorted = Object.values(productMap).sort((a, b) => b.quantity - a.quantity)
        setSoldProducts(sorted)
    }

    const totalUnits = soldProducts.reduce((sum, p) => sum + p.quantity, 0)
    const totalRevenue = soldProducts.reduce((sum, p) => sum + p.revenue, 0)
    const uniqueProducts = soldProducts.length

    const chartData = {
        labels: soldProducts.slice(0, 15).map(p => p.name.slice(0, 20)),
        datasets: [{ label: 'Units Sold', data: soldProducts.slice(0, 15).map(p => p.quantity), backgroundColor: 'rgba(37, 99, 235, 0.8)' }]
    }

    const exportCSV = () => {
        const csv = [['SKU', 'Product', 'Units Sold', 'Revenue', 'Orders'], ...soldProducts.map(p => [p.sku || '', p.name, p.quantity, p.revenue, p.orders])].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sold-stock-report.csv'; a.click()
    }

    const exportPDF = () => {
        const html = `<!DOCTYPE html><html><head><title>Sold Stock Report</title><style>body{font-family:Arial;margin:40px}.stats{display:flex;gap:20px;margin:20px 0}.stat{padding:15px;background:#f9f9f9;border-radius:8px;flex:1}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:10px}th{background:#f4f4f4}</style></head><body><h1>📦 Sold Stock Report</h1><p>${dateRange.start} to ${dateRange.end}</p><div class="stats"><div class="stat"><div>Total Units</div><div style="font-size:24px;font-weight:bold">${totalUnits.toLocaleString()}</div></div><div class="stat"><div>Total Revenue</div><div style="font-size:24px;font-weight:bold;color:#2563eb">${formatCurrency(totalRevenue)}</div></div><div class="stat"><div>Unique Products</div><div style="font-size:24px;font-weight:bold">${uniqueProducts}</div></div></div><table><thead><tr><th>SKU</th><th>Product</th><th>Units</th><th>Revenue</th><th>Orders</th></tr></thead><tbody>${soldProducts.map(p => `<tr><td>${p.sku || '-'}</td><td>${p.name}</td><td>${p.quantity}</td><td>${formatCurrency(p.revenue)}</td><td>${p.orders}</td></tr>`).join('')}</tbody></table></body></html>`
        const w = window.open('', '', 'width=900,height=700'); if (w) { w.document.write(html); w.document.close(); w.print() }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><ShoppingBag className="h-8 w-8" />Sold Stock Report</h1>
                <div className="flex gap-2">
                    <Button onClick={exportCSV} variant="outline"><TableIcon className="h-4 w-4 mr-2" />CSV</Button>
                    <Button onClick={exportPDF}><FileText className="h-4 w-4 mr-2" />PDF</Button>
                </div>
            </div>

            <Card><CardContent className="pt-6">
                <div className="flex gap-4 items-end">
                    <div><label className="text-sm">Start</label><Input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} /></div>
                    <div><label className="text-sm">End</label><Input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} /></div>
                    <Button onClick={processData}>Apply</Button>
                </div>
            </CardContent></Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Units Sold</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-[hsl(var(--primary))]">{totalUnits.toLocaleString()}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Unique Products</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{uniqueProducts}</div></CardContent></Card>
            </div>

            <Card><CardHeader><CardTitle>Top Selling Products</CardTitle></CardHeader><CardContent><Bar data={chartData} options={{ responsive: true, indexAxis: 'y' }} /></CardContent></Card>

            <Card><CardHeader><CardTitle>All Sold Products</CardTitle></CardHeader><CardContent>
                <table className="w-full"><thead><tr className="border-b"><th className="text-left p-3">SKU</th><th className="text-left p-3">Product</th><th className="text-right p-3">Units Sold</th><th className="text-right p-3">Revenue</th><th className="text-right p-3">Orders</th><th className="text-right p-3">Avg Price</th></tr></thead>
                    <tbody>{soldProducts.slice(0, 100).map(p => <tr key={p.id} className="border-b hover:bg-[hsl(var(--muted))]">
                        <td className="p-3 font-mono text-sm">{p.sku || '-'}</td>
                        <td className="p-3 font-medium">{p.name}</td>
                        <td className="p-3 text-right font-bold">{p.quantity}</td>
                        <td className="p-3 text-right text-[hsl(var(--primary))]">{formatCurrency(p.revenue)}</td>
                        <td className="p-3 text-right">{p.orders}</td>
                        <td className="p-3 text-right text-sm">{formatCurrency(p.quantity > 0 ? p.revenue / p.quantity : 0)}</td>
                    </tr>)}</tbody></table>
            </CardContent></Card>
        </div>
    )
}
