import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Truck, Plus, Package, DollarSign, Search,
    CheckCircle, Clock, XCircle, Eye, X, Check, ChevronsUpDown
} from 'lucide-react'
import { useProcurement } from '@/hooks'
import { useProducts } from '@/hooks'
import { formatCurrency, cn } from '@/lib/utils'

export default function ProcurementPage() {
    const {
        procurements, providers, loading,
        createProcurement, receiveProcurement,
        createProvider
    } = useProcurement()
    const { products } = useProducts()

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showProviderModal, setShowProviderModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [selectedProcurement, setSelectedProcurement] = useState<any>(null)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    // Create procurement form
    const [selectedProvider, setSelectedProvider] = useState('')
    const [procurementProducts, setProcurementProducts] = useState<{
        product_id: string
        name: string
        quantity: number
        purchase_price: number
    }[]>([])

    // Add product form states
    const [showAddProductForm, setShowAddProductForm] = useState(false)
    const [productSearchQuery, setProductSearchQuery] = useState('')
    const [productPopoverOpen, setProductPopoverOpen] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState('')
    const [addProductQty, setAddProductQty] = useState(1)
    const [addProductPrice, setAddProductPrice] = useState(0)

    // New provider form
    const [newProvider, setNewProvider] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    })

    // Filtered products for search
    const filteredProductsForAdd = useMemo(() => {
        if (!productSearchQuery) return products
        const q = productSearchQuery.toLowerCase()
        return products.filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            p.barcode?.toLowerCase().includes(q)
        )
    }, [products, productSearchQuery])

    const selectedProductForAdd = products.find(p => p.id === selectedProductId)

    const filteredProcurements = procurements.filter((p: any) => {
        const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.provider?.name?.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const stats = {
        total: procurements.length,
        pending: procurements.filter((p: any) => p.status === 'pending').length,
        completed: procurements.filter((p: any) => p.status === 'completed').length,
        totalValue: procurements.reduce((sum: any, p: any) => sum + p.total_price, 0)
    }

    const handleCreateProcurement = async () => {
        if (!selectedProvider || procurementProducts.length === 0) {
            alert('Please select provider and add products')
            return
        }

        try {
            const success = await createProcurement({
                provider_id: selectedProvider,
                products: procurementProducts.map(p => ({
                    product_id: p.product_id,
                    quantity: p.quantity,
                    purchase_price: p.purchase_price
                }))
            })

            if (success) {
                setShowCreateModal(false)
                setSelectedProvider('')
                setProcurementProducts([])
            }
        } catch (error) {
            console.error(error)
            alert('Error creating procurement')
        }
    }

    const handleCreateProvider = async () => {
        if (!newProvider.name) {
            alert('Provider name is required')
            return
        }

        const success = await createProvider(newProvider)
        if (success) {
            setShowProviderModal(false)
            setNewProvider({ name: '', email: '', phone: '', address: '' })
        }
    }

    const handleView = (procurement: any) => {
        setSelectedProcurement(procurement)
        setShowViewModal(true)
    }

    const handleAddProduct = () => {
        if (!selectedProductId || addProductQty <= 0) {
            return
        }
        const product = products.find(p => p.id === selectedProductId)
        if (product) {
            setProcurementProducts([...procurementProducts, {
                product_id: selectedProductId,
                name: product.name || 'Unknown',
                quantity: addProductQty,
                purchase_price: addProductPrice
            }])
            // Reset form
            setSelectedProductId('')
            setAddProductQty(1)
            setAddProductPrice(0)
            setProductSearchQuery('')
            setShowAddProductForm(false)
        }
    }

    const handleRemoveProduct = (index: number) => {
        setProcurementProducts(procurementProducts.filter((_, i) => i !== index))
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
            case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />
            default: return <Clock className="h-4 w-4" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Truck className="h-8 w-8" />
                    Procurement
                </h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowProviderModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Provider
                    </Button>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Procurement
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Total Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Total Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[hsl(var(--primary))]">
                            {formatCurrency(stats.totalValue)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                            <Input
                                placeholder="Search procurements..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover z-[150]">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Procurements Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Purchase Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : filteredProcurements.length === 0 ? (
                        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                            No procurements found
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">ID</th>
                                    <th className="text-left p-3">Provider</th>
                                    <th className="text-left p-3">Status</th>
                                    <th className="text-left p-3">Payment</th>
                                    <th className="text-left p-3">Delivery</th>
                                    <th className="text-right p-3">Total</th>
                                    <th className="text-left p-3">Date</th>
                                    <th className="text-center p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProcurements.map((p: any) => (
                                    <tr key={p.id} className="border-b hover:bg-[hsl(var(--muted))]">
                                        <td className="p-3 font-mono text-sm">{p.id.slice(0, 8)}</td>
                                        <td className="p-3 font-medium">{p.provider?.name || '-'}</td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(p.status)}`}>
                                                {getStatusIcon(p.status)}
                                                {p.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${p.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {p.payment_status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${p.delivery_status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {p.delivery_status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right font-bold">{formatCurrency(p.total_price)}</td>
                                        <td className="p-3 text-sm">{new Date(p.created_at).toLocaleDateString()}</td>
                                        <td className="p-3">
                                            <div className="flex justify-center gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => handleView(p)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {p.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            if (confirm('Receive this procurement? Stock will be updated automatically.')) {
                                                                receiveProcurement(p.id)
                                                            }
                                                        }}
                                                    >
                                                        Receive
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            {/* Providers List */}
            <Card>
                <CardHeader>
                    <CardTitle>Providers / Suppliers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {providers.map((p: any) => (
                            <Card key={p.id} className="p-4">
                                <div className="font-bold">{p.name}</div>
                                <div className="text-sm text-[hsl(var(--muted-foreground))]">{p.email || 'No email'}</div>
                                <div className="text-sm">{p.phone || 'No phone'}</div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Create Procurement Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="bg-background border shadow-xl max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>New Procurement Order</DialogTitle>
                        <DialogDescription>Create a new procurement order by selecting provider and adding products</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Provider</Label>
                            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select provider..." />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                    {providers.map((p: any) => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <Label>Products ({procurementProducts.length})</Label>
                                <Button type="button" size="sm" onClick={() => setShowAddProductForm(true)}>
                                    <Plus className="h-4 w-4 mr-1" />Add Product
                                </Button>
                            </div>

                            {/* Add Product Form */}
                            {showAddProductForm && (
                                <div className="border rounded-lg p-4 mb-3 bg-muted/50 space-y-3">
                                    <div>
                                        <Label className="text-sm">Select Product</Label>
                                        <Popover open={productPopoverOpen} onOpenChange={setProductPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full justify-between font-normal mt-1"
                                                >
                                                    {selectedProductForAdd ? (
                                                        <span className="truncate">{selectedProductForAdd.name}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground">Search product...</span>
                                                    )}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[350px] p-0 bg-popover z-50" align="start">
                                                <div className="flex items-center border-b px-3">
                                                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                    <input
                                                        placeholder="Search by name, SKU, barcode..."
                                                        value={productSearchQuery}
                                                        onChange={(e) => setProductSearchQuery(e.target.value)}
                                                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                                                    />
                                                </div>
                                                <div className="max-h-[200px] overflow-y-auto p-1">
                                                    {filteredProductsForAdd.length === 0 ? (
                                                        <div className="py-6 text-center text-sm text-muted-foreground">No product found.</div>
                                                    ) : (
                                                        filteredProductsForAdd.slice(0, 50).map((product) => (
                                                            <div
                                                                key={product.id}
                                                                className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-accent rounded-sm"
                                                                onClick={() => {
                                                                    setSelectedProductId(product.id)
                                                                    setProductPopoverOpen(false)
                                                                    setProductSearchQuery('')
                                                                    // Auto-fill purchase price if available
                                                                    if (product.purchase_price) {
                                                                        setAddProductPrice(product.purchase_price)
                                                                    }
                                                                }}
                                                            >
                                                                <Check className={cn("h-4 w-4 shrink-0", selectedProductId === product.id ? "opacity-100" : "opacity-0")} />
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm">{product.name}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        SKU: {product.sku || '-'} | Barcode: {product.barcode || '-'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-sm">Quantity</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={addProductQty}
                                                onChange={(e) => setAddProductQty(Number(e.target.value))}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm">Purchase Price</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                step={0.01}
                                                value={addProductPrice}
                                                onChange={(e) => setAddProductPrice(Number(e.target.value))}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" size="sm" onClick={() => {
                                            setShowAddProductForm(false)
                                            setSelectedProductId('')
                                            setAddProductQty(1)
                                            setAddProductPrice(0)
                                        }} className="flex-1">Cancel</Button>
                                        <Button size="sm" onClick={handleAddProduct} disabled={!selectedProductId || addProductQty <= 0} className="flex-1">
                                            Add to List
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {procurementProducts.length > 0 && (
                                <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                                    {procurementProducts.map((product, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                            <div>
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Qty: {product.quantity} × {formatCurrency(product.purchase_price)} = {formatCurrency(product.quantity * product.purchase_price)}
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" onClick={() => handleRemoveProduct(index)}>
                                                <X className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="pt-2 border-t font-bold text-right">
                                        Total: {formatCurrency(procurementProducts.reduce((sum, p) => sum + (p.quantity * p.purchase_price), 0))}
                                    </div>
                                </div>
                            )}
                            {procurementProducts.length === 0 && !showAddProductForm && (
                                <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded-lg">
                                    No products added. Click "Add Product" to start.
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleCreateProcurement} className="flex-1" disabled={!selectedProvider || procurementProducts.length === 0}>
                                Create Order
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Provider Modal */}
            <Dialog open={showProviderModal} onOpenChange={setShowProviderModal}>
                <DialogContent className="bg-background border shadow-xl">
                    <DialogHeader>
                        <DialogTitle>New Provider</DialogTitle>
                        <DialogDescription>Add a new provider/supplier to the system</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Name *</Label>
                            <Input
                                value={newProvider.name}
                                onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                                placeholder="Provider name"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={newProvider.email}
                                onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
                                placeholder="provider@example.com"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <Input
                                value={newProvider.phone}
                                onChange={(e) => setNewProvider({ ...newProvider, phone: e.target.value })}
                                placeholder="+62..."
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Address</Label>
                            <Input
                                value={newProvider.address}
                                onChange={(e) => setNewProvider({ ...newProvider, address: e.target.value })}
                                placeholder="Full address"
                                className="mt-1"
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button variant="outline" onClick={() => setShowProviderModal(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleCreateProvider} className="flex-1">
                                Create Provider
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Procurement Modal */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="bg-background border shadow-xl max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Procurement Details</DialogTitle>
                        <DialogDescription>View detailed information about this procurement order</DialogDescription>
                    </DialogHeader>
                    {selectedProcurement && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Order ID</Label>
                                    <p className="font-mono">{selectedProcurement.id?.slice(0, 8)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Provider</Label>
                                    <p className="font-medium">{selectedProcurement.provider?.name || '-'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedProcurement.status)}`}>
                                        {getStatusIcon(selectedProcurement.status)}
                                        {selectedProcurement.status?.toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Payment</Label>
                                    <span className={`px-2 py-1 rounded text-xs ${selectedProcurement.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {selectedProcurement.payment_status}
                                    </span>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Delivery</Label>
                                    <span className={`px-2 py-1 rounded text-xs ${selectedProcurement.delivery_status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {selectedProcurement.delivery_status}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Total Price</Label>
                                    <p className="text-xl font-bold">{formatCurrency(selectedProcurement.total_price)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Order Date</Label>
                                    <p>{new Date(selectedProcurement.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            {selectedProcurement.products && selectedProcurement.products.length > 0 && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">Products</Label>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="text-left p-3 text-sm font-medium">Product</th>
                                                    <th className="text-right p-3 text-sm font-medium">Qty</th>
                                                    <th className="text-right p-3 text-sm font-medium">Price</th>
                                                    <th className="text-right p-3 text-sm font-medium">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedProcurement.products.map((product: any, index: number) => (
                                                    <tr key={index} className="border-t">
                                                        <td className="p-3">{product.product_name || 'Unknown Product'}</td>
                                                        <td className="p-3 text-right">{product.quantity}</td>
                                                        <td className="p-3 text-right">{formatCurrency(product.purchase_price)}</td>
                                                        <td className="p-3 text-right font-medium">{formatCurrency(product.total_price)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setShowViewModal(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
