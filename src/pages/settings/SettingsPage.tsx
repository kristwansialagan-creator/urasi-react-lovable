import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Store, Receipt, DollarSign, Bell, Users, Lock, Save } from 'lucide-react'

const settingsSections = [
    { icon: Store, title: 'General', description: 'Store name, address, and basic information' },
    { icon: Receipt, title: 'POS', description: 'Point of sale settings and preferences' },
    { icon: DollarSign, title: 'Orders', description: 'Order management and defaults' },
    { icon: Bell, title: 'Notifications', description: 'Email and push notification settings' },
    { icon: Users, title: 'Users', description: 'User management and permissions' },
    { icon: Lock, title: 'Security', description: 'Password and authentication settings' },
]

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-[hsl(var(--muted-foreground))]">Configure your POS system</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" />Store Information</CardTitle>
                            <CardDescription>Basic information about your store</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label htmlFor="storeName">Store Name</Label><Input id="storeName" defaultValue="URASI Store" /></div>
                                <div className="space-y-2"><Label htmlFor="storeEmail">Email</Label><Input id="storeEmail" type="email" defaultValue="store@urasi.com" /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label htmlFor="storePhone">Phone</Label><Input id="storePhone" defaultValue="+62 812 3456 7890" /></div>
                                <div className="space-y-2"><Label htmlFor="storeCurrency">Currency</Label><Input id="storeCurrency" defaultValue="IDR - Indonesian Rupiah" /></div>
                            </div>
                            <div className="space-y-2"><Label htmlFor="storeAddress">Address</Label><textarea id="storeAddress" rows={3} className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm" defaultValue="Jl. Contoh No. 123, Jakarta" /></div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" />POS Settings</CardTitle>
                            <CardDescription>Configure point of sale behavior</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--muted))]/50">
                                <div><p className="font-medium">Quick Product Creation</p><p className="text-sm text-[hsl(var(--muted-foreground))]">Allow creating products during checkout</p></div>
                                <input type="checkbox" defaultChecked className="rounded" />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--muted))]/50">
                                <div><p className="font-medium">Auto Print Receipt</p><p className="text-sm text-[hsl(var(--muted-foreground))]">Automatically print receipt after payment</p></div>
                                <input type="checkbox" className="rounded" />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--muted))]/50">
                                <div><p className="font-medium">Enable Sound Effects</p><p className="text-sm text-[hsl(var(--muted-foreground))]">Play sounds on product scan and payment</p></div>
                                <input type="checkbox" defaultChecked className="rounded" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Tax Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label htmlFor="taxRate">Default Tax Rate (%)</Label><Input id="taxRate" type="number" defaultValue="10" /></div>
                                <div className="space-y-2"><Label htmlFor="taxType">Tax Type</Label><select id="taxType" className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm"><option>Inclusive</option><option>Exclusive</option></select></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button size="lg" className="gap-2"><Save className="h-4 w-4" />Save Settings</Button>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Quick Links</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {settingsSections.map((section, i) => (
                                <button key={i} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--muted))] text-left transition-colors">
                                    <section.icon className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                                    <div>
                                        <p className="font-medium text-sm">{section.title}</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{section.description}</p>
                                    </div>
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
