import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, Search, History, Save } from 'lucide-react'
import { useStockAdjustment } from '@/hooks/useStockAdjustment'
import { useProducts } from '@/hooks'

export default function StockAdjustmentPage() {
    const { adjustments, loading, adjustStock, fetchAdjustments } = useStockAdjustment()
    const { products } = useProducts()

    // Mock units for now - should come from useUnits hook
    const units = [{ id: '1', name: 'Piece', identifier: 'pcs' }, { id: '2', name: 'Box', identifier: 'box' }]
    const [search, setSearch] = useState('')
    const [formData, setFormData] = useState({
        product_id: '', unit_id: '', new_quantity: 0, reason: 'manual_adjustment', description: ''
    })

    useEffect(() => { fetchAdjustments() }, [])

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
        }
    }

    const selectedProduct = products.find(p => p.id === formData.product_id)
    const currentStock = selectedProduct?.stock
    const stockArr = currentStock as { quantity?: number }[] | undefined
    const currentQty = Array.isArray(stockArr) && stockArr.length > 0 ? stockArr[0]?.quantity || 0 : 0

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
                    <div><Label>Product</Label>
                        <select value={formData.product_id} onChange={e => setFormData({ ...formData, product_id: e.target.value })} className="w-full px-3 py-2 border rounded">
                            <option value="">Select product...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku || '-'})</option>)}
                        </select>
                    </div>
                    <div><Label>Unit</Label>
                        <select value={formData.unit_id} onChange={e => setFormData({ ...formData, unit_id: e.target.value })} className="w-full px-3 py-2 border rounded">
                            <option value="">Select unit...</option>
                            {units.map((u: { id: string; name: string; identifier: string }) => <option key={u.id} value={u.id}>{u.name} ({u.identifier})</option>)}
                        </select>
                    </div>
                    <div><Label>Current Stock</Label><Input value={currentQty} disabled className="bg-[hsl(var(--muted))]" /></div>
                    <div><Label>New Quantity</Label><Input type="number" value={formData.new_quantity} onChange={e => setFormData({ ...formData, new_quantity: Number(e.target.value) })} /></div>
                    <Button onClick={handleAdjust} disabled={!formData.product_id}><Save className="h-4 w-4 mr-2" />Save Adjustment</Button>
                </div>
                {formData.product_id && (
                    <div className="mt-4 p-4 bg-[hsl(var(--muted))] rounded">
                        <div className="flex items-center gap-4">
                            <span>Adjustment:</span>
                            <span className={`font-bold text-lg ${formData.new_quantity >= currentQty ? 'text-green-600' : 'text-red-600'}`}>
                                {formData.new_quantity >= currentQty ? '+' : ''}{formData.new_quantity - currentQty} units
                            </span>
                            <select value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} className="px-3 py-1 border rounded text-sm">
                                {reasons.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                            <Input placeholder="Note (optional)" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="max-w-xs" />
                        </div>
                    </div>
                )}
            </CardContent></Card>

            {/* History */}
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Adjustment History</CardTitle>
                <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} icon={<Search className="h-4 w-4" />} className="max-w-sm mt-2" />
            </CardHeader><CardContent>
                    {loading ? <div className="text-center py-8">Loading...</div> : adjustments.length === 0 ? (
                        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No adjustments recorded yet</div>
                    ) : (
                        <table className="w-full"><thead><tr className="border-b"><th className="text-left p-3">Date</th><th className="text-left p-3">Product</th><th className="text-right p-3">Previous</th><th className="text-right p-3">New</th><th className="text-right p-3">Change</th><th className="text-left p-3">Reason</th></tr></thead>
                            <tbody>{adjustments.filter(a => !search || a.product?.name?.toLowerCase().includes(search.toLowerCase())).slice(0, 50).map(a => {
                                const change = (a.quantity || 0) - (a.previous_quantity || 0)
                                return <tr key={a.id} className="border-b hover:bg-[hsl(var(--muted))]">
                                    <td className="p-3 text-sm">{new Date(a.created_at || '').toLocaleString()}</td>
                                    <td className="p-3"><div className="font-medium">{a.product?.name || 'Unknown'}</div><div className="text-xs text-[hsl(var(--muted-foreground))]">SKU: {a.product?.sku || '-'}</div></td>
                                    <td className="p-3 text-right">{a.previous_quantity || 0}</td>
                                    <td className="p-3 text-right font-bold">{a.quantity || 0}</td>
                                    <td className={`p-3 text-right font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{change >= 0 ? '+' : ''}{change}</td>
                                    <td className="p-3"><span className="px-2 py-1 bg-[hsl(var(--muted))] rounded text-xs">{a.reason || 'adjustment'}</span></td>
                                </tr>
                            })}</tbody></table>
                    )}
                </CardContent></Card>
        </div>
    )
}
