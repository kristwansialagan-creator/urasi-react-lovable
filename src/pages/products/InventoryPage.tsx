import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Package,
    Search,
    ChevronDown,
    ChevronRight,
    AlertTriangle,
    Clock,
    CheckCircle,
    Boxes,
    AlertCircle
} from 'lucide-react'
import { useProducts } from '@/hooks'
import { useStockBatches } from '@/hooks/useStockBatches'
import { format, parseISO, differenceInDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface BatchWithProduct {
    id: string
    product_id: string
    unit_id: string
    batch_number: string
    expiry_date: string | null
    quantity: number | null
    purchase_price: number | null
    notes: string | null
    created_at: string | null
    product?: { id: string; name: string; sku: string | null } | null
    unit?: { id: string; identifier: string; name: string } | null
}

// Helper function for expiry status
const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return { label: 'No Expiry', color: 'secondary', icon: CheckCircle }
    const days = differenceInDays(parseISO(expiryDate), new Date())
    if (days < 0) return { label: 'Expired', color: 'destructive', icon: AlertCircle }
    if (days <= 30) return { label: `${days}d left`, color: 'warning', icon: AlertTriangle }
    if (days <= 90) return { label: `${days}d left`, color: 'default', icon: Clock }
    return { label: 'Good', color: 'success', icon: CheckCircle }
}

