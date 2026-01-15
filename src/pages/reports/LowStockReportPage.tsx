import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Table as TableIcon, AlertTriangle } from 'lucide-react'
import { useProducts } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface LowStockProduct {
    id: string; name: string; sku: string | null; category: string
    quantity: number; low_quantity: number; selling_price: number
}

export default function LowStockReportPage() {
    const { products, categories } = useProducts()
    const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
    const [outOfStock, setOutOfStock] = useState<LowStockProduct[]>([])

    useEffect(() => { processStock() }, [products])

    const processStock = () => {
        const processed = products.map(p => {
            const stockArr = p.stock as { quantity?: number; low_quantity?: number }[] | undefined
            const stock = Array.isArray(stockArr) && stockArr.length > 0 ? stockArr[0] : null
            return {
                id: p.id, name: p.name, sku: p.sku,
                category: categories.find(c => c.id === p.category_id)?.name || 'Uncategorized',
                quantity: stock?.quantity || 0,
                low_quantity: stock?.low_quantity || 10,
                selling_price: p.selling_price
            }
        })
        setLowStockProducts(processed.filter(p => p.quantity > 0 && p.quantity <= p.low_quantity))
        setOutOfStock(processed.filter(p => p.quantity <= 0))
    }

    const totalLowStock = lowStockProducts.length
    const totalOutOfStock = outOfStock.length
    const potentialLoss = outOfStock.reduce((sum, p) => sum + p.selling_price * 10, 0) // Assumed 10 units could have been sold

    const chartData = {
        labels: [...lowStockProducts.slice(0, 10).map(p => p.name.slice(0, 15))],
        datasets: [{
            label: 'Current Stock',
            data: lowStockProducts.slice(0, 10).map(p => p.quantity),
            backgroundColor: 'rgba(245, 158, 11, 0.8)'
        }, {
            label: 'Low Threshold',
            data: lowStockProducts.slice(0, 10).map(p => p.low_quantity),
            backgroundColor: 'rgba(239, 68, 68, 0.4)'
        }]
    }

    const exportCSV = () => {
        const all = [...outOfStock, ...lowStockProducts]
        const csv = [['SKU', 'Product', 'Category', 'Stock', 'Low Threshold', 'Status', 'Price'], ...all.map(p => [p.sku || '', p.name, p.category, p.quantity, p.low_quantity, p.quantity <= 0 ? 'OUT OF STOCK' : 'LOW STOCK', p.selling_price])].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'low-stock-report.csv'; a.click()
    }

    const exportPDF = () => {
        const all = [...outOfStock, ...lowStockProducts]
        const html = `<!DOCTYPE html><html><head><title>Low Stock Report</title><style>body{font-family:Arial;margin:40px}.alert{padding:15px;background:#fef3c7;border-radius:8px;margin:20px 0}.danger{background:#fee2e2}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px}th{background:#f4f4f4}.out{background:#fee2e2}.low{background:#fef3c7}</style></head><body><h1>⚠️ Low Stock Report</h1><p>Generated: ${new Date().toLocaleString()}</p><div class="alert danger"><strong>Out of Stock: ${totalOutOfStock} products</strong></div><div class="alert"><strong>Low Stock: ${totalLowStock} products</strong></div><table><thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Stock</th><th>Threshold</th><th>Status</th></tr></thead><tbody>${all.map(p => `<tr class="${p.quantity <= 0 ? 'out' : 'low'}"><td>${p.sku || '-'}</td><td>${p.name}</td><td>${p.category}</td><td>${p.quantity}</td><td>${p.low_quantity}</td><td>${p.quantity <= 0 ? 'OUT' : 'LOW'}</td></tr>`).join('')}</tbody></table></body></html>`
        const w = window.open('', '', 'width=900,height=700'); if (w) { w.document.write(html); w.document.close(); w.print() }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><AlertTriangle className="h-8 w-8 text-yellow-500" />Low Stock Report</h1>
                <div className="flex gap-2">
                    <Button onClick={exportCSV} variant="outline"><TableIcon className="h-4 w-4 mr-2" />CSV</Button>
                    <Button onClick={exportPDF}><FileText className="h-4 w-4 mr-2" />PDF</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-red-500"><CardHeader className="pb-2"><CardTitle className="text-sm text-red-500">⚠️ Out of Stock</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-red-600">{totalOutOfStock}</div><div className="text-xs text-[hsl(var(--muted-foreground))]">products need restocking</div></CardContent></Card>
                <Card className="border-yellow-500"><CardHeader className="pb-2"><CardTitle className="text-sm text-yellow-600">⚡ Low Stock</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-yellow-600">{totalLowStock}</div><div className="text-xs text-[hsl(var(--muted-foreground))]">products below threshold</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Potential Lost Sales</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-[hsl(var(--primary))]">{formatCurrency(potentialLoss)}</div><div className="text-xs text-[hsl(var(--muted-foreground))]">if out-of-stock items were available</div></CardContent></Card>
            </div>

            {lowStockProducts.length > 0 && (
                <Card><CardHeader><CardTitle>Stock Level Comparison</CardTitle></CardHeader><CardContent><Bar data={chartData} options={{ responsive: true, indexAxis: 'y' }} /></CardContent></Card>
            )}

            {outOfStock.length > 0 && (
                <Card className="border-red-300"><CardHeader><CardTitle className="text-red-600">🚨 Out of Stock Products</CardTitle></CardHeader><CardContent>
                    <table className="w-full"><thead><tr className="border-b bg-red-50"><th className="text-left p-3">SKU</th><th className="text-left p-3">Product</th><th className="text-left p-3">Category</th><th className="text-right p-3">Price</th><th className="text-center p-3">Action</th></tr></thead>
                        <tbody>{outOfStock.map(p => <tr key={p.id} className="border-b bg-red-50/30 hover:bg-red-50"><td className="p-3 font-mono text-sm">{p.sku || '-'}</td><td className="p-3 font-medium">{p.name}</td><td className="p-3 text-sm">{p.category}</td><td className="p-3 text-right">{formatCurrency(p.selling_price)}</td><td className="p-3 text-center"><Button size="sm" variant="destructive">Restock</Button></td></tr>)}</tbody>
                    </table>
                </CardContent></Card>
            )}

            {lowStockProducts.length > 0 && (
                <Card className="border-yellow-300"><CardHeader><CardTitle className="text-yellow-600">⚠️ Low Stock Products</CardTitle></CardHeader><CardContent>
                    <table className="w-full"><thead><tr className="border-b bg-yellow-50"><th className="text-left p-3">SKU</th><th className="text-left p-3">Product</th><th className="text-left p-3">Category</th><th className="text-right p-3">Current</th><th className="text-right p-3">Threshold</th><th className="text-right p-3">Need</th></tr></thead>
                        <tbody>{lowStockProducts.map(p => <tr key={p.id} className="border-b bg-yellow-50/30 hover:bg-yellow-50"><td className="p-3 font-mono text-sm">{p.sku || '-'}</td><td className="p-3 font-medium">{p.name}</td><td className="p-3 text-sm">{p.category}</td><td className="p-3 text-right font-bold text-yellow-600">{p.quantity}</td><td className="p-3 text-right text-sm">{p.low_quantity}</td><td className="p-3 text-right text-red-600 font-bold">+{p.low_quantity - p.quantity}</td></tr>)}</tbody>
                    </table>
                </CardContent></Card>
            )}
        </div>
    )
}
