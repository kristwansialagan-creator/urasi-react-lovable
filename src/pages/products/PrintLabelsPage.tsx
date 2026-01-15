import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Printer } from 'lucide-react'
import { useProducts } from '@/hooks'
import { supabase } from '@/lib/supabase'

export default function PrintLabelsPage() {
    const { products } = useProducts()
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])
    const [quantities, setQuantities] = useState<Record<string, number>>({})
    const [template, setTemplate] = useState('default')
    const [templates, setTemplates] = useState<any[]>([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchTemplates = async () => {
        const { data } = await supabase.from('label_templates').select('*').order('is_default', { ascending: false })
        setTemplates(data || [])
        if (data && data.length > 0) {
            const defaultTemplate = data.find((t: any) => t.is_default) || data[0]
            setTemplate((defaultTemplate as any).id)
        }
    }

    const toggleProduct = (productId: string) => {
        setSelectedProducts(prev => {
            if (prev.includes(productId)) {
                const updated = prev.filter(id => id !== productId)
                const newQty = { ...quantities }
                delete newQty[productId]
                setQuantities(newQty)
                return updated
            } else {
                setQuantities({ ...quantities, [productId]: 1 })
                return [...prev, productId]
            }
        })
    }

    const updateQuantity = (productId: string, qty: number) => {
        setQuantities({ ...quantities, [productId]: Math.max(1, qty) })
    }

    const handlePrint = () => {
        if (selectedProducts.length === 0) {
            return alert('Please select at least one product')
        }

        const selectedTemplate = templates.find(t => t.id === template)
        if (!selectedTemplate) {
            return alert('Please select a template')
        }

        // Generate print content
        const printWindow = window.open('', '', 'width=800,height=600')
        if (!printWindow) return

        const selectedProductsData = products.filter((p: any) => selectedProducts.includes(p.id))

        let printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Labels</title>
                <style>
                    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                    .label { 
                        width: ${selectedTemplate.width}mm; 
                        height: ${selectedTemplate.height}mm; 
                        border: 1px dashed #ccc; 
                        margin: 5mm;
                        padding: 2mm;
                        display: inline-block;
                        page-break-inside: avoid;
                        text-align: center;
                    }
                    .product-name { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
                    .product-sku { font-size: 12px; color: #666; margin-bottom: 5px; }
                    .product-price { font-size: 16px; font-weight: bold; color: #000; }
                    @media print {
                        body { margin: 0; padding: 0; }
                        .label { border: none; }
                    }
                </style>
            </head>
            <body>
        `

        selectedProductsData.forEach((product: any) => {
            const qty = quantities[product.id] || 1
            for (let i = 0; i < qty; i++) {
                printContent += `
                    <div class="label">
                        <div class="product-name">${product.name}</div>
                        <div class="product-sku">SKU: ${product.sku || 'N/A'}</div>
                        <div class="product-price">$${product.sale_price?.toFixed(2) || '0.00'}</div>
                    </div>
                `
            }
        })

        printContent += `</body></html>`

        printWindow.document.write(printContent)
        printWindow.document.close()
        setTimeout(() => {
            printWindow.print()
        }, 250)
    }

    const filteredProducts = products.filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    )

    const totalLabels = Object.values(quantities).reduce((sum, qty) => sum + qty, 0)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Printer className="h-8 w-8" />Print Product Labels</h1>
                <Button onClick={handlePrint} disabled={selectedProducts.length === 0}><Printer className="h-4 w-4 mr-2" />Print {totalLabels} Labels</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Selected Products</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-[hsl(var(--primary))]">{selectedProducts.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Labels</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalLabels}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Template</CardTitle></CardHeader><CardContent><div className="text-sm font-medium">{templates.find(t => t.id === template)?.name || 'Default'}</div></CardContent></Card>
            </div>

            {/* Template Selection */}
            <Card><CardHeader><CardTitle>Label Template</CardTitle></CardHeader><CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Select Template</Label>
                        <select value={template} onChange={e => setTemplate(e.target.value)} className="w-full px-3 py-2 border rounded">
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.width}x{t.height}mm)</option>
                            ))}
                        </select>
                    </div>
                </div>
            </CardContent></Card>

            {/* Product Selection */}
            <Card><CardHeader><CardTitle>Select Products</CardTitle></CardHeader><CardContent>
                <div className="mb-4">
                    <Input
                        placeholder="Search products by name or SKU..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="border rounded max-h-96 overflow-y-auto">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-[hsl(var(--muted))]">
                            <tr className="border-b">
                                <th className="text-left p-3 w-12">#</th>
                                <th className="text-left p-3">Product Name</th>
                                <th className="text-left p-3">SKU</th>
                                <th className="text-right p-3">Price</th>
                                <th className="text-center p-3">Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.slice(0, 100).map((product: any) => (
                                <tr key={product.id} className={`border-b hover:bg-[hsl(var(--muted))] ${selectedProducts.includes(product.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product.id)}
                                            onChange={() => toggleProduct(product.id)}
                                            className="h-4 w-4"
                                        />
                                    </td>
                                    <td className="p-3 font-medium">{product.name}</td>
                                    <td className="p-3"><span className="px-2 py-1 bg-[hsl(var(--muted))] rounded text-xs font-mono">{product.sku || '-'}</span></td>
                                    <td className="p-3 text-right">${product.sale_price?.toFixed(2) || '0.00'}</td>
                                    <td className="p-3 text-center">
                                        {selectedProducts.includes(product.id) && (
                                            <Input
                                                type="number"
                                                min="1"
                                                value={quantities[product.id] || 1}
                                                onChange={e => updateQuantity(product.id, Number(e.target.value))}
                                                className="w-20 text-center"
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length > 100 && (
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">Showing first 100 products. Use search to find more.</p>
                )}
            </CardContent></Card>
        </div >
    )
}