export default function InventoryPage() {
    const { products, categories, fetchProducts, loading: productsLoading } = useProducts()
    const { batches, fetchBatches, loading: batchesLoading } = useStockBatches()

    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [expiryFilter, setExpiryFilter] = useState('all')
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

    useEffect(() => {
        fetchProducts()
        fetchBatches()
    }, [])

    // Group batches by product
    const batchesByProduct = useMemo(() => {
        const grouped: Record<string, BatchWithProduct[]> = {}
        batches.forEach((batch: BatchWithProduct) => {
            if (!grouped[batch.product_id]) {
                grouped[batch.product_id] = []
            }
            grouped[batch.product_id].push(batch)
        })
        return grouped
    }, [batches])

    // Filter products
    const filteredProducts = useMemo(() => {
        let result = products

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase()
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchLower) ||
                p.sku?.toLowerCase().includes(searchLower)
            )
        }

        // Category filter
        if (categoryFilter !== 'all') {
            result = result.filter(p => p.category_id === categoryFilter)
        }

        // Expiry filter
        if (expiryFilter !== 'all') {
            result = result.filter(p => {
                const productBatches = batchesByProduct[p.id] || []
                if (expiryFilter === 'expired') {
                    return productBatches.some(b => {
                        if (!b.expiry_date) return false
                        return differenceInDays(parseISO(b.expiry_date), new Date()) < 0
                    })
                }
                if (expiryFilter === 'expiring') {
                    return productBatches.some(b => {
                        if (!b.expiry_date) return false
                        const days = differenceInDays(parseISO(b.expiry_date), new Date())
                        return days >= 0 && days <= 30
                    })
                }
                return true
            })
        }

        return result
    }, [products, search, categoryFilter, expiryFilter, batchesByProduct])

    // Stats
    const stats = useMemo(() => {
        let totalBatches = 0
        let expiredBatches = 0
        let lowStockProducts = 0
        let expiringBatches = 0

        products.forEach(p => {
            const productBatches = batchesByProduct[p.id] || []
            totalBatches += productBatches.length

            productBatches.forEach(b => {
                if (b.expiry_date) {
                    const days = differenceInDays(parseISO(b.expiry_date), new Date())
                    if (days < 0) expiredBatches++
                    else if (days <= 30) expiringBatches++
                }
            })

            // Check low stock
            const hasLowStock = p.stock?.some(s =>
                s.stock_alert_enabled && s.quantity < s.low_quantity
            )
            if (hasLowStock) lowStockProducts++
        })

        return {
            totalProducts: products.length,
            totalBatches,
            lowStock: lowStockProducts,
            expired: expiredBatches,
            expiring: expiringBatches
        }
    }, [products, batchesByProduct])

    // Toggle product expansion
    const toggleProduct = (productId: string) => {
        setExpandedProducts(prev => {
            const next = new Set(prev)
            if (next.has(productId)) {
                next.delete(productId)
            } else {
                next.add(productId)
            }
            return next
        })
    }

    // Get total stock for a product
    const getTotalStock = (productId: string) => {
        const productBatches = batchesByProduct[productId] || []
        return productBatches.reduce((sum, b) => sum + (b.quantity || 0), 0)
    }

    const loading = productsLoading || batchesLoading

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Boxes className="h-6 w-6" />
                        Inventory
                    </h1>
                    <p className="text-muted-foreground">
                        Detailed inventory view with batch information
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalProducts}</p>
                                <p className="text-xs text-muted-foreground">Total Products</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Boxes className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalBatches}</p>
                                <p className="text-xs text-muted-foreground">Total Batches</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-500/10">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.lowStock}</p>
                                <p className="text-xs text-muted-foreground">Low Stock</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <Clock className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.expiring}</p>
                                <p className="text-xs text-muted-foreground">Expiring Soon</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.expired}</p>
                                <p className="text-xs text-muted-foreground">Expired Batches</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={expiryFilter} onValueChange={setExpiryFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Expiry Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                                <SelectItem value="expiring">Expiring Soon (≤30d)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Product List */}
            <Card>
                <CardHeader>
                    <CardTitle>Products ({filteredProducts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No products found
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredProducts.map(product => {
                                const isExpanded = expandedProducts.has(product.id)
                                const productBatches = batchesByProduct[product.id] || []
                                const totalStock = getTotalStock(product.id)
                                const hasLowStock = product.stock?.some(s =>
                                    s.stock_alert_enabled && s.quantity < s.low_quantity
                                )

                                return (
                                    <div key={product.id} className="border rounded-lg overflow-hidden">
                                        {/* Product Header */}
                                        <button
                                            onClick={() => toggleProduct(product.id)}
                                            className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                            )}
                                            <div className="flex-1 text-left">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{product.name}</span>
                                                    {product.sku && (
                                                        <span className="text-xs text-muted-foreground font-mono">
                                                            ({product.sku})
                                                        </span>
                                                    )}
                                                    {hasLowStock && (
                                                        <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {product.category?.name || 'Uncategorized'} • {productBatches.length} batch(es)
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">{totalStock}</div>
                                                <div className="text-xs text-muted-foreground">Total Stock</div>
                                            </div>
                                        </button>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div className="border-t bg-muted/20 p-4">
                                                {/* Product Description */}
                                                {product.description && (
                                                    <div className="mb-4 p-3 bg-background rounded-lg">
                                                        <p className="text-sm font-medium mb-1">Description</p>
                                                        <p className="text-sm text-muted-foreground">{product.description}</p>
                                                    </div>
                                                )}

                                                {/* Product Info */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div className="p-3 bg-background rounded-lg">
                                                        <p className="text-xs text-muted-foreground">Selling Price</p>
                                                        <p className="font-medium">Rp {product.selling_price?.toLocaleString() || 0}</p>
                                                    </div>
                                                    <div className="p-3 bg-background rounded-lg">
                                                        <p className="text-xs text-muted-foreground">Purchase Price</p>
                                                        <p className="font-medium">Rp {product.purchase_price?.toLocaleString() || 0}</p>
                                                    </div>
                                                    <div className="p-3 bg-background rounded-lg">
                                                        <p className="text-xs text-muted-foreground">Type</p>
                                                        <p className="font-medium capitalize">{product.type || 'Physical'}</p>
                                                    </div>
                                                    <div className="p-3 bg-background rounded-lg">
                                                        <p className="text-xs text-muted-foreground">Status</p>
                                                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                                            {product.status || 'active'}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Batch Table */}
                                                <div className="rounded-lg border overflow-hidden">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-muted">
                                                            <tr>
                                                                <th className="text-left p-3 font-medium">Batch #</th>
                                                                <th className="text-left p-3 font-medium">Date Added</th>
                                                                <th className="text-left p-3 font-medium">Expiry</th>
                                                                <th className="text-left p-3 font-medium">Unit</th>
                                                                <th className="text-right p-3 font-medium">Qty</th>
                                                                <th className="text-right p-3 font-medium">Purchase Price</th>
                                                                <th className="text-left p-3 font-medium">Notes</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {productBatches.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                                                        No batches for this product
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                productBatches.map(batch => {
                                                                    const expiry = getExpiryStatus(batch.expiry_date)
                                                                    const ExpiryIcon = expiry.icon
                                                                    return (
                                                                        <tr key={batch.id} className="border-t hover:bg-muted/30">
                                                                            <td className="p-3 font-mono">{batch.batch_number}</td>
                                                                            <td className="p-3 text-muted-foreground">
                                                                                {batch.created_at
                                                                                    ? format(parseISO(batch.created_at), 'dd/MM/yyyy HH:mm')
                                                                                    : '-'
                                                                                }
                                                                            </td>
                                                                            <td className="p-3">
                                                                                <div className="flex items-center gap-2">
                                                                                    {batch.expiry_date ? (
                                                                                        <>
                                                                                            <span>{format(parseISO(batch.expiry_date), 'dd/MM/yyyy')}</span>
                                                                                            <Badge variant={expiry.color as any} className="text-xs">
                                                                                                {expiry.label}
                                                                                            </Badge>
                                                                                        </>
                                                                                    ) : (
                                                                                        <span className="text-muted-foreground">-</span>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td className="p-3">{batch.unit?.identifier || batch.unit?.name || '-'}</td>
                                                                            <td className="p-3 text-right font-bold">{batch.quantity}</td>
                                                                            <td className="p-3 text-right">
                                                                                {batch.purchase_price
                                                                                    ? `Rp ${batch.purchase_price.toLocaleString()}`
                                                                                    : '-'
                                                                                }
                                                                            </td>
                                                                            <td className="p-3 text-muted-foreground max-w-[200px] truncate">
                                                                                {batch.notes || '-'}
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
