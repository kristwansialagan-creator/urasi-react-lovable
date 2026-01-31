import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Users, Save } from 'lucide-react'
import { useSettings } from '@/hooks'
import { toast } from 'sonner'

export default function CustomersSettingsPage() {
    const { settings, bulkUpdate, loading } = useSettings()
    const [formData, setFormData] = useState({
        customer_registration_required: false,
        customer_default_group_id: '',
        rewards_system_enabled: true,
        customer_allow_edit_profile: true,
        customer_email_required: true,
        customer_phone_required: false,
        customer_address_required: false
    })

    useEffect(() => {
        if (Object.keys(settings).length > 0) {
            setFormData({
                customer_registration_required: settings.customer_registration_required ?? false,
                customer_default_group_id: settings.customer_default_group_id || '',
                rewards_system_enabled: settings.rewards_system_enabled ?? true,
                customer_allow_edit_profile: settings.customer_allow_edit_profile ?? true,
                customer_email_required: settings.customer_email_required ?? true,
                customer_phone_required: settings.customer_phone_required ?? false,
                customer_address_required: settings.customer_address_required ?? false
            })
        }
    }, [settings])

    const handleSave = async () => {
        const success = await bulkUpdate(formData, 'customers')
        if (success) toast.success('Customer settings saved successfully!')
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Users className="h-8 w-8" />Customer Settings</h1>
                <Button onClick={handleSave} disabled={loading}><Save className="h-4 w-4 mr-2" />Save Settings</Button>
            </div>

            <Card><CardHeader><CardTitle>Customer Registration</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Require Registration for Orders</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Force customer registration before placing orders</p></div>
                    <input type="checkbox" checked={formData.customer_registration_required} onChange={e => setFormData({ ...formData, customer_registration_required: e.target.checked })} className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Allow Profile Editing</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Customers can edit their own profiles</p></div>
                    <input type="checkbox" checked={formData.customer_allow_edit_profile} onChange={e => setFormData({ ...formData, customer_allow_edit_profile: e.target.checked })} className="h-5 w-5" />
                </div>
            </CardContent></Card>

            <Card><CardHeader><CardTitle>Required Fields</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Email Required</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Customers must provide email address</p></div>
                    <input type="checkbox" checked={formData.customer_email_required} onChange={e => setFormData({ ...formData, customer_email_required: e.target.checked })} className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Phone Required</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Customers must provide phone number</p></div>
                    <input type="checkbox" checked={formData.customer_phone_required} onChange={e => setFormData({ ...formData, customer_phone_required: e.target.checked })} className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Address Required</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Customers must provide address</p></div>
                    <input type="checkbox" checked={formData.customer_address_required} onChange={e => setFormData({ ...formData, customer_address_required: e.target.checked })} className="h-5 w-5" />
                </div>
            </CardContent></Card>

            <Card><CardHeader><CardTitle>Rewards System</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Enable Rewards System</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Allow customers to earn and redeem reward points</p></div>
                    <input type="checkbox" checked={formData.rewards_system_enabled} onChange={e => setFormData({ ...formData, rewards_system_enabled: e.target.checked })} className="h-5 w-5" />
                </div>
            </CardContent></Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading} size="lg"><Save className="h-5 w-5 mr-2" />Save All Settings</Button>
            </div>
        </div>
    )
}
