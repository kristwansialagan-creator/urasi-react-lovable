import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Receipt, Save, Printer } from 'lucide-react'
import { useSettings } from '@/hooks'
import { toast } from 'sonner'

export default function ReceiptTemplatePage() {
    const { settings, bulkUpdate, loading } = useSettings()
    const iframeRef = useRef<HTMLIFrameElement>(null)
    
    const [formData, setFormData] = useState({
        receipt_header: '',
        receipt_footer: 'Terima kasih atas kunjungan Anda!',
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
                receipt_footer: settings.receipt_footer || 'Terima kasih atas kunjungan Anda!',
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

    // Update iframe preview whenever formData changes
    useEffect(() => {
        if (iframeRef.current) {
            const doc = iframeRef.current.contentDocument
            if (doc) {
                doc.open()
                doc.write(generateTestReceipt())
                doc.close()
            }
        }
    }, [formData, settings])

    const handleSave = async () => {
        const success = await bulkUpdate(formData, 'receipt')
        if (success) {
            toast.success('Template struk berhasil disimpan!')
        } else {
            toast.error('Gagal menyimpan template struk')
        }
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
        const width = formData.receipt_paper_size === '58mm' ? '58mm' : formData.receipt_paper_size === 'A4' ? '210mm' : '80mm'
        const storeName = settings.store_name || 'URASI POS'
        const storeAddress = settings.store_address || 'Jl. Contoh No. 123, Kota'
        const storePhone = settings.store_phone || '+62 812 3456 7890'

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
        * { box-sizing: border-box; }
        body {
            width: ${width};
            margin: 0 auto;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: ${formData.receipt_font_size}px;
            line-height: 1.4;
            background: white;
            color: black;
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
    ${formData.receipt_logo_url ? `<div class="center"><img src="${formData.receipt_logo_url}" style="max-width: 80%; height: auto; margin-bottom: 10px;" onerror="this.style.display='none'"></div>` : ''}
    
    ${formData.receipt_show_store_name ? `<div class="center bold" style="font-size: ${parseInt(formData.receipt_font_size) + 2}px;">${storeName}</div>` : ''}
    ${formData.receipt_show_store_address ? `<div class="center">${storeAddress}</div>` : ''}
    ${formData.receipt_show_store_phone ? `<div class="center">Telp: ${storePhone}</div>` : ''}
    
    ${formData.receipt_header ? `<div class="center" style="margin-top: 10px;">${formData.receipt_header}</div>` : ''}
    
    <div class="line"></div>
    
    <table>
        <tr><td>Tanggal:</td><td class="right">${new Date().toLocaleString('id-ID')}</td></tr>
        <tr><td>Order:</td><td class="right">ORD-${Date.now().toString().slice(-6)}</td></tr>
        ${formData.receipt_show_cashier ? `<tr><td>Kasir:</td><td class="right">Staff</td></tr>` : ''}
        ${formData.receipt_show_customer ? `<tr><td>Pelanggan:</td><td class="right">Walk-in</td></tr>` : ''}
    </table>
    
    <div class="line"></div>
    
    <table>
        <thead>
            <tr>
                <td class="bold">Item</td>
                <td class="bold right">Qty</td>
                <td class="bold right">Harga</td>
                <td class="bold right">Total</td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Produk Contoh 1</td>
                <td class="right">2</td>
                <td class="right">Rp10.000</td>
                <td class="right">Rp20.000</td>
            </tr>
            <tr>
                <td>Produk Contoh 2</td>
                <td class="right">1</td>
                <td class="right">Rp15.500</td>
                <td class="right">Rp15.500</td>
            </tr>
        </tbody>
    </table>
    
    <div class="line"></div>
    
    <table>
        <tr><td>Subtotal:</td><td class="right">Rp35.500</td></tr>
        ${formData.receipt_show_tax_summary ? `<tr><td>Pajak (10%):</td><td class="right">Rp3.550</td></tr>` : ''}
        <tr><td class="bold">TOTAL:</td><td class="right bold">Rp39.050</td></tr>
        <tr><td>Dibayar:</td><td class="right">Rp50.000</td></tr>
        <tr><td>Kembali:</td><td class="right">Rp10.950</td></tr>
    </table>
    
    <div class="line"></div>
    
    <div class="center">${formData.receipt_footer}</div>
    
    <div class="center" style="margin-top: 10px;">***</div>
</body>
</html>
        `
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Receipt className="h-6 w-6" />
                    Template Struk
                </h1>
                <div className="flex gap-2">
                    <Button onClick={handleTestPrint} variant="outline">
                        <Printer className="h-4 w-4 mr-2" />
                        Test Print
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Simpan
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Settings Column */}
                <div className="space-y-6">
                    {/* Paper Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Pengaturan Kertas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Ukuran Kertas</Label>
                                <Select 
                                    value={formData.receipt_paper_size} 
                                    onValueChange={(value) => setFormData({ ...formData, receipt_paper_size: value })}
                                >
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Pilih ukuran" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover">
                                        <SelectItem value="58mm">58mm (Thermal Printer)</SelectItem>
                                        <SelectItem value="80mm">80mm (Standard POS)</SelectItem>
                                        <SelectItem value="A4">A4 (Letter Size)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Ukuran Font (px)</Label>
                                <Input 
                                    type="number" 
                                    min="8" 
                                    max="24" 
                                    value={formData.receipt_font_size} 
                                    onChange={(e) => setFormData({ ...formData, receipt_font_size: e.target.value })} 
                                    className="bg-background"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Header & Footer */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Header & Footer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>URL Logo</Label>
                                <Input 
                                    value={formData.receipt_logo_url} 
                                    onChange={(e) => setFormData({ ...formData, receipt_logo_url: e.target.value })} 
                                    placeholder="https://example.com/logo.png" 
                                    className="bg-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Teks Header (Opsional)</Label>
                                <Textarea 
                                    value={formData.receipt_header} 
                                    onChange={(e) => setFormData({ ...formData, receipt_header: e.target.value })} 
                                    placeholder="Selamat datang di toko kami..." 
                                    className="min-h-[60px] bg-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Teks Footer</Label>
                                <Textarea 
                                    value={formData.receipt_footer} 
                                    onChange={(e) => setFormData({ ...formData, receipt_footer: e.target.value })} 
                                    placeholder="Terima kasih atas kunjungan Anda!" 
                                    className="min-h-[60px] bg-background"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Display Options */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Opsi Tampilan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { key: 'receipt_show_store_name', label: 'Tampilkan Nama Toko' },
                                { key: 'receipt_show_store_address', label: 'Tampilkan Alamat Toko' },
                                { key: 'receipt_show_store_phone', label: 'Tampilkan Telepon Toko' },
                                { key: 'receipt_show_cashier', label: 'Tampilkan Nama Kasir' },
                                { key: 'receipt_show_customer', label: 'Tampilkan Nama Pelanggan' },
                                { key: 'receipt_show_tax_summary', label: 'Tampilkan Ringkasan Pajak' }
                            ].map(option => (
                                <div key={option.key} className="flex items-center justify-between">
                                    <Label className="font-normal">{option.label}</Label>
                                    <Switch
                                        checked={formData[option.key as keyof typeof formData] as boolean}
                                        onCheckedChange={(checked) => setFormData({ ...formData, [option.key]: checked })}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Preview Column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Preview Struk</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden bg-white flex justify-center">
                                <iframe
                                    ref={iframeRef}
                                    title="Receipt Preview"
                                    className="w-full h-[500px] border-0"
                                    sandbox="allow-same-origin"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground mt-4">
                                Ini adalah preview struk Anda. Klik "Test Print" untuk melihat hasil cetak.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Template Variables Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Variabel Template</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">
                                Data berikut akan diambil dari pengaturan toko:
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-muted p-2 rounded font-mono">Nama Toko</div>
                                <div className="bg-muted p-2 rounded font-mono">Alamat Toko</div>
                                <div className="bg-muted p-2 rounded font-mono">Telepon Toko</div>
                                <div className="bg-muted p-2 rounded font-mono">Kode Order</div>
                                <div className="bg-muted p-2 rounded font-mono">Tanggal</div>
                                <div className="bg-muted p-2 rounded font-mono">Kasir</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
