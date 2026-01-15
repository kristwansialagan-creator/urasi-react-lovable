import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Monitor, Save } from 'lucide-react'
import { useSettings } from '@/hooks'

export default function PosSettingsPage() {
    const { settings, bulkUpdate, loading } = useSettings()
    const [formData, setFormData] = useState({
        pos_quick_product: true,
        pos_print_receipt: true,
        pos_open_cash_drawer: false,
        pos_sound_notifications: true,
        pos_default_customer_id: '',
        pos_barcode_search: true,
        pos_allow_multi_currency: false,
        pos_show_stock: true,
        pos_allow_discount: true
    })

    useEffect(() => {
        if (Object.keys(settings).length > 0) {
            setFormData({
                pos_quick_product: settings.pos_quick_product ?? true,
                pos_print_receipt: settings.pos_print_receipt ?? true,
                pos_open_cash_drawer: settings.pos_open_cash_drawer ?? false,
                pos_sound_notifications: settings.pos_sound_notifications ?? true,
                pos_default_customer_id: settings.pos_default_customer_id || '',
                pos_barcode_search: settings.pos_barcode_search ?? true,
                pos_allow_multi_currency: settings.pos_allow_multi_currency ?? false,
                pos_show_stock: settings.pos_show_stock ?? true,
                pos_allow_discount: settings.pos_allow_discount ?? true
            })
        }
    }, [settings])

    const handleSave = async () => {
        const success = await bulkUpdate(formData, 'pos')
        if (success) alert('POS settings saved successfully!')
    }

    const toggleSetting = (key: keyof typeof formData) => {
        setFormData(prev => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Monitor className="h-8 w-8" />POS Settings</h1>
                <Button onClick={handleSave} disabled={loading}><Save className="h-4 w-4 mr-2" />Save Settings</Button>
            </div>

            {/* General POS Settings */}
            <Card><CardHeader><CardTitle>General POS Configuration</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Enable Quick Product Selection</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Allow adding products quickly without searching</p></div>
                    <input type="checkbox" checked={formData.pos_quick_product} onChange={() => toggleSetting('pos_quick_product')} className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Show Stock Levels</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Display available stock on POS screen</p></div>
                    <input type="checkbox" checked={formData.pos_show_stock} onChange={() => toggleSetting('pos_show_stock')} className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Barcode Search</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Enable barcode scanning for product search</p></div>
                    <input type="checkbox" checked={formData.pos_barcode_search} onChange={() => toggleSetting('pos_barcode_search')} className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Allow Discounts</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Cashiers can apply discounts to orders</p></div>
                    <input type="checkbox" checked={formData.pos_allow_discount} onChange={() => toggleSetting('pos_allow_discount')} className="h-5 w-5" />
                </div>
            </CardContent></Card>

            {/* Receipt & Hardware */}
            <Card><CardHeader><CardTitle>Receipt & Hardware Settings</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Auto-Print Receipt After Sale</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Automatically print receipt when order is completed</p></div>
                    <input type="checkbox" checked={formData.pos_print_receipt} onChange={() => toggleSetting('pos_print_receipt')} className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Open Cash Drawer</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Trigger cash drawer opening after payment</p></div>
                    <input type="checkbox" checked={formData.pos_open_cash_drawer} onChange={() => toggleSetting('pos_open_cash_drawer')} className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Sound Notifications</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Play sounds for actions (scan, error, success)</p></div>
                    <input type="checkbox" checked={formData.pos_sound_notifications} onChange={() => toggleSetting('pos_sound_notifications')} className="h-5 w-5" />
                </div>
            </CardContent></Card>

            {/* Advanced Settings */}
            <Card><CardHeader><CardTitle>Advanced Configuration</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Multi-Currency Support</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Allow payments in multiple currencies</p></div>
                    <input type="checkbox" checked={formData.pos_allow_multi_currency} onChange={() => toggleSetting('pos_allow_multi_currency')} className="h-5 w-5" />
                </div>
            </CardContent></Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading} size="lg"><Save className="h-5 w-5 mr-2" />Save All Settings</Button>
            </div>
        </div>
    )
}
