import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Settings as SettingsIcon, DollarSign, Ruler, Globe, Monitor, FileText, Receipt, Users, Wallet, Tag, Info } from 'lucide-react'
import GeneralSettingsPage from './GeneralSettingsPage'
import TaxesPage from './TaxesPage'
import UnitsPage from './UnitsPage'
import PosSettingsPage from './PosSettingsPage'
import InvoiceSettingsPage from './InvoiceSettingsPage'
import OrdersSettingsPage from './OrdersSettingsPage'
import CustomersSettingsPage from './CustomersSettingsPage'
import AccountingSettingsPage from './AccountingSettingsPage'
import ReceiptTemplatePage from './ReceiptTemplatePage'
import LabelTemplatesPage from './LabelTemplatesPage'
import SystemInfoPage from './SystemInfoPage'

export default function SettingsPage() {
    const navigate = useNavigate()
    const location = useLocation()

    const settingsItems = [
        { path: '/settings/general', name: 'General Settings', icon: <Globe className="h-5 w-5" />, desc: 'Store info, currency, timezone' },
        { path: '/settings/pos', name: 'POS Settings', icon: <Monitor className="h-5 w-5" />, desc: 'POS configuration' },
        { path: '/settings/taxes', name: 'Tax Configuration', icon: <DollarSign className="h-5 w-5" />, desc: 'Manage taxes and tax groups' },
        { path: '/settings/units', name: 'Units Management', icon: <Ruler className="h-5 w-5" />, desc: 'Product units and conversions' },
        { path: '/settings/invoice', name: 'Invoice Settings', icon: <FileText className="h-5 w-5" />, desc: 'Invoice templates and branding' },
        { path: '/settings/receipt', name: 'Receipt Template', icon: <Receipt className="h-5 w-5" />, desc: 'Customize receipt printing' },
        { path: '/settings/orders', name: 'Orders Settings', icon: <Receipt className="h-5 w-5" />, desc: 'Order configuration' },
        { path: '/settings/customers', name: 'Customer Settings', icon: <Users className="h-5 w-5" />, desc: 'Customer preferences' },
        { path: '/settings/accounting', name: 'Accounting Settings', icon: <Wallet className="h-5 w-5" />, desc: 'Chart of accounts & accounting' },
        { path: '/settings/labels', name: 'Label Templates', icon: <Tag className="h-5 w-5" />, desc: 'Manage label templates' },
        { path: '/settings/system', name: 'System Information', icon: <Info className="h-5 w-5" />, desc: 'Version, database, requirements' }
    ]

    // If at root /settings, show navigation
    if (location.pathname === '/settings' || location.pathname === '/settings/') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <SettingsIcon className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">Settings</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {settingsItems.map(item => (
                        <Card
                            key={item.path}
                            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-[hsl(var(--primary))]"
                            onClick={() => navigate(item.path)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-[hsl(var(--primary))] text-white rounded-lg">
                                        {item.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.desc}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    // Otherwise render the sub-routes
    return (
        <Routes>
            <Route path="/general" element={<GeneralSettingsPage />} />
            <Route path="/pos" element={<PosSettingsPage />} />
            <Route path="/taxes" element={<TaxesPage />} />
            <Route path="/units" element={<UnitsPage />} />
            <Route path="/invoice" element={<InvoiceSettingsPage />} />
            <Route path="/receipt" element={<ReceiptTemplatePage />} />
            <Route path="/orders" element={<OrdersSettingsPage />} />
            <Route path="/customers" element={<CustomersSettingsPage />} />
            <Route path="/accounting" element={<AccountingSettingsPage />} />
            <Route path="/labels" element={<LabelTemplatesPage />} />
            <Route path="/system" element={<SystemInfoPage />} />
        </Routes>
    )
}
