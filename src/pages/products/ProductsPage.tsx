import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Search,
    Plus,
    Filter,
    Edit,
    Trash2,
    Eye,
    Package,
    Download,
    Upload,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Mock products data
const productsData = [
    { id: '1', name: 'Coca Cola 500ml', sku: 'CC500', category: 'Beverages', price: 8000, stock: 150, status: 'Available' },
    { id: '2', name: 'Indomie Goreng', sku: 'IG001', category: 'Food', price: 3500, stock: 12, status: 'Low Stock' },
    { id: '3', name: 'Aqua 600ml', sku: 'AQ600', category: 'Beverages', price: 4000, stock: 8, status: 'Low Stock' },
    { id: '4', name: 'Chitato Original 68g', sku: 'CH068', category: 'Snacks', price: 12000, stock: 85, status: 'Available' },
    { id: '5', name: 'Teh Botol Sosro 450ml', sku: 'TBS45', category: 'Beverages', price: 5000, stock: 200, status: 'Available' },
    { id: '6', name: 'Pocari Sweat 500ml', sku: 'PS500', category: 'Beverages', price: 7500, stock: 5, status: 'Low Stock' },
    { id: '7', name: 'Oreo Original 133g', sku: 'OR133', category: 'Snacks', price: 10000, stock: 45, status: 'Available' },
    { id: '8', name: 'Roti Tawar Sari Roti', sku: 'RTSR', category: 'Bakery', price: 15000, stock: 30, status: 'Available' },
]

export default function ProductsPage() {
    const [search, setSearch] = useState('')

    const filteredProducts = productsData.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Products</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">
                        Manage your product inventory
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Import
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Link to="/products/create">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Product
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-blue-500/10">
                                <Package className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Products</p>
                                <p className="text-2xl font-bold">256</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-green-500/10">
                                <Package className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">In Stock</p>
                                <p className="text-2xl font-bold">230</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-yellow-500/10">
                                <Package className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">Low Stock</p>
                                <p className="text-2xl font-bold">18</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-red-500/10">
                                <Package className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">Out of Stock</p>
                                <p className="text-2xl font-bold">8</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search products by name or SKU..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={<Search className="h-4 w-4" />}
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Product</th>
                                    <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">SKU</th>
                                    <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Category</th>
                                    <th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Price</th>
                                    <th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Stock</th>
                                    <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Status</th>
                                    <th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="border-b hover:bg-[hsl(var(--muted))]/50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                                                    <Package className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                                                </div>
                                                <span className="font-medium">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{product.sku}</td>
                                        <td className="py-3 px-4">{product.category}</td>
                                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(product.price)}</td>
                                        <td className="py-3 px-4 text-right">{product.stock}</td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.status === 'Available'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }`}
                                            >
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-[hsl(var(--destructive))]">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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
