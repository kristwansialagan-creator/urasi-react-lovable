import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Receipt, Save, Printer } from 'lucide-react'
import { useSettings } from '@/hooks'

export default function ReceiptTemplatePage() {
    const { settings, bulkUpdate, loading } = useSettings()
    const [formData, setFormData] = useState({
        receipt_header: '',
        receipt_footer: '',
        receipt_show_store_name: true,
        receipt_show_store_address: true,
        receipt_show_store_phone: true,
        receipt_show_cashier: true,
        receipt_show_customer: true,
        receipt_show_tax_summary: true,
        receipt_paper_size: '80mm',
        receipt_font_size: '12',
        receipt_logo_url: ''
    })

    useEffect(() => {
        if (Object.keys(settings).length > 0) {
            setFormData({
                receipt_header: settings.receipt_header || '',
                receipt_footer: settings.receipt_footer || 'Thank you for your purchase!',
                receipt_show_store_name: settings.receipt_show_store_name ?? true,
                receipt_show_store_address: settings.receipt_show_store_address ?? true,
                receipt_show_store_phone: settings.receipt_show_store_phone ?? true,
                receipt_show_cashier: settings.receipt_show_cashier ?? true,
                receipt_show_customer: settings.receipt_show_customer ?? true,
                receipt_show_tax_summary: settings.receipt_show_tax_summary ?? true,
                receipt_paper_size: settings.receipt_paper_size || '80mm',
                receipt_font_size: settings.receipt_font_size || '12',
                receipt_logo_url: settings.receipt_logo_url || ''
            })
        }
    }, [settings])

    const handleSave = async () => {
        const success = await bulkUpdate(formData, 'receipt')
        if (success) alert('Receipt template saved successfully!')
    }

    const handleTestPrint = () => {
        const testReceipt = generateTestReceipt()
        const printWindow = window.open('', '', 'width=400,height=600')
        if (!printWindow) return

        printWindow.document.write(testReceipt)
        printWindow.document.close()
        setTimeout(() => printWindow.print(), 250)
    }

    const generateTestReceipt = () => {
        const width = formData.receipt_paper_size === '58mm' ? '58mm' : '80mm'

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Receipt</title>
    <style>
        @media print {
            body { margin: 0; padding: 0; }
        }
        body {
            width: ${width};
            margin: 0 auto;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: ${formData.receipt_font_size}px;
            line-height: 1.4;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; }
        .right { text-align: right; }
    </style>
</head>
<body>
    ${formData.receipt_logo_url ? `<div class="center"><img src="${formData.receipt_logo_url}" style="max-width: 80%; height: auto; margin-bottom: 10px;"></div>` : ''}
    
    ${formData.receipt_show_store_name ? `<div class="center bold" style="font-size: ${parseInt(formData.receipt_font_size) + 2}px;">${settings.store_name || 'STORE NAME'}</div>` : ''}
    ${formData.receipt_show_store_address ? `<div class="center">${settings.store_address || '123 Main Street, City'}</div>` : ''}
    ${formData.receipt_show_store_phone ? `<div class="center">Tel: ${settings.store_phone || '+1 234 567 8900'}</div>` : ''}
    
    ${formData.receipt_header ? `<div class="center" style="margin-top: 10px;">${formData.receipt_header}</div>` : ''}
    
    <div class="line"></div>
    
    <table>
        <tr><td>Date:</td><td class="right">${new Date().toLocaleString()}</td></tr>
        <tr><td>Order:</td><td class="right">ORD-${Date.now().toString().slice(-6)}</td></tr>
        ${formData.receipt_show_cashier ? `<tr><td>Cashier:</td><td class="right">Test User</td></tr>` : ''}
        ${formData.receipt_show_customer ? `<tr><td>Customer:</td><td class="right">Walk-in Customer</td></tr>` : ''}
    </table>
    
    <div class="line"></div>
    
    <table>
        <thead>
            <tr>
                <td class="bold">Item</td>
                <td class="bold right">Qty</td>
                <td class="bold right">Price</td>
                <td class="bold right">Total</td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Sample Product 1</td>
                <td class="right">2</td>
                <td class="right">$10.00</td>
                <td class="right">$20.00</td>
            </tr>
            <tr>
                <td>Sample Product 2</td>
                <td class="right">1</td>
                <td class="right">$15.50</td>
                <td class="right">$15.50</td>
            </tr>
        </tbody>
    </table>
    
    <div class="line"></div>
    
    <table>
        <tr><td>Subtotal:</td><td class="right">$35.50</td></tr>
        ${formData.receipt_show_tax_summary ? `<tr><td>Tax (10%):</td><td class="right">$3.55</td></tr>` : ''}
        <tr><td class="bold">TOTAL:</td><td class="right bold">$39.05</td></tr>
        <tr><td>Paid:</td><td class="right">$40.00</td></tr>
        <tr><td>Change:</td><td class="right">$0.95</td></tr>
    </table>
    
    <div class="line"></div>
    
    <div class="center">${formData.receipt_footer}</div>
    
    <div class="center" style="margin-top: 10px;">***</div>
</body>
</html>
        `
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Receipt className="h-8 w-8" />Receipt Template Editor</h1>
                <div className="flex gap-2">
                    <Button onClick={handleTestPrint} variant="outline"><Printer className="h-4 w-4 mr-2" />Test Print</Button>
                    <Button onClick={handleSave} disabled={loading}><Save className="h-4 w-4 mr-2" />Save Template</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Settings */}
                <div className="space-y-6">
                    {/* Paper Settings */}
                    <Card><CardHeader><CardTitle>Paper Settings</CardTitle></CardHeader><CardContent className="space-y-4">
                        <div><Label>Paper Size</Label><select value={formData.receipt_paper_size} onChange={e => setFormData({ ...formData, receipt_paper_size: e.target.value })} className="w-full px-3 py-2 border rounded"><option value="58mm">58mm (Thermal Printer)</option><option value="80mm">80mm (Standard POS)</option><option value="A4">A4 (Letter Size)</option></select></div>
                        <div><Label>Font Size (px)</Label><Input type="number" min="8" max="24" value={formData.receipt_font_size} onChange={e => setFormData({ ...formData, receipt_font_size: e.target.value })} /></div>
                    </CardContent></Card>

                    {/* Header & Footer */}
                    <Card><CardHeader><CardTitle>Header & Footer</CardTitle></CardHeader><CardContent className="space-y-4">
                        <div><Label>Logo URL</Label><Input value={formData.receipt_logo_url} onChange={e => setFormData({ ...formData, receipt_logo_url: e.target.value })} placeholder="https://example.com/logo.png" /></div>
                        <div><Label>Header Text (Optional)</Label><textarea value={formData.receipt_header} onChange={e => setFormData({ ...formData, receipt_header: e.target.value })} className="w-full px-3 py-2 border rounded min-h-[60px]" placeholder="Welcome to our store..." /></div>
                        <div><Label>Footer Text</Label><textarea value={formData.receipt_footer} onChange={e => setFormData({ ...formData, receipt_footer: e.target.value })} className="w-full px-3 py-2 border rounded min-h-[60px]" placeholder="Thank you for your purchase!" /></div>
                    </CardContent></Card>

                    {/* Display Options */}
                    <Card><CardHeader><CardTitle>Display Options</CardTitle></CardHeader><CardContent className="space-y-3">
                        {[
                            { key: 'receipt_show_store_name', label: 'Show Store Name' },
                            { key: 'receipt_show_store_address', label: 'Show Store Address' },
                            { key: 'receipt_show_store_phone', label: 'Show Store Phone' },
                            { key: 'receipt_show_cashier', label: 'Show Cashier Name' },
                            { key: 'receipt_show_customer', label: 'Show Customer Name' },
                            { key: 'receipt_show_tax_summary', label: 'Show Tax Summary' }
                        ].map(option => (
                            <div key={option.key} className="flex items-center justify-between p-2 bg-[hsl(var(--muted))] rounded">
                                <Label className="font-medium">{option.label}</Label>
                                <input type="checkbox" checked={formData[option.key as keyof typeof formData] as boolean} onChange={e => setFormData({ ...formData, [option.key]: e.target.checked })} className="h-4 w-4" />
                            </div>
                        ))}
                    </CardContent></Card>
                </div>

                {/* Live Preview */}
                <div className="space-y-6">
                    <Card><CardHeader><CardTitle>Live Preview</CardTitle></CardHeader><CardContent>
                        <div className="border-2 border-dashed rounded-lg p-4 bg-white">
                            <div dangerouslySetInnerHTML={{ __html: generateTestReceipt() }} />
                        </div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-4">This is a live preview of your receipt template. Click "Test Print" to see how it looks when printed.</p>
                    </CardContent></Card>

                    {/* Template Variables */}
                    <Card><CardHeader><CardTitle>Available Template Variables</CardTitle></CardHeader><CardContent>
                        <div className="space-y-2 text-sm">
                            <p className="text-[hsl(var(--muted-foreground))]">You can use these variables in header/footer text:</p>
                            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                                <code className="bg-[hsl(var(--muted))] p-1 rounded">{'{{store_name}}'}</code>
                                <code className="bg-[hsl(var(--muted))] p-1 rounded">{'{{store_phone}}'}</code>
                                <code className="bg-[hsl(var(--muted))] p-1 rounded">{'{{order_code}}'}</code>
                                <code className="bg-[hsl(var(--muted))] p-1 rounded">{'{{date}}'}</code>
                                <code className="bg-[hsl(var(--muted))] p-1 rounded">{'{{total}}'}</code>
                                <code className="bg-[hsl(var(--muted))] p-1 rounded">{'{{cashier}}'}</code>
                            </div>
                        </div>
                    </CardContent></Card>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button onClick={handleTestPrint} variant="outline" size="lg"><Printer className="h-5 w-5 mr-2" />Test Print</Button>
                <Button onClick={handleSave} disabled={loading} size="lg"><Save className="h-5 w-5 mr-2" />Save Template</Button>
            </div>
        </div>
    )
}
