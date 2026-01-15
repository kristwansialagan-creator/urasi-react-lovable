import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Table as TableIcon, AlertTriangle, Package, Search } from 'lucide-react'
import { useProducts, useReports } from '@/hooks'
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

interface ProductStock {
    id: string
    name: string
    sku: string | null
    category: string
    quantity: number
    low_quantity: number
    selling_price: number
    stock_value: number
    status: 'ok' | 'low' | 'out'
}

export default function InventoryReportPage() {
    const { products, categories } = useProducts()
    const { getLowStockCount } = useReports()

    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all')
    const [lowStockCount, setLowStockCount] = useState(0)

    useEffect(() => {
        getLowStockCount().then(setLowStockCount)
    }, [getLowStockCount])

    const stockData: ProductStock[] = products.map(p => {
        const stockArr = p.stock as { quantity?: number; low_quantity?: number }[] | undefined
        const stockItem = Array.isArray(stockArr) && stockArr.length > 0 ? stockArr[0] : null
        const quantity = stockItem?.quantity || 0
        const lowQty = stockItem?.low_quantity || 10
        const status = quantity <= 0 ? 'out' : quantity < lowQty ? 'low' : 'ok'

        return {
            id: p.id,
            name: p.name,
            sku: p.sku,
            category: categories.find(c => c.id === p.category_id)?.name || 'Uncategorized',
            quantity,
            low_quantity: lowQty,
            selling_price: p.selling_price,
            stock_value: quantity * p.selling_price,
            status
        }
    })

    const filteredStock = stockData.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const totalValue = stockData.reduce((sum, p) => sum + p.stock_value, 0)
    const totalItems = stockData.reduce((sum, p) => sum + p.quantity, 0)
    const outOfStock = stockData.filter(p => p.status === 'out').length

    const categoryBreakdown = categories.map(cat => {
        const catProducts = stockData.filter(p => p.category === cat.name)
        return {
            name: cat.name,
            count: catProducts.length,
            value: catProducts.reduce((sum, p) => sum + p.stock_value, 0)
        }
    }).filter(c => c.count > 0)

    const categoryChartData = {
        labels: categoryBreakdown.map(c => c.name),
        datasets: [{
            data: categoryBreakdown.map(c => c.value),
            backgroundColor: [
                'rgba(37, 99, 235, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)'
            ]
        }]
    }

    const stockStatusData = {
        labels: ['In Stock', 'Low Stock', 'Out of Stock'],
        datasets: [{
            label: 'Products',
            data: [
                stockData.filter(p => p.status === 'ok').length,
                stockData.filter(p => p.status === 'low').length,
                stockData.filter(p => p.status === 'out').length
            ],
            backgroundColor: [
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)'
            ]
        }]
    }

    const exportCSV = () => {
        const csv = [
            ['SKU', 'Product', 'Category', 'Quantity', 'Low Qty', 'Price', 'Stock Value', 'Status'],
            ...filteredStock.map(p => [
                p.sku || '',
                p.name,
                p.category,
                p.quantity,
                p.low_quantity,
                p.selling_price,
                p.stock_value,
                p.status.toUpperCase()
            ])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
    }

    const exportPDF = () => {
        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Inventory Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #333; }
                    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
                    .stat { padding: 15px; background: #f9f9f9; border-radius: 8px; }
                    .stat-value { font-size: 20px; font-weight: bold; color: #2563eb; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background: #f4f4f4; }
                    .low { background: #fef3c7; }
                    .out { background: #fee2e2; }
                </style>
            </head>
            <body>
                <h1>Inventory Report</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
                
                <div class="stats">
                    <div class="stat"><div>Total Products</div><div class="stat-value">${products.length}</div></div>
                    <div class="stat"><div>Total Items</div><div class="stat-value">${totalItems.toLocaleString()}</div></div>
                    <div class="stat"><div>Stock Value</div><div class="stat-value">${formatCurrency(totalValue)}</div></div>
                    <div class="stat"><div>Low Stock Alerts</div><div class="stat-value">${lowStockCount}</div></div>
                </div>

                <table>
                    <thead>
                        <tr><th>SKU</th><th>Product</th><th>Category</th><th>Qty</th><th>Low Qty</th><th>Value</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        ${filteredStock.map(p => `
                            <tr class="${p.status}">
                                <td>${p.sku || '-'}</td>
                                <td>${p.name}</td>
                                <td>${p.category}</td>
                                <td>${p.quantity}</td>
                                <td>${p.low_quantity}</td>
                                <td>${formatCurrency(p.stock_value)}</td>
                                <td>${p.status.toUpperCase()}</td>
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
                <h1 className="text-3xl font-bold">Inventory Report</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Total Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{products.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Items in Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[hsl(var(--primary))]">
                            {totalItems.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Stock Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(totalValue)}
                        </div>
                    </CardContent>
                </Card>
                <Card className={lowStockCount > 0 ? 'border-yellow-500' : ''}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            Low Stock Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">{outOfStock} out of stock</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Stock by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Doughnut data={categoryChartData} options={{ responsive: true }} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Stock Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Bar data={stockStatusData} options={{ responsive: true }} />
                    </CardContent>
                </Card>
            </div>

            {/* Product Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Product Stock Details</CardTitle>
                    <div className="flex gap-4 mt-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={<Search className="h-4 w-4" />}
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="px-3 py-2 border rounded"
                        >
                            <option value="all">All Status</option>
                            <option value="low">Low Stock</option>
                            <option value="out">Out of Stock</option>
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">SKU</th>
                                    <th className="text-left p-3">Product</th>
                                    <th className="text-left p-3">Category</th>
                                    <th className="text-right p-3">Quantity</th>
                                    <th className="text-right p-3">Low Qty</th>
                                    <th className="text-right p-3">Price</th>
                                    <th className="text-right p-3">Stock Value</th>
                                    <th className="text-center p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStock.map(p => (
                                    <tr key={p.id} className={`border-b ${p.status === 'out' ? 'bg-red-50' : p.status === 'low' ? 'bg-yellow-50' : ''}`}>
                                        <td className="p-3 text-sm">{p.sku || '-'}</td>
                                        <td className="p-3 font-medium">{p.name}</td>
                                        <td className="p-3 text-sm">{p.category}</td>
                                        <td className="p-3 text-right font-bold">{p.quantity}</td>
                                        <td className="p-3 text-right text-sm">{p.low_quantity}</td>
                                        <td className="p-3 text-right">{formatCurrency(p.selling_price)}</td>
                                        <td className="p-3 text-right font-medium">{formatCurrency(p.stock_value)}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${p.status === 'ok' ? 'bg-green-100 text-green-700' :
                                                p.status === 'low' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {p.status === 'ok' ? 'IN STOCK' : p.status === 'low' ? 'LOW' : 'OUT'}
                                            </span>
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
