import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Save } from 'lucide-react'
import { useSettings } from '@/hooks'

export default function GeneralSettingsPage() {
    const { settings, bulkUpdate, loading } = useSettings()
    const [formData, setFormData] = useState({
        store_name: '', store_address: '', store_phone: '', store_email: '',
        currency_symbol: '$', currency_position: 'before', currency_decimal_places: 2,
        date_format: 'Y-m-d', time_format: 'H:i', timezone: 'UTC', language: 'en'
    })

    useEffect(() => {
        if (Object.keys(settings).length > 0) {
            setFormData({
                store_name: settings.store_name || '',
                store_address: settings.store_address || '',
                store_phone: settings.store_phone || '',
                store_email: settings.store_email || '',
                currency_symbol: settings.currency_symbol || '$',
                currency_position: settings.currency_position || 'before',
                currency_decimal_places: settings.currency_decimal_places || 2,
                date_format: settings.date_format || 'Y-m-d',
                time_format: settings.time_format || 'H:i',
                timezone: settings.timezone || 'UTC',
                language: settings.language || 'en'
            })
        }
    }, [settings])

    const handleSave = async () => {
        const success = await bulkUpdate(formData, 'general')
        if (success) alert('Settings saved successfully!')
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Settings className="h-8 w-8" />General Settings</h1>
                <Button onClick={handleSave} disabled={loading}><Save className="h-4 w-4 mr-2" />Save Settings</Button>
            </div>

            {/* Store Information */}
            <Card><CardHeader><CardTitle>Store Information</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Store Name *</Label><Input value={formData.store_name} onChange={e => setFormData({ ...formData, store_name: e.target.value })} placeholder="My Store" /></div>
                    <div><Label>Store Email</Label><Input type="email" value={formData.store_email} onChange={e => setFormData({ ...formData, store_email: e.target.value })} placeholder="info@store.com" /></div>
                </div>
                <div><Label>Store Address</Label><Input value={formData.store_address} onChange={e => setFormData({ ...formData, store_address: e.target.value })} placeholder="123 Main Street, City, Country" /></div>
                <div><Label>Store Phone</Label><Input value={formData.store_phone} onChange={e => setFormData({ ...formData, store_phone: e.target.value })} placeholder="+1 234 567 8900" /></div>
            </CardContent></Card>

            {/* Currency Settings */}
            <Card><CardHeader><CardTitle>Currency Settings</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><Label>Currency Symbol</Label><Input value={formData.currency_symbol} onChange={e => setFormData({ ...formData, currency_symbol: e.target.value })} placeholder="$" /></div>
                    <div><Label>Symbol Position</Label><select value={formData.currency_position} onChange={e => setFormData({ ...formData, currency_position: e.target.value })} className="w-full px-3 py-2 border rounded"><option value="before">Before ($100)</option><option value="after">After (100$)</option></select></div>
                    <div><Label>Decimal Places</Label><Input type="number" min="0" max="4" value={formData.currency_decimal_places} onChange={e => setFormData({ ...formData, currency_decimal_places: Number(e.target.value) })} /></div>
                </div>
                <div className="bg-[hsl(var(--muted))] p-3 rounded"><div className="text-sm text-[hsl(var(--muted-foreground))]">Preview:</div><div className="text-2xl font-bold">{formData.currency_position === 'before' ? `${formData.currency_symbol}${(1234.56).toFixed(formData.currency_decimal_places)}` : `${(1234.56).toFixed(formData.currency_decimal_places)}${formData.currency_symbol}`}</div></div>
            </CardContent></Card>

            {/* Regional Settings */}
            <Card><CardHeader><CardTitle>Regional Settings</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Date Format</Label><select value={formData.date_format} onChange={e => setFormData({ ...formData, date_format: e.target.value })} className="w-full px-3 py-2 border rounded"><option value="Y-m-d">YYYY-MM-DD (2024-01-15)</option><option value="m/d/Y">MM/DD/YYYY (01/15/2024)</option><option value="d/m/Y">DD/MM/YYYY (15/01/2024)</option><option value="d-m-Y">DD-MM-YYYY (15-01-2024)</option></select></div>
                    <div><Label>Time Format</Label><select value={formData.time_format} onChange={e => setFormData({ ...formData, time_format: e.target.value })} className="w-full px-3 py-2 border rounded"><option value="H:i">24-hour (14:30)</option><option value="h:i A">12-hour (02:30 PM)</option></select></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Timezone</Label><select value={formData.timezone} onChange={e => setFormData({ ...formData, timezone: e.target.value })} className="w-full px-3 py-2 border rounded"><option value="UTC">UTC</option><option value="America/New_York">America/New_York (EST/EDT)</option><option value="America/Chicago">America/Chicago (CST/CDT)</option><option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option><option value="Europe/London">Europe/London (GMT/BST)</option><option value="Europe/Paris">Europe/Paris (CET/CEST)</option><option value="Asia/Tokyo">Asia/Tokyo (JST)</option><option value="Asia/Shanghai">Asia/Shanghai (CST)</option><option value="Asia/Jakarta">Asia/Jakarta (WIB)</option></select></div>
                    <div><Label>Language</Label><select value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} className="w-full px-3 py-2 border rounded"><option value="en">English</option><option value="id">Indonesian</option><option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option></select></div>
                </div>
            </CardContent></Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading} size="lg"><Save className="h-5 w-5 mr-2" />Save All Settings</Button>
            </div>
        </div>
    )
}
