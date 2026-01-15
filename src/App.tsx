import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/layout'

// Pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import POSPage from '@/pages/pos/POSPage'
import ProductsPage from '@/pages/products/ProductsPage'
import ProductCreatePage from '@/pages/products/ProductCreatePage'
import CategoriesPage from '@/pages/products/CategoriesPage'
import StockAdjustmentPage from '@/pages/products/StockAdjustmentPage'
import PrintLabelsPage from '@/pages/products/PrintLabelsPage'
import OrdersPage from '@/pages/orders/OrdersPage'
import InstalmentsPage from '@/pages/orders/InstalmentsPage'
import InvoicePage from '@/pages/orders/InvoicePage'
import CustomersPage from '@/pages/customers/CustomersPage'
import RegistersPage from '@/pages/registers/RegistersPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import ProcurementPage from '@/pages/procurement/ProcurementPage'
import CouponsPage from '@/pages/marketing/CouponsPage'
import TransactionsPage from '@/pages/transactions/TransactionsPage'
import MediaLibraryPage from '@/pages/media/MediaLibraryPage'
import RewardsPage from '@/pages/rewards/RewardsPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import NotificationsPage from '@/pages/notifications/NotificationsPage'
import DataManagementPage from '@/pages/tools/DataManagementPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Protected Routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/pos" element={<POSPage />} />

                    {/* Products */}
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/create" element={<ProductCreatePage />} />
                    <Route path="/products/categories" element={<CategoriesPage />} />
                    <Route path="/products/stock-adjustment" element={<StockAdjustmentPage />} />
                    <Route path="/products/print-labels" element={<PrintLabelsPage />} />

                    {/* Orders */}
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/instalments" element={<InstalmentsPage />} />
                    <Route path="/orders/invoice/:id" element={<InvoicePage />} />

                    {/* Customers */}
                    <Route path="/customers" element={<CustomersPage />} />

                    {/* Registers */}
                    <Route path="/registers" element={<RegistersPage />} />

                    {/* Reports - catch-all for sub-reports */}
                    <Route path="/reports/*" element={<ReportsPage />} />

                    {/* Procurement */}
                    <Route path="/procurements" element={<ProcurementPage />} />

                    {/* Marketing */}
                    <Route path="/coupons" element={<CouponsPage />} />

                    {/* Transactions / Accounting */}
                    <Route path="/transactions" element={<TransactionsPage />} />

                    {/* Media */}
                    <Route path="/media" element={<MediaLibraryPage />} />

                    {/* Rewards */}
                    <Route path="/rewards" element={<RewardsPage />} />

                    {/* Profile */}
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* Notifications */}
                    <Route path="/notifications" element={<NotificationsPage />} />

                    {/* Tools */}
                    <Route path="/tools/data-management" element={<DataManagementPage />} />

                    {/* Settings */}
                    <Route path="/settings/*" element={<SettingsPage />} />
                </Route>

                {/* Redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    )
}

export default App
