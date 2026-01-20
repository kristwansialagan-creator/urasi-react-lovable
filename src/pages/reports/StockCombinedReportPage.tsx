import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Table as TableIcon, Package, TrendingUp } from 'lucide-react'
import { useProducts, useOrders } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler)

interface StockData { id: string; name: string; sku: string | null; category: string; currentStock: number; sold: number; incoming: number; value: number }

export default function StockCombinedReportPage() {
    const { products, categories } = useProducts()
    const { orders } = useOrders()
    const [stockData, setStockData] = useState<StockData[]>([])

    useEffect(() => { processData() }, [products, orders])

    const processData = () => {
        const soldMap: Record<string, number> = {}
        orders.filter(o => o.payment_status === 'paid').forEach(o => {
            (o.products || []).forEach((p: any) => {
                soldMap[p.product_id] = (soldMap[p.product_id] || 0) + (p.quantity || 1)
            })
        })

        const data = products.map(p => {
            const stockArr = p.stock as { quantity?: number }[] | undefined
            const stock = Array.isArray(stockArr) && stockArr.length > 0 ? stockArr[0] : null
            const currentStock = stock?.quantity || 0
            const sold = soldMap[p.id] || 0
            return {
                id: p.id, name: p.name, sku: p.sku,
                category: categories.find(c => c.id === p.category_id)?.name || 'Uncategorized',
                currentStock, sold, incoming: 0,
                value: currentStock * p.selling_price
            }
        })
        setStockData(data.sort((a, b) => b.value - a.value))
    }

    const totalStock = stockData.reduce((sum, p) => sum + p.currentStock, 0)
    const totalValue = stockData.reduce((sum, p) => sum + p.value, 0)
    const totalSold = stockData.reduce((sum, p) => sum + p.sold, 0)
    const turnoverRate = totalStock > 0 ? (totalSold / totalStock) * 100 : 0

    const chartData = {
        labels: stockData.slice(0, 10).map(p => p.name.slice(0, 20)),
        datasets: [
            { label: 'Current Stock', data: stockData.slice(0, 10).map(p => p.currentStock), backgroundColor: 'rgba(37, 99, 235, 0.8)' },
            { label: 'Sold', data: stockData.slice(0, 10).map(p => p.sold), backgroundColor: 'rgba(16, 185, 129, 0.8)' }
        ]
    }

    const categoryBreakdown = categories.map(cat => {
        const catProducts = stockData.filter(p => p.category === cat.name)
        return { name: cat.name, stock: catProducts.reduce((sum, p) => sum + p.currentStock, 0), value: catProducts.reduce((sum, p) => sum + p.value, 0) }
    }).filter(c => c.stock > 0).sort((a, b) => b.value - a.value)

    const exportCSV = () => {
        const csv = [['SKU', 'Product', 'Category', 'Current Stock', 'Sold', 'Stock Value'], ...stockData.map(p => [p.sku || '', p.name, p.category, p.currentStock, p.sold, p.value])].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'stock-combined-report.csv'; a.click()
    }

    const exportPDF = () => {
        const html = `<!DOCTYPE html><html><head><title>Stock Combined Report</title><style>body{font-family:Arial;margin:40px}.stats{display:flex;gap:20px;margin:20px 0}.stat{padding:20px;background:#f9f9f9;border-radius:8px;flex:1;text-align:center}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f4f4f4}</style></head><body><h1>📊 Stock Combined Report</h1><div class="stats"><div class="stat"><div style="font-size:12px">Total Stock</div><div style="font-size:24px;font-weight:bold">${totalStock.toLocaleString()}</div></div><div class="stat"><div style="font-size:12px">Stock Value</div><div style="font-size:24px;font-weight:bold;color:#2563eb">${formatCurrency(totalValue)}</div></div><div class="stat"><div style="font-size:12px">Total Sold</div><div style="font-size:24px;font-weight:bold;color:#10b981">${totalSold.toLocaleString()}</div></div><div class="stat"><div style="font-size:12px">Turnover</div><div style="font-size:24px;font-weight:bold">${turnoverRate.toFixed(1)}%</div></div></div><table><thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Sold</th><th>Value</th></tr></thead><tbody>${stockData.slice(0, 50).map(p => `<tr><td>${p.name}</td><td>${p.category}</td><td>${p.currentStock}</td><td>${p.sold}</td><td>${formatCurrency(p.value)}</td></tr>`).join('')}</tbody></table></body></html>`
        const w = window.open('', '', 'width=900,height=700'); if (w) { w.document.write(html); w.document.close(); w.print() }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Package className="h-8 w-8" />Stock Combined Report</h1>
                <div className="flex gap-2">
                    <Button onClick={exportCSV} variant="outline"><TableIcon className="h-4 w-4 mr-2" />CSV</Button>
                    <Button onClick={exportPDF}><FileText className="h-4 w-4 mr-2" />PDF</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4" />Total Stock</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{totalStock.toLocaleString()}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Stock Value</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-[hsl(var(--primary))]">{formatCurrency(totalValue)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" />Total Sold</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{totalSold.toLocaleString()}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Turnover Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{turnoverRate.toFixed(1)}%</div></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle>Stock vs Sold (Top 10)</CardTitle></CardHeader><CardContent><Bar data={chartData} options={{ responsive: true }} /></CardContent></Card>
                <Card><CardHeader><CardTitle>Stock by Category</CardTitle></CardHeader><CardContent>
                    <div className="space-y-4">{categoryBreakdown.map(c => <div key={c.name} className="flex items-center gap-4">
                        <div className="w-32 truncate">{c.name}</div>
                        <div className="flex-1 h-4 bg-[hsl(var(--muted))] rounded"><div className="h-4 bg-[hsl(var(--primary))] rounded" style={{ width: `${(c.value / totalValue) * 100}%` }}></div></div>
                        <div className="w-24 text-right text-sm">{formatCurrency(c.value)}</div>
                    </div>)}</div>
                </CardContent></Card>
            </div>

            <Card><CardHeader><CardTitle>Complete Stock Overview</CardTitle></CardHeader><CardContent>
                <table className="w-full"><thead><tr className="border-b"><th className="text-left p-3">SKU</th><th className="text-left p-3">Product</th><th className="text-left p-3">Category</th><th className="text-right p-3">Current</th><th className="text-right p-3">Sold</th><th className="text-right p-3">Value</th><th className="text-right p-3">Turnover</th></tr></thead>
                    <tbody>{stockData.slice(0, 100).map(p => {
                        const turn = p.currentStock > 0 ? (p.sold / p.currentStock) * 100 : 0
                        return <tr key={p.id} className="border-b hover:bg-[hsl(var(--muted))]">
                            <td className="p-3 font-mono text-sm">{p.sku || '-'}</td>
                            <td className="p-3 font-medium">{p.name}</td>
                            <td className="p-3 text-sm">{p.category}</td>
                            <td className="p-3 text-right font-bold">{p.currentStock}</td>
                            <td className="p-3 text-right text-green-600">{p.sold}</td>
                            <td className="p-3 text-right text-[hsl(var(--primary))]">{formatCurrency(p.value)}</td>
                            <td className={`p-3 text-right ${turn > 100 ? 'text-green-600' : turn < 20 ? 'text-red-600' : ''}`}>{turn.toFixed(1)}%</td>
                        </tr>
                    })}</tbody></table>
            </CardContent></Card>
        </div>
    )
}
