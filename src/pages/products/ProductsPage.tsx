import { useState, useEffect } from 'react'
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
    Loader2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useProducts } from '@/hooks'

export default function ProductsPage() {
    const { products, loading, error, fetchProducts, deleteProduct } = useProducts()
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (search) {
            const debounce = setTimeout(() => fetchProducts(search), 300)
            return () => clearTimeout(debounce)
        } else {
            fetchProducts()
        }
    }, [search, fetchProducts])

    const getProductStock = (product: typeof products[0]) => {
        const stockItem = product.stock?.[0]
        return stockItem?.quantity || 0
    }

    const getProductStatus = (product: typeof products[0]) => {
        const stock = getProductStock(product)
        const lowQty = product.stock?.[0]?.low_quantity || 10
        if (stock === 0) return 'Out of Stock'
        if (stock < lowQty) return 'Low Stock'
        return 'Available'
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(id)
        }
    }

    // Calculate stats
    const totalProducts = products.length
    const inStock = products.filter(p => getProductStock(p) > 0).length
    const lowStock = products.filter(p => {
        const stock = getProductStock(p)
        const lowQty = p.stock?.[0]?.low_quantity || 10
        return stock > 0 && stock < lowQty
    }).length
    const outOfStock = products.filter(p => getProductStock(p) === 0).length

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
                                <p className="text-2xl font-bold">{totalProducts}</p>
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
                                <p className="text-2xl font-bold">{inStock}</p>
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
                                <p className="text-2xl font-bold">{lowStock}</p>
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
                                <p className="text-2xl font-bold">{outOfStock}</p>
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
                                placeholder="Search products by name, SKU, or barcode..."
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
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-[hsl(var(--destructive))]">
                            {error}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                            No products found. <Link to="/products/create" className="text-[hsl(var(--primary))] underline">Add your first product</Link>
                        </div>
                    ) : (
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
                                    {products.map((product) => {
                                        const stock = getProductStock(product)
                                        const status = getProductStatus(product)
                                        return (
                                            <tr key={product.id} className="border-b hover:bg-[hsl(var(--muted))]/50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                                                            <Package className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                                                        </div>
                                                        <span className="font-medium">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{product.sku || '-'}</td>
                                                <td className="py-3 px-4">{product.category?.name || 'Uncategorized'}</td>
                                                <td className="py-3 px-4 text-right font-medium">{formatCurrency(product.selling_price)}</td>
                                                <td className="py-3 px-4 text-right">{stock}</td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status === 'Available'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : status === 'Low Stock'
                                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                            }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Link to={`/products/edit/${product.id}`}>
                                                            <Button variant="ghost" size="icon">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-[hsl(var(--destructive))]"
                                                            onClick={() => handleDelete(product.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
