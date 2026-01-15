import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

// Report Pages
import SalesReportPage from './SalesReportPage'
import InventoryReportPage from './InventoryReportPage'
import CustomerReportPage from './CustomerReportPage'
import CashFlowReportPage from './CashFlowReportPage'
import ProfitReportPage from './ProfitReportPage'
import PaymentTypesReportPage from './PaymentTypesReportPage'
import LowStockReportPage from './LowStockReportPage'
import BestProductsReportPage from './BestProductsReportPage'
import YearlyReportPage from './YearlyReportPage'
import SoldStockReportPage from './SoldStockReportPage'
import StockCombinedReportPage from './StockCombinedReportPage'

const reportTabs = [
    { path: '/reports/sales', label: 'Sales', icon: '📊' },
    { path: '/reports/inventory', label: 'Inventory', icon: '📦' },
    { path: '/reports/customers', label: 'Customers', icon: '👥' },
    { path: '/reports/cashflow', label: 'Cash Flow', icon: '💰' },
    { path: '/reports/profit', label: 'Profit', icon: '📈' },
    { path: '/reports/payment-types', label: 'Payment Types', icon: '💳' },
    { path: '/reports/low-stock', label: 'Low Stock', icon: '⚠️' },
    { path: '/reports/best-products', label: 'Best Products', icon: '🏆' },
    { path: '/reports/yearly', label: 'Yearly', icon: '📅' },
    { path: '/reports/sold-stock', label: 'Sold Stock', icon: '🛒' },
    { path: '/reports/stock-combined', label: 'Stock Combined', icon: '📋' },
]

export default function ReportsPage() {
    const location = useLocation()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Reports</h1>

            {/* Tab Navigation */}
            <div className="overflow-x-auto">
                <div className="flex gap-1 p-1 bg-[hsl(var(--muted))] rounded-lg w-fit">
                    {reportTabs.map(tab => (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            className={({ isActive }) => cn(
                                'px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1',
                                isActive || (location.pathname === '/reports' && tab.path === '/reports/sales')
                                    ? 'bg-white shadow text-[hsl(var(--foreground))]'
                                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-white/50'
                            )}
                        >
                            <span>{tab.icon}</span>
                            <span className="hidden md:inline">{tab.label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Report Content */}
            <Routes>
                <Route index element={<SalesReportPage />} />
                <Route path="sales" element={<SalesReportPage />} />
                <Route path="inventory" element={<InventoryReportPage />} />
                <Route path="customers" element={<CustomerReportPage />} />
                <Route path="cashflow" element={<CashFlowReportPage />} />
                <Route path="profit" element={<ProfitReportPage />} />
                <Route path="payment-types" element={<PaymentTypesReportPage />} />
                <Route path="low-stock" element={<LowStockReportPage />} />
                <Route path="best-products" element={<BestProductsReportPage />} />
                <Route path="yearly" element={<YearlyReportPage />} />
                <Route path="sold-stock" element={<SoldStockReportPage />} />
                <Route path="stock-combined" element={<StockCombinedReportPage />} />
            </Routes>
        </div>
    )
}
