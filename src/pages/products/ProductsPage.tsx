import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
import { formatCurrency, getStorageUrl } from '@/lib/utils'
import { useProducts, useCategories } from '@/hooks'
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export default function ProductsPage() {
    const { products, loading, error, fetchProducts, deleteProduct } = useProducts()
    const { categories } = useCategories()
    const [searchParams] = useSearchParams()
    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [categoryFilter, setCategoryFilter] = useState('none')
    const [categorySearch, setCategorySearch] = useState('')

    // Product Detail Dialog State
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

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

    // Delete dialog state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [deletingProduct, setDeletingProduct] = useState<{ id: string, name: string } | null>(null)

    const handleDeleteClick = (product: typeof products[0]) => {
        setDeletingProduct({ id: product.id, name: product.name })
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (deletingProduct) {
            await deleteProduct(deletingProduct.id)
            setIsDeleteDialogOpen(false)
            setDeletingProduct(null)
        }
    }

    // Filter products by category
    const filteredProducts = useMemo(() => {
        if (!categoryFilter || categoryFilter === 'none') return products
        return products.filter(p => p.category_id === categoryFilter)
    }, [products, categoryFilter])

    // Calculate stats
    const totalProducts = filteredProducts.length
    const inStock = filteredProducts.filter(p => getProductStock(p) > 0).length
    const lowStock = filteredProducts.filter(p => {
        const stock = getProductStock(p)
        const lowQty = p.stock?.[0]?.low_quantity || 10
        return stock > 0 && stock < lowQty
    }).length
    const outOfStock = filteredProducts.filter(p => getProductStock(p) === 0).length

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
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[200px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border border-border shadow-lg max-h-[300px] z-[150]">
                                {/* Search Input */}
                                <div className="p-2 border-b sticky top-0 bg-popover z-10">
                                    <Input
                                        placeholder="Search categories..."
                                        value={categorySearch}
                                        onChange={(e) => setCategorySearch(e.target.value)}
                                        className="h-8 text-sm"
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </div>

                                <SelectItem value="none" className="font-medium">All Categories</SelectItem>

                                {categories
                                    .filter(cat => !cat.parent_id)
                                    .filter(parent => {
                                        // Filter by search term
                                        if (!categorySearch) return true
                                        const searchLower = categorySearch.toLowerCase()
                                        const parentMatch = parent.name.toLowerCase().includes(searchLower)
                                        const childMatch = categories
                                            .filter(c => c.parent_id === parent.id)
                                            .some(child => child.name.toLowerCase().includes(searchLower))
                                        return parentMatch || childMatch
                                    })
                                    .map((parent) => {
                                        const children = categories
                                            .filter(c => c.parent_id === parent.id)
                                            .filter(child => {
                                                if (!categorySearch) return true
                                                return child.name.toLowerCase().includes(categorySearch.toLowerCase())
                                            })

                                        if (children.length === 0) {
                                            // Parent with no children - selectable
                                            return (
                                                <SelectItem key={parent.id} value={parent.id} className="font-medium">
                                                    {parent.name}
                                                </SelectItem>
                                            )
                                        }

                                        // Parent with children - use SelectGroup
                                        return (
                                            <SelectGroup key={parent.id}>
                                                <SelectLabel className="text-sm font-semibold text-foreground px-2 py-1.5">
                                                    {parent.name}
                                                </SelectLabel>
                                                {children.map(child => (
                                                    <SelectItem
                                                        key={child.id}
                                                        value={child.id}
                                                        className="pl-6 text-sm text-muted-foreground"
                                                    >
                                                        {child.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        )
                                    })}
                            </SelectContent>
                        </Select>
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
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                            {categoryFilter ? 'No products found in this category.' : 'No products found. '}
                            {!categoryFilter && <Link to="/products/create" className="text-[hsl(var(--primary))] underline">Add your first product</Link>}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))] w-16">#</th>
                                        <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Product</th>
                                        <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">SKU</th>
                                        <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Category</th>
                                        <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Price</th>
                                        <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Stock</th>
                                        <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Status</th>
                                        <th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product, index) => {
                                        const stock = getProductStock(product)
                                        const status = getProductStatus(product)
                                        return (
                                            <tr key={product.id} className="border-b hover:bg-[hsl(var(--muted))]/50">
                                                <td className="py-3 px-4 text-muted-foreground">{index + 1}</td>
                                                <td className="py-3 px-4">
                                                    <span className="font-medium">{product.name}</span>
                                                </td>
                                                <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{product.sku || '-'}</td>
                                                <td className="py-3 px-4">{product.category?.name || 'Uncategorized'}</td>
                                                <td className="py-3 px-4 font-medium">{formatCurrency(product.selling_price)}</td>
                                                <td className="py-3 px-4">{stock}</td>
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
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"
                                                            onClick={() => {
                                                                setSelectedProduct(product)
                                                                setIsDetailOpen(true)
                                                            }}
                                                        >
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
                                                            onClick={() => handleDeleteClick(product)}
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

            {/* Product Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white">
                    <DialogHeader>
                        <DialogTitle>Product Details</DialogTitle>
                        <DialogDescription>
                            Complete information for {selectedProduct?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedProduct && (
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="col-span-2 flex justify-center mb-4">
                                <div className="w-48 h-48 rounded-lg bg-muted flex items-center justify-center border-2 border-border overflow-hidden">
                                    {selectedProduct.thumbnail?.slug ? (
                                        <img
                                            src={getStorageUrl(selectedProduct.thumbnail.slug) || '/placeholder.svg'}
                                            alt={selectedProduct.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder.svg'
                                            }}
                                        />
                                    ) : (
                                        <Package className="h-16 w-16 text-muted-foreground" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Product Name</span>
                                <p className="text-sm font-medium">{selectedProduct.name}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Category</span>
                                <Badge variant="outline">{selectedProduct.category?.name || 'Uncategorized'}</Badge>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase">SKU</span>
                                <p className="text-sm font-mono">{selectedProduct.sku || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Barcode</span>
                                <p className="text-sm font-mono">{selectedProduct.barcode || '-'}</p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Selling Price</span>
                                <p className="text-sm font-bold text-green-600">{formatCurrency(selectedProduct.selling_price)}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Initial Purchase Price</span>
                                <p className="text-sm font-medium">{formatCurrency(selectedProduct.purchase_price)}</p>
                            </div>

                            {/* New Fields */}
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Manufacturer</span>
                                <p className="text-sm">{selectedProduct.manufacturer_name || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Country of Origin</span>
                                <p className="text-sm">{selectedProduct.country_of_origin || '-'}</p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Stock Status</span>
                                <Badge className={selectedProduct.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {selectedProduct.status}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Stock Management</span>
                                <p className="text-sm">{selectedProduct.stock_management ? 'Enabled' : 'Disabled'}</p>
                            </div>

                            {selectedProduct.description && (
                                <div className="col-span-2 space-y-1 mt-2 p-3 bg-muted/20 rounded-md">
                                    <span className="text-xs font-medium text-muted-foreground uppercase">Description</span>
                                    <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px] bg-white">
                    <DialogHeader>
                        <DialogTitle>Hapus Produk</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus "{deletingProduct?.name}"? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>Hapus</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
