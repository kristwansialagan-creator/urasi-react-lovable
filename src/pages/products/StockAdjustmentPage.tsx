import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, Search, History, Save, Check, ChevronsUpDown, Plus, AlertTriangle, Calendar, Trash2 } from 'lucide-react'
import { useStockAdjustment } from '@/hooks/useStockAdjustment'
import { useProducts, useUnits } from '@/hooks'
import { useStockBatches } from '@/hooks/useStockBatches'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { format, differenceInDays, parseISO } from 'date-fns'

export default function StockAdjustmentPage() {
    const { adjustments, loading, adjustStock, fetchAdjustments } = useStockAdjustment()
    const { products, fetchProducts } = useProducts()
    const { units, fetchUnits } = useUnits()
    const { batches, loading: batchesLoading, createBatch, deleteBatch, fetchBatches } = useStockBatches()

    const [search, setSearch] = useState('')
    const [productSearch, setProductSearch] = useState('')
    const [productPopoverOpen, setProductPopoverOpen] = useState(false)
    const [formData, setFormData] = useState({
        product_id: '', unit_id: '', new_quantity: 0, reason: 'manual_adjustment', description: ''
    })

    // Batch form state
    const [batchFormData, setBatchFormData] = useState({
        product_id: '',
        unit_id: '',
        batch_number: '',
        expiry_date: '',
        quantity: 0,
        purchase_price: 0,
        notes: ''
    })
    const [batchProductSearch, setBatchProductSearch] = useState('')
    const [batchProductPopoverOpen, setBatchProductPopoverOpen] = useState(false)
    const [batchSaving, setBatchSaving] = useState(false)

    useEffect(() => {
        fetchAdjustments()
        fetchProducts()
        fetchUnits()
        fetchBatches()
    }, [])

    const reasons = [
        { value: 'manual_adjustment', label: 'Manual Adjustment' },
        { value: 'stock_take', label: 'Stock Take' },
        { value: 'damage', label: 'Damaged/Expired' },
        { value: 'theft', label: 'Theft/Loss' },
        { value: 'return', label: 'Customer Return' },
        { value: 'transfer', label: 'Store Transfer' },
        { value: 'correction', label: 'Error Correction' }
    ]

    const handleAdjust = async () => {
        if (!formData.product_id || !formData.unit_id) {
            return alert('Please select product and unit')
        }
        const success = await adjustStock(formData.product_id, formData.unit_id, formData.new_quantity, formData.reason, formData.description)
        if (success) {
            setFormData({ product_id: '', unit_id: '', new_quantity: 0, reason: 'manual_adjustment', description: '' })
            setProductSearch('')
        }
    }

    const handleAddBatch = async () => {
        if (!batchFormData.product_id || !batchFormData.unit_id || !batchFormData.batch_number) {
            return alert('Please fill in product, unit, and batch number')
        }
        
        setBatchSaving(true)
        try {
            const result = await createBatch({
                product_id: batchFormData.product_id,
                unit_id: batchFormData.unit_id,
                batch_number: batchFormData.batch_number,
                expiry_date: batchFormData.expiry_date || null,
                quantity: batchFormData.quantity,
                purchase_price: batchFormData.purchase_price || null,
                notes: batchFormData.notes || null
            })
            
            if (result) {
                setBatchFormData({
                    product_id: '',
                    unit_id: '',
                    batch_number: '',
                    expiry_date: '',
                    quantity: 0,
                    purchase_price: 0,
                    notes: ''
                })
                setBatchProductSearch('')
                fetchBatches()
            }
        } finally {
            setBatchSaving(false)
        }
    }

    const selectedProduct = products.find(p => p.id === formData.product_id)
    const selectedBatchProduct = products.find(p => p.id === batchFormData.product_id)
    
    // Get current stock for the selected product and unit
    const currentQty = useMemo(() => {
        if (!selectedProduct?.stock || !formData.unit_id) return 0
        const stockArr = selectedProduct.stock as { unit_id: string; quantity?: number }[]
        const unitStock = stockArr.find(s => s.unit_id === formData.unit_id)
        return unitStock?.quantity || 0
    }, [selectedProduct, formData.unit_id])

    // Filter products based on search
    const filteredProducts = useMemo(() => {
        if (!productSearch) return products
        const searchLower = productSearch.toLowerCase()
        return products.filter(p => 
            p.name?.toLowerCase().includes(searchLower) || 
            p.sku?.toLowerCase().includes(searchLower) ||
            p.barcode?.toLowerCase().includes(searchLower)
        )
    }, [products, productSearch])

    const filteredBatchProducts = useMemo(() => {
        if (!batchProductSearch) return products
        const searchLower = batchProductSearch.toLowerCase()
        return products.filter(p => 
            p.name?.toLowerCase().includes(searchLower) || 
            p.sku?.toLowerCase().includes(searchLower) ||
            p.barcode?.toLowerCase().includes(searchLower)
        )
    }, [products, batchProductSearch])

    // Get units available for the selected product
    const availableUnits = useMemo(() => {
        if (!selectedProduct?.stock || !Array.isArray(selectedProduct.stock)) return units
        const stockArr = selectedProduct.stock as { unit_id: string }[]
        const stockUnitIds = new Set(stockArr.map(s => s.unit_id))
        const filtered = units.filter(u => stockUnitIds.has(u.id))
        return filtered.length > 0 ? filtered : units
    }, [selectedProduct, units])

    // Helper to get expiry status
    const getExpiryStatus = (expiryDate: string | null) => {
        if (!expiryDate) return { status: 'none', label: 'No Expiry', color: 'secondary' }
        const days = differenceInDays(parseISO(expiryDate), new Date())
        if (days < 0) return { status: 'expired', label: 'Expired', color: 'destructive' }
        if (days <= 30) return { status: 'soon', label: `${days}d left`, color: 'warning' }
        if (days <= 90) return { status: 'ok', label: `${days}d left`, color: 'secondary' }
        return { status: 'good', label: format(parseISO(expiryDate), 'dd/MM/yyyy'), color: 'default' }
    }

    // Group batches by product
    const batchesByProduct = useMemo(() => {
        const grouped: Record<string, typeof batches> = {}
        batches.forEach(batch => {
            const productId = batch.product_id
            if (!grouped[productId]) grouped[productId] = []
            grouped[productId].push(batch)
        })
        return grouped
    }, [batches])

    // Expiring soon batches (within 30 days)
    const expiringSoonBatches = useMemo(() => {
        return batches.filter(b => {
            if (!b.expiry_date || (b.quantity ?? 0) <= 0) return false
            const days = differenceInDays(parseISO(b.expiry_date), new Date())
            return days >= 0 && days <= 30
        })
    }, [batches])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Package className="h-8 w-8" />Stock Adjustment</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Products</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{products.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Stock Batches</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{batches.length}</div></CardContent></Card>
                <Card className={expiringSoonBatches.length > 0 ? 'border-orange-500' : ''}>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">
                        {expiringSoonBatches.length > 0 && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                        Expiring Soon
                    </CardTitle></CardHeader>
                    <CardContent><div className={`text-2xl font-bold ${expiringSoonBatches.length > 0 ? 'text-orange-500' : ''}`}>{expiringSoonBatches.length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Units Available</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{units.length}</div></CardContent></Card>
            </div>

            <Tabs defaultValue="batch" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="batch">Add Stock (Batch)</TabsTrigger>
                    <TabsTrigger value="quick">Quick Adjustment</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Batch Stock Tab */}
                <TabsContent value="batch" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Add Stock with Batch & Expiry
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Product Selection */}
                                <div className="space-y-2">
                                    <Label>Product *</Label>
                                    <Popover open={batchProductPopoverOpen} onOpenChange={setBatchProductPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between font-normal"
                                            >
                                                {selectedBatchProduct ? (
                                                    <span className="truncate">{selectedBatchProduct.name}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">Select product...</span>
                                                )}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0 bg-popover z-50" align="start">
                                            <div className="flex items-center border-b px-3">
                                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                <input
                                                    placeholder="Search by name, SKU, barcode..."
                                                    value={batchProductSearch}
                                                    onChange={(e) => setBatchProductSearch(e.target.value)}
                                                    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                                                />
                                            </div>
                                            <div className="max-h-[200px] overflow-y-auto p-1">
                                                {filteredBatchProducts.length === 0 ? (
                                                    <div className="py-6 text-center text-sm text-muted-foreground">No product found.</div>
                                                ) : (
                                                    filteredBatchProducts.slice(0, 50).map((product) => (
                                                        <div
                                                            key={product.id}
                                                            className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-accent rounded-sm"
                                                            onClick={() => {
                                                                setBatchFormData({ ...batchFormData, product_id: product.id })
                                                                setBatchProductPopoverOpen(false)
                                                                setBatchProductSearch('')
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "h-4 w-4 shrink-0",
                                                                    batchFormData.product_id === product.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm">{product.name}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    SKU: {product.sku || '-'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Unit Selection */}
                                <div className="space-y-2">
                                    <Label>Unit *</Label>
                                    <Select 
                                        value={batchFormData.unit_id} 
                                        onValueChange={(value) => setBatchFormData({ ...batchFormData, unit_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select unit..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover z-50">
                                            {units.map((unit) => (
                                                <SelectItem key={unit.id} value={unit.id}>
                                                    {unit.name || unit.identifier}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Batch Number */}
                                <div className="space-y-2">
                                    <Label>Batch Number *</Label>
                                    <Input
                                        placeholder="e.g., BATCH-2025-001"
                                        value={batchFormData.batch_number}
                                        onChange={(e) => setBatchFormData({ ...batchFormData, batch_number: e.target.value })}
                                    />
                                </div>

                                {/* Expiry Date */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Expiry Date
                                    </Label>
                                    <Input
                                        type="date"
                                        value={batchFormData.expiry_date}
                                        onChange={(e) => setBatchFormData({ ...batchFormData, expiry_date: e.target.value })}
                                    />
                                </div>

                                {/* Quantity */}
                                <div className="space-y-2">
                                    <Label>Quantity *</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={batchFormData.quantity}
                                        onChange={(e) => setBatchFormData({ ...batchFormData, quantity: Number(e.target.value) })}
                                    />
                                </div>

                                {/* Purchase Price */}
                                <div className="space-y-2">
                                    <Label>Purchase Price</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={batchFormData.purchase_price}
                                        onChange={(e) => setBatchFormData({ ...batchFormData, purchase_price: Number(e.target.value) })}
                                    />
                                </div>

                                {/* Notes */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Notes</Label>
                                    <Input
                                        placeholder="Optional notes..."
                                        value={batchFormData.notes}
                                        onChange={(e) => setBatchFormData({ ...batchFormData, notes: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <Button onClick={handleAddBatch} disabled={batchSaving || !batchFormData.product_id || !batchFormData.unit_id || !batchFormData.batch_number}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {batchSaving ? 'Adding...' : 'Add Batch Stock'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Current Batches */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Stock Batches (FEFO Order)</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Stock will be deducted from earliest expiring batches first (First Expired, First Out)
                            </p>
                        </CardHeader>
                        <CardContent>
                            {batchesLoading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : batches.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No stock batches yet. Add your first batch above.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-3">Product</th>
                                                <th className="text-left p-3">Batch</th>
                                                <th className="text-left p-3">Expiry</th>
                                                <th className="text-right p-3">Qty</th>
                                                <th className="text-left p-3">Unit</th>
                                                <th className="text-left p-3">Status</th>
                                                <th className="text-right p-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {batches.map((batch) => {
                                                const expiry = getExpiryStatus(batch.expiry_date)
                                                return (
                                                    <tr key={batch.id} className="border-b hover:bg-muted/50">
                                                        <td className="p-3">
                                                            <div className="font-medium">{batch.product?.name || 'Unknown'}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                SKU: {batch.product?.sku || '-'}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 font-mono text-sm">{batch.batch_number}</td>
                                                        <td className="p-3 text-sm">
                                                            {batch.expiry_date 
                                                                ? format(parseISO(batch.expiry_date), 'dd/MM/yyyy')
                                                                : '-'
                                                            }
                                                        </td>
                                                        <td className="p-3 text-right font-bold">{batch.quantity ?? 0}</td>
                                                        <td className="p-3 text-sm">{batch.unit?.identifier || '-'}</td>
                                                        <td className="p-3">
                                                            <Badge variant={expiry.color as any}>
                                                                {expiry.label}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteBatch(batch.id)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
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
                </TabsContent>

                {/* Quick Adjustment Tab */}
                <TabsContent value="quick">
                    <Card><CardHeader><CardTitle>Quick Stock Adjustment</CardTitle></CardHeader><CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div>
                                <Label>Product</Label>
                                <Popover open={productPopoverOpen} onOpenChange={setProductPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={productPopoverOpen}
                                            className="w-full justify-between font-normal"
                                        >
                                            {selectedProduct ? (
                                                <span className="truncate">{selectedProduct.name}</span>
                                            ) : (
                                                <span className="text-muted-foreground">Select product...</span>
                                            )}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0 bg-popover z-50" align="start">
                                        <div className="flex items-center border-b px-3">
                                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                            <input
                                                placeholder="Search by name, SKU, barcode..."
                                                value={productSearch}
                                                onChange={(e) => setProductSearch(e.target.value)}
                                                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                                            />
                                        </div>
                                        <div className="max-h-[200px] overflow-y-auto p-1">
                                            {filteredProducts.length === 0 ? (
                                                <div className="py-6 text-center text-sm text-muted-foreground">No product found.</div>
                                            ) : (
                                                filteredProducts.slice(0, 50).map((product) => (
                                                    <div
                                                        key={product.id}
                                                        className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-accent rounded-sm"
                                                        onClick={() => {
                                                            setFormData({ ...formData, product_id: product.id, unit_id: '' })
                                                            setProductPopoverOpen(false)
                                                            setProductSearch('')
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "h-4 w-4 shrink-0",
                                                                formData.product_id === product.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
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
                            <div>
                                <Label>Unit</Label>
                                <Select 
                                    value={formData.unit_id} 
                                    onValueChange={(value) => setFormData({ ...formData, unit_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select unit..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover z-50">
                                        {availableUnits.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id}>
                                                {unit.name || unit.identifier} ({unit.identifier})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div><Label>Current Stock</Label><Input value={currentQty} disabled className="bg-muted" /></div>
                            <div><Label>New Quantity</Label><Input type="number" value={formData.new_quantity} onChange={e => setFormData({ ...formData, new_quantity: Number(e.target.value) })} /></div>
                            <Button onClick={handleAdjust} disabled={!formData.product_id || !formData.unit_id || loading}>
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? 'Saving...' : 'Save Adjustment'}
                            </Button>
                        </div>
                        {formData.product_id && formData.unit_id && (
                            <div className="mt-4 p-4 bg-muted rounded">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <span>Adjustment:</span>
                                    <span className={`font-bold text-lg ${formData.new_quantity >= currentQty ? 'text-green-600' : 'text-red-600'}`}>
                                        {formData.new_quantity >= currentQty ? '+' : ''}{formData.new_quantity - currentQty} units
                                    </span>
                                    <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover z-50">
                                            {reasons.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Input placeholder="Note (optional)" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="max-w-xs" />
                                </div>
                            </div>
                        )}
                    </CardContent></Card>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history">
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Adjustment History</CardTitle>
                        <div className="relative max-w-sm mt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                        </div>
                    </CardHeader><CardContent>
                            {loading ? <div className="text-center py-8">Loading...</div> : adjustments.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No adjustments recorded yet</div>
                            ) : (
                                <table className="w-full"><thead><tr className="border-b"><th className="text-left p-3">Date</th><th className="text-left p-3">Product</th><th className="text-left p-3">Unit</th><th className="text-right p-3">Before</th><th className="text-right p-3">After</th><th className="text-right p-3">Change</th><th className="text-left p-3">Reason</th></tr></thead>
                                    <tbody>{adjustments.filter(a => !search || a.product?.name?.toLowerCase().includes(search.toLowerCase())).slice(0, 50).map(a => {
                                        const change = (a.after_quantity || 0) - (a.before_quantity || 0)
                                        return <tr key={a.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3 text-sm">{new Date(a.created_at || '').toLocaleString()}</td>
                                            <td className="p-3"><div className="font-medium">{a.product?.name || 'Unknown'}</div><div className="text-xs text-muted-foreground">SKU: {a.product?.sku || '-'}</div></td>
                                            <td className="p-3 text-sm">{a.unit?.identifier || '-'}</td>
                                            <td className="p-3 text-right">{a.before_quantity || 0}</td>
                                            <td className="p-3 text-right font-bold">{a.after_quantity || 0}</td>
                                            <td className={`p-3 text-right font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{change >= 0 ? '+' : ''}{change}</td>
                                            <td className="p-3"><span className="px-2 py-1 bg-muted rounded text-xs">{a.description || 'adjustment'}</span></td>
                                        </tr>
                                    })}</tbody></table>
                            )}
                        </CardContent></Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
