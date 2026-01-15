import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DollarSign, Save } from 'lucide-react'
import { useSettings } from '@/hooks'

export default function AccountingSettingsPage() {
    const { settings, bulkUpdate, loading } = useSettings()
    const [formData, setFormData] = useState({
        accounting_enabled: true,
        sales_account_id: '',
        cogs_account_id: '',
        tax_account_id: '',
        discount_account_id: '',
        shipping_account_id: '',
        receivables_account_id: '',
        payables_account_id: '',
        inventory_account_id: '',
        cash_account_id: '',
        auto_create_entries: true,
        journal_entry_prefix: 'JE-',
        fiscal_year_start: '01-01'
    })

    useEffect(() => {
        if (Object.keys(settings).length > 0) {
            setFormData({
                accounting_enabled: settings.accounting_enabled ?? true,
                sales_account_id: settings.sales_account_id || '',
                cogs_account_id: settings.cogs_account_id || '',
                tax_account_id: settings.tax_account_id || '',
                discount_account_id: settings.discount_account_id || '',
                shipping_account_id: settings.shipping_account_id || '',
                receivables_account_id: settings.receivables_account_id || '',
                payables_account_id: settings.payables_account_id || '',
                inventory_account_id: settings.inventory_account_id || '',
                cash_account_id: settings.cash_account_id || '',
                auto_create_entries: settings.auto_create_entries ?? true,
                journal_entry_prefix: settings.journal_entry_prefix || 'JE-',
                fiscal_year_start: settings.fiscal_year_start || '01-01'
            })
        }
    }, [settings])

    const handleSave = async () => {
        const success = await bulkUpdate(formData, 'accounting')
        if (success) alert('Accounting settings saved successfully!')
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><DollarSign className="h-8 w-8" />Accounting Settings</h1>
                <Button onClick={handleSave} disabled={loading}><Save className="h-4 w-4 mr-2" />Save Settings</Button>
            </div>

            {/* General Accounting */}
            <Card><CardHeader><CardTitle>General Accounting Configuration</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Enable Accounting System</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Activate double-entry accounting for all transactions</p></div>
                    <input type="checkbox" checked={formData.accounting_enabled} onChange={e => setFormData({ ...formData, accounting_enabled: e.target.checked })} className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded">
                    <div><Label className="font-medium">Auto-Create Journal Entries</Label><p className="text-sm text-[hsl(var(--muted-foreground))]">Automatically generate journal entries for transactions</p></div>
                    <input type="checkbox" checked={formData.auto_create_entries} onChange={e => setFormData({ ...formData, auto_create_entries: e.target.checked })} className="h-5 w-5" disabled={!formData.accounting_enabled} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Journal Entry Prefix</Label><input type="text" value={formData.journal_entry_prefix} onChange={e => setFormData({ ...formData, journal_entry_prefix: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="JE-" disabled={!formData.accounting_enabled} /></div>
                    <div><Label>Fiscal Year Start (MM-DD)</Label><input type="text" value={formData.fiscal_year_start} onChange={e => setFormData({ ...formData, fiscal_year_start: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="01-01" disabled={!formData.accounting_enabled} /></div>
                </div>
            </CardContent></Card>

            {/* Account Mapping */}
            <Card><CardHeader><CardTitle>Chart of Accounts Mapping</CardTitle></CardHeader><CardContent className="space-y-4">
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Link your transaction types to specific accounts in your chart of accounts. These accounts will be used when creating journal entries.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Sales Revenue Account</Label><input type="text" value={formData.sales_account_id} onChange={e => setFormData({ ...formData, sales_account_id: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="e.g., 4000, 4100" disabled={!formData.accounting_enabled} /><p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Account for recording sales revenue</p></div>

                    <div><Label>Cost of Goods Sold (COGS) Account</Label><input type="text" value={formData.cogs_account_id} onChange={e => setFormData({ ...formData, cogs_account_id: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="e.g., 5000, 5100" disabled={!formData.accounting_enabled} /><p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Account for cost of goods sold</p></div>

                    <div><Label>Tax Payable Account</Label><input type="text" value={formData.tax_account_id} onChange={e => setFormData({ ...formData, tax_account_id: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="e.g., 2200, 2210" disabled={!formData.accounting_enabled} /><p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Account for tax liabilities</p></div>

                    <div><Label>Discount Expense Account</Label><input type="text" value={formData.discount_account_id} onChange={e => setFormData({ ...formData, discount_account_id: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="e.g., 5200, 5210" disabled={!formData.accounting_enabled} /><p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Account for discounts given</p></div>

                    <div><Label>Shipping Revenue Account</Label><input type="text" value={formData.shipping_account_id} onChange={e => setFormData({ ...formData, shipping_account_id: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="e.g., 4200, 4210" disabled={!formData.accounting_enabled} /><p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Account for shipping charges</p></div>

                    <div><Label>Accounts Receivable Account</Label><input type="text" value={formData.receivables_account_id} onChange={e => setFormData({ ...formData, receivables_account_id: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="e.g., 1200, 1210" disabled={!formData.accounting_enabled} /><p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Account for customer receivables</p></div>

                    <div><Label>Accounts Payable Account</Label><input type="text" value={formData.payables_account_id} onChange={e => setFormData({ ...formData, payables_account_id: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="e.g., 2100, 2110" disabled={!formData.accounting_enabled} /><p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Account for supplier payables</p></div>

                    <div><Label>Inventory Asset Account</Label><input type="text" value={formData.inventory_account_id} onChange={e => setFormData({ ...formData, inventory_account_id: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="e.g., 1300, 1310" disabled={!formData.accounting_enabled} /><p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Account for inventory assets</p></div>

                    <div><Label>Cash Account</Label><input type="text" value={formData.cash_account_id} onChange={e => setFormData({ ...formData, cash_account_id: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="e.g., 1000, 1010" disabled={!formData.accounting_enabled} /><p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Account for cash and cash equivalents</p></div>
                </div>
            </CardContent></Card>

            {/* Info */}
            <Card className="border-blue-200 bg-blue-50"><CardContent className="pt-6">
                <div className="flex gap-3">
                    <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Accounting Integration Info</h3>
                        <p className="text-sm text-blue-800">When accounting is enabled, every sale, purchase, and payment will automatically create journal entries in your general ledger. Make sure to configure your chart of accounts properly before enabling this feature.</p>
                        <p className="text-sm text-blue-800 mt-2">Account IDs should match your existing chart of accounts structure. Use account codes (e.g., 1000, 4100) or account names.</p>
                    </div>
                </div>
            </CardContent></Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading} size="lg"><Save className="h-5 w-5 mr-2" />Save All Settings</Button>
            </div>
        </div>
    )
}
