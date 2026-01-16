import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Upload, Database, FileText, AlertCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useProducts } from '@/hooks'

export default function DataManagementPage() {
    const { products } = useProducts()
    const [exporting, setExporting] = useState(false)
    const [importing, setImporting] = useState(false)
    const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json')

    const handleExportProducts = async () => {
        setExporting(true)
        try {
            if (exportFormat === 'json') {
                const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' })
                downloadFile(blob, `products-${Date.now()}.json`)
            } else {
                // CSV Export
                const headers = ['ID', 'Name', 'SKU', 'Sale Price', 'Purchase Price', 'Stock Quantity', 'Category', 'Unit']
                const csv = [
                    headers.join(','),
                    ...products.map((p: any) => [
                        p.id,
                        `"${p.name}"`,
                        p.sku || '',
                        p.sale_price || 0,
                        p.purchase_price || 0,
                        p.stock_quantity || 0,
                        p.category?.name || '',
                        p.unit?.name || ''
                    ].join(','))
                ].join('\n')

                const blob = new Blob([csv], { type: 'text/csv' })
                downloadFile(blob, `products-${Date.now()}.csv`)
            }
        } catch (error) {
            alert('Export failed!')
        } finally {
            setExporting(false)
        }
    }

    const handleExportAllData = async () => {
        setExporting(true)
        try {
            const tables = ['products', 'orders', 'customers', 'product_categories', 'units', 'taxes']
            const exportData: any = {}

            for (const table of tables) {
                const { data } = await (supabase.from(table as any).select('*') as any)
                exportData[table] = data || []
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
            downloadFile(blob, `nexopos-backup-${Date.now()}.json`)
        } catch (error) {
            alert('Full export failed!')
        } finally {
            setExporting(false)
        }
    }

    const handleImportProducts = async (file: File) => {
        setImporting(true)
        try {
            const text = await file.text()

            if (file.name.endsWith('.json')) {
                const products = JSON.parse(text)
                if (!Array.isArray(products)) throw new Error('Invalid JSON format')

                // Import products (you'd need proper validation here)
                alert(`Ready to import ${products.length} products. Feature in development.`)
            } else if (file.name.endsWith('.csv')) {
                const lines = text.split('\n')
                // const headers = lines[0].split(',') // Reserved for future use

                alert(`Ready to import ${lines.length - 1} products from CSV. Feature in development.`)
            }
        } catch (error) {
            alert('Import failed! Please check file format.')
        } finally {
            setImporting(false)
        }
    }

    const downloadFile = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Database className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Data Management</h1>
            </div>

            {/* Warning */}
            <Card className="border-yellow-200 bg-yellow-50"><CardContent className="pt-6">
                <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-yellow-900 mb-1">Important Notice</h3>
                        <p className="text-sm text-yellow-800">Always backup your data before importing new data. Importing will overwrite existing records with the same ID. Make sure your import files are properly formatted.</p>
                    </div>
                </div>
            </CardContent></Card>

            {/* Export Section */}
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />Export Data</CardTitle></CardHeader><CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold mb-3">Export Products</h3>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <Label className="mb-2 block">Export Format</Label>
                            <select value={exportFormat} onChange={e => setExportFormat(e.target.value as 'json' | 'csv')} className="w-full px-3 py-2 border rounded">
                                <option value="json">JSON</option>
                                <option value="csv">CSV</option>
                            </select>
                        </div>
                        <Button onClick={handleExportProducts} disabled={exporting}>
                            <Download className="h-4 w-4 mr-2" />
                            {exporting ? 'Exporting...' : `Export ${products.length} Products`}
                        </Button>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Full Database Backup</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">Export all data (products, orders, customers, categories, units, taxes) as a single JSON file.</p>
                    <Button onClick={handleExportAllData} disabled={exporting} variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        {exporting ? 'Exporting...' : 'Export Full Database'}
                    </Button>
                </div>
            </CardContent></Card>

            {/* Import Section */}
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Import Data</CardTitle></CardHeader><CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold mb-3">Import Products</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">Upload a JSON or CSV file to import products. Supported formats: .json, .csv</p>
                    <label className="cursor-pointer">
                        <Button disabled={importing} variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            {importing ? 'Importing...' : 'Choose File to Import'}
                        </Button>
                        <input
                            type="file"
                            accept=".json,.csv"
                            onChange={e => e.target.files?.[0] && handleImportProducts(e.target.files[0])}
                            className="hidden"
                            disabled={importing}
                        />
                    </label>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">CSV Template</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">Download a CSV template to see the required format for importing products.</p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            const template = 'ID,Name,SKU,Sale Price,Purchase Price,Stock Quantity,Category,Unit\n,Sample Product,SKU-001,19.99,15.00,100,Electronics,Piece'
                            const blob = new Blob([template], { type: 'text/csv' })
                            downloadFile(blob, 'product-import-template.csv')
                        }}
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Download CSV Template
                    </Button>
                </div>
            </CardContent></Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Products</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{products.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Last Export</CardTitle></CardHeader><CardContent><div className="text-sm">Never</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Last Import</CardTitle></CardHeader><CardContent><div className="text-sm">Never</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Backup Status</CardTitle></CardHeader><CardContent><div className="text-sm text-yellow-600">No recent backup</div></CardContent></Card>
            </div>
        </div>
    )
}
