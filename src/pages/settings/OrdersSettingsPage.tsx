import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Receipt, Save } from 'lucide-react'
import { useSettings } from '@/hooks'
import { toast } from 'sonner'

export default function OrdersSettingsPage() {
    const { settings, bulkUpdate, loading } = useSettings()
    const [formData, setFormData] = useState({
        order_code_prefix: 'ORD-',
        allow_partial_payments: true,
        quotation_expiry_days: 7,
        order_auto_confirm: false,
        order_show_notes: true,
        order_allow_refund: true,
        order_min_amount: 0
    })

    useEffect(() => {
        if (Object.keys(settings).length > 0) {
            setFormData({
                order_code_prefix: settings.order_code_prefix || 'ORD-',
                allow_partial_payments: settings.allow_partial_payments ?? true,
                quotation_expiry_days: settings.quotation_expiry_days || 7,
                order_auto_confirm: settings.order_auto_confirm ?? false,
                order_show_notes: settings.order_show_notes ?? true,
                order_allow_refund: settings.order_allow_refund ?? true,
                order_min_amount: settings.order_min_amount || 0
            })
        }
    }, [settings])

    const handleSave = async () => {
        const success = await bulkUpdate(formData, 'orders')
        if (success) toast.success('Orders settings saved successfully!')
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Receipt className="h-8 w-8" />Orders Settings</h1>
                <Button onClick={handleSave} disabled={loading}><Save className="h-4 w-4 mr-2" />Save Settings</Button>
            </div>

            <Card><CardHeader><CardTitle>Order Configuration</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Order Code Prefix</Label><Input value={formData.order_code_prefix} onChange={e => setFormData({ ...formData, order_code_prefix: e.target.value })} placeholder="ORD-" /></div>
                    <div><Label>Minimum Order Amount ($)</Label><Input type="number" step="0.01" value={formData.order_min_amount} onChange={e => setFormData({ ...formData, order_min_amount: Number(e.target.value) })} /></div>
                </div>
                <div><Label>Quotation Expiry (Days)</Label><Input type="number" min="1" value={formData.quotation_expiry_days} onChange={e => setFormData({ ...formData, quotation_expiry_days: Number(e.target.value) })} /></div>
            </CardContent></Card>

            <Card><CardHeader><CardTitle>Order Features</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Allow Partial Payments</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Customers can pay orders in instalments</p></div>
                    <input type="checkbox" checked={formData.allow_partial_payments} onChange={e => setFormData({ ...formData, allow_partial_payments: e.target.checked })} className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Auto-Confirm Orders</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Automatically confirm orders after creation</p></div>
                    <input type="checkbox" checked={formData.order_auto_confirm} onChange={e => setFormData({ ...formData, order_auto_confirm: e.target.checked })} className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Show Order Notes</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Display notes field on order form</p></div>
                    <input type="checkbox" checked={formData.order_show_notes} onChange={e => setFormData({ ...formData, order_show_notes: e.target.checked })} className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Allow Refunds</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Enable order refund functionality</p></div>
                    <input type="checkbox" checked={formData.order_allow_refund} onChange={e => setFormData({ ...formData, order_allow_refund: e.target.checked })} className="h-5 w-5" />
                </div>
            </CardContent></Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading} size="lg"><Save className="h-5 w-5 mr-2" />Save All Settings</Button>
            </div>
        </div>
    )
}
