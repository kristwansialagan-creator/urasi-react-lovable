import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Save, Upload } from 'lucide-react'
import { useSettings } from '@/hooks'
import { useMedia } from '@/hooks'

export default function InvoiceSettingsPage() {
    const { settings, bulkUpdate, loading } = useSettings()
    const { uploadFile } = useMedia()
    const [formData, setFormData] = useState({
        invoice_template: 'default',
        invoice_company_logo: '',
        invoice_footer_text: '',
        invoice_show_barcode: true,
        invoice_show_qr: false,
        invoice_number_prefix: 'INV-',
        invoice_show_customer_info: true,
        invoice_show_payment_info: true
    })
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (Object.keys(settings).length > 0) {
            setFormData({
                invoice_template: settings.invoice_template || 'default',
                invoice_company_logo: settings.invoice_company_logo || '',
                invoice_footer_text: settings.invoice_footer_text || '',
                invoice_show_barcode: settings.invoice_show_barcode ?? true,
                invoice_show_qr: settings.invoice_show_qr ?? false,
                invoice_number_prefix: settings.invoice_number_prefix || 'INV-',
                invoice_show_customer_info: settings.invoice_show_customer_info ?? true,
                invoice_show_payment_info: settings.invoice_show_payment_info ?? true
            })
        }
    }, [settings])

    const handleSave = async () => {
        const success = await bulkUpdate(formData, 'invoice')
        if (success) alert('Invoice settings saved successfully!')
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const url = await uploadFile(file)
        if (url) {
            setFormData({ ...formData, invoice_company_logo: url })
        }
        setUploading(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="h-8 w-8" />Invoice Settings</h1>
                <Button onClick={handleSave} disabled={loading}><Save className="h-4 w-4 mr-2" />Save Settings</Button>
            </div>

            {/* Company Branding */}
            <Card><CardHeader><CardTitle>Company Branding</CardTitle></CardHeader><CardContent className="space-y-4">
                <div>
                    <Label>Company Logo</Label>
                    {formData.invoice_company_logo && (
                        <div className="mt-2 mb-4">
                            <img src={formData.invoice_company_logo} alt="Logo" className="h-24 border rounded" />
                        </div>
                    )}
                    <div className="flex gap-2">
                        <label className="cursor-pointer">
                            <Button variant="outline" disabled={uploading}>
                                <Upload className="h-4 w-4 mr-2" />
                                {uploading ? 'Uploading...' : 'Upload Logo'}
                            </Button>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                        {formData.invoice_company_logo && (
                            <Button variant="outline" onClick={() => setFormData({ ...formData, invoice_company_logo: '' })}>Remove</Button>
                        )}
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Recommended size: 200x80px</p>
                </div>
            </CardContent></Card>

            {/* Invoice Configuration */}
            <Card><CardHeader><CardTitle>Invoice Configuration</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Invoice Template</Label>
                        <select value={formData.invoice_template} onChange={e => setFormData({ ...formData, invoice_template: e.target.value })} className="w-full px-3 py-2 border rounded">
                            <option value="default">Default</option>
                            <option value="modern">Modern</option>
                            <option value="classic">Classic</option>
                            <option value="minimal">Minimal</option>
                        </select>
                    </div>
                    <div>
                        <Label>Invoice Number Prefix</Label>
                        <Input value={formData.invoice_number_prefix} onChange={e => setFormData({ ...formData, invoice_number_prefix: e.target.value })} placeholder="INV-" />
                    </div>
                </div>

                <div>
                    <Label>Footer Text / Terms & Conditions</Label>
                    <textarea
                        value={formData.invoice_footer_text}
                        onChange={e => setFormData({ ...formData, invoice_footer_text: e.target.value })}
                        className="w-full px-3 py-2 border rounded min-h-[100px]"
                        placeholder="Thank you for your business! Payment is due within 30 days..."
                    />
                </div>
            </CardContent></Card>

            {/* Display Options */}
            <Card><CardHeader><CardTitle>Display Options</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Show Customer Information</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Display customer name, address, and contact details</p></div>
                    <input type="checkbox" checked={formData.invoice_show_customer_info} onChange={e => setFormData({ ...formData, invoice_show_customer_info: e.target.checked })} className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Show Payment Information</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Include payment method and transaction details</p></div>
                    <input type="checkbox" checked={formData.invoice_show_payment_info} onChange={e => setFormData({ ...formData, invoice_show_payment_info: e.target.checked })} className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Show Barcode</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Display order barcode on invoice</p></div>
                    <input type="checkbox" checked={formData.invoice_show_barcode} onChange={e => setFormData({ ...formData, invoice_show_barcode: e.target.checked })} className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Show QR Code</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Display QR code for quick payment/verification</p></div>
                    <input type="checkbox" checked={formData.invoice_show_qr} onChange={e => setFormData({ ...formData, invoice_show_qr: e.target.checked })} className="h-5 w-5" />
                </div>
            </CardContent></Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading} size="lg"><Save className="h-5 w-5 mr-2" />Save All Settings</Button>
            </div>
        </div>
    )
}
