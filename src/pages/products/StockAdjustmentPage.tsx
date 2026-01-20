import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, Search, History, Save, Check, ChevronsUpDown } from 'lucide-react'
import { useStockAdjustment } from '@/hooks/useStockAdjustment'
import { useProducts, useUnits } from '@/hooks'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function StockAdjustmentPage() {
    const { adjustments, loading, adjustStock, fetchAdjustments } = useStockAdjustment()
    const { products, fetchProducts } = useProducts()
    const { units, fetchUnits } = useUnits()

    const [search, setSearch] = useState('')
    const [productSearch, setProductSearch] = useState('')
    const [productPopoverOpen, setProductPopoverOpen] = useState(false)
    const [formData, setFormData] = useState({
        product_id: '', unit_id: '', new_quantity: 0, reason: 'manual_adjustment', description: ''
    })

    useEffect(() => {
        fetchAdjustments()
        fetchProducts()
        fetchUnits()
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

    const selectedProduct = products.find(p => p.id === formData.product_id)
    
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

    // Get units available for the selected product (base on stock)
    const availableUnits = useMemo(() => {
        if (!selectedProduct?.stock) return units
        const stockArr = selectedProduct.stock as { unit_id: string }[]
        const stockUnitIds = stockArr.map(s => s.unit_id)
        // Return all units but prioritize ones that have stock
        return units.sort((a, b) => {
            const aHasStock = stockUnitIds.includes(a.id)
            const bHasStock = stockUnitIds.includes(b.id)
            if (aHasStock && !bHasStock) return -1
            if (!aHasStock && bHasStock) return 1
            return 0
        })
    }, [selectedProduct, units])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Package className="h-8 w-8" />Stock Adjustment</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Products</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{products.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Recent Adjustments</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{adjustments.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Today's Adjustments</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-[hsl(var(--primary))]">{adjustments.filter(a => (a.created_at || '').split('T')[0] === new Date().toISOString().split('T')[0]).length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Units Available</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{units.length}</div></CardContent></Card>
            </div>

            {/* Quick Adjust - Inline */}
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
                                <Command>
                                    <CommandInput 
                                        placeholder="Search product by name, SKU, barcode..." 
                                        value={productSearch}
                                        onValueChange={setProductSearch}
                                    />
                                    <CommandList>
                                        <CommandEmpty>No product found.</CommandEmpty>
                                        <CommandGroup>
                                            {filteredProducts.slice(0, 50).map((product) => (
                                                <CommandItem
                                                    key={product.id}
                                                    value={product.id}
                                                    onSelect={() => {
                                                        setFormData({ ...formData, product_id: product.id, unit_id: '' })
                                                        setProductPopoverOpen(false)
                                                        setProductSearch('')
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            formData.product_id === product.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span>{product.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            SKU: {product.sku || '-'} | Barcode: {product.barcode || '-'}
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
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
                    <div><Label>Current Stock</Label><Input value={currentQty} disabled className="bg-[hsl(var(--muted))]" /></div>
                    <div><Label>New Quantity</Label><Input type="number" value={formData.new_quantity} onChange={e => setFormData({ ...formData, new_quantity: Number(e.target.value) })} /></div>
                    <Button onClick={handleAdjust} disabled={!formData.product_id || !formData.unit_id || loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Adjustment'}
                    </Button>
                </div>
                {formData.product_id && formData.unit_id && (
                    <div className="mt-4 p-4 bg-[hsl(var(--muted))] rounded">
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

            {/* History */}
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Adjustment History</CardTitle>
                <div className="relative max-w-sm mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
            </CardHeader><CardContent>
                    {loading ? <div className="text-center py-8">Loading...</div> : adjustments.length === 0 ? (
                        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No adjustments recorded yet</div>
                    ) : (
                        <table className="w-full"><thead><tr className="border-b"><th className="text-left p-3">Date</th><th className="text-left p-3">Product</th><th className="text-left p-3">Unit</th><th className="text-right p-3">Before</th><th className="text-right p-3">After</th><th className="text-right p-3">Change</th><th className="text-left p-3">Reason</th></tr></thead>
                            <tbody>{adjustments.filter(a => !search || a.product?.name?.toLowerCase().includes(search.toLowerCase())).slice(0, 50).map(a => {
                                const change = (a.after_quantity || 0) - (a.before_quantity || 0)
                                return <tr key={a.id} className="border-b hover:bg-[hsl(var(--muted))]">
                                    <td className="p-3 text-sm">{new Date(a.created_at || '').toLocaleString()}</td>
                                    <td className="p-3"><div className="font-medium">{a.product?.name || 'Unknown'}</div><div className="text-xs text-[hsl(var(--muted-foreground))]">SKU: {a.product?.sku || '-'}</div></td>
                                    <td className="p-3 text-sm">{a.unit?.identifier || '-'}</td>
                                    <td className="p-3 text-right">{a.before_quantity || 0}</td>
                                    <td className="p-3 text-right font-bold">{a.after_quantity || 0}</td>
                                    <td className={`p-3 text-right font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{change >= 0 ? '+' : ''}{change}</td>
                                    <td className="p-3"><span className="px-2 py-1 bg-[hsl(var(--muted))] rounded text-xs">{a.description || 'adjustment'}</span></td>
                                </tr>
                            })}</tbody></table>
                    )}
                </CardContent></Card>
        </div>
    )
}