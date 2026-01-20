import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/layout'
import AIChatWidget from '@/components/ai-chat/AIChatWidget'
import { Loader2 } from 'lucide-react'

// Lazy Load Pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const POSPage = lazy(() => import('@/pages/pos/POSPage'))
const ProductsPage = lazy(() => import('@/pages/products/ProductsPage'))
const ProductCreatePage = lazy(() => import('@/pages/products/ProductCreatePage'))
const CategoriesPage = lazy(() => import('@/pages/products/CategoriesPage'))
const StockAdjustmentPage = lazy(() => import('@/pages/products/StockAdjustmentPage'))
const PrintLabelsPage = lazy(() => import('@/pages/products/PrintLabelsPage'))
const OrdersPage = lazy(() => import('@/pages/orders/OrdersPage'))
const OrderDetailsPage = lazy(() => import('@/pages/orders/OrderDetailsPage'))
const OrderRefundPage = lazy(() => import('@/pages/orders/OrderRefundPage'))
const OrderPaymentPage = lazy(() => import('@/pages/orders/OrderPaymentPage'))
const InstallmentsPage = lazy(() => import('@/pages/installments/InstallmentsPage'))
const InvoicePage = lazy(() => import('@/pages/orders/InvoicePage'))
const CustomersPage = lazy(() => import('@/pages/customers/CustomersPage'))
const RegistersPage = lazy(() => import('@/pages/registers/RegistersPage'))
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const ProcurementPage = lazy(() => import('@/pages/procurement/ProcurementPage'))
const ProductGroupsPage = lazy(() => import('@/pages/procurement/ProductGroupsPage'))
const ProcurementProductsPage = lazy(() => import('@/pages/procurement/ProcurementProductsPage'))
const CouponsPage = lazy(() => import('@/pages/marketing/CouponsPage'))
const TransactionsPage = lazy(() => import('@/pages/transactions/TransactionsPage'))
const MediaLibraryPage = lazy(() => import('@/pages/media/MediaLibraryPage'))
const RewardsPage = lazy(() => import('@/pages/rewards/RewardsPage'))
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'))
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage'))
const DataManagementPage = lazy(() => import('@/pages/tools/DataManagementPage'))
const CustomerGroupsPage = lazy(() => import('@/pages/customers/CustomerGroupsPage'))
const ProvidersPage = lazy(() => import('@/pages/procurement/ProvidersPage'))
const BulkEditorPage = lazy(() => import('@/pages/tools/BulkEditorPage'))
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'))
const JournalEntriesPage = lazy(() => import('@/pages/accounting/JournalEntriesPage'))
const MobileScannerPage = lazy(() => import('@/pages/pos/MobileScannerPage'))

// Loading Component
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
)

function App() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/unauthorized" element={<UnauthorizedPage />} />
                        <Route path="/scanner/:sessionId" element={<MobileScannerPage />} />

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
                            <Route path="/products/edit/:id" element={<ProductCreatePage />} />
                            <Route path="/products/categories" element={<CategoriesPage />} />
                            <Route path="/products/stock-adjustment" element={<StockAdjustmentPage />} />
                            <Route path="/products/print-labels" element={<PrintLabelsPage />} />

                            {/* Orders */}
                            <Route path="/orders" element={<OrdersPage />} />
                            <Route path="/orders/:id" element={<OrderDetailsPage />} />
                            <Route path="/orders/:id/refund" element={<OrderRefundPage />} />
                            <Route path="/orders/:id/payment" element={<OrderPaymentPage />} />
                            <Route path="/installments" element={<InstallmentsPage />} />
                            <Route path="/orders/invoice/:id" element={<InvoicePage />} />

                            {/* Customers */}
                            <Route path="/customers" element={<CustomersPage />} />
                            <Route path="/customers/groups" element={<CustomerGroupsPage />} />

                            {/* Registers */}
                            <Route path="/registers" element={<RegistersPage />} />

                            {/* Reports */}
                            <Route path="/reports/*" element={<ReportsPage />} />

                            {/* Procurement */}
                            <Route path="/procurements" element={<ProcurementPage />} />
                            <Route path="/procurements/providers" element={<ProvidersPage />} />
                            <Route path="/procurement/groups" element={<ProductGroupsPage />} />
                            <Route path="/procurement/groups/:groupId/products" element={<ProcurementProductsPage />} />

                            {/* Marketing */}
                            <Route path="/coupons" element={<CouponsPage />} />

                            {/* Transactions / Accounting */}
                            <Route path="/transactions" element={<TransactionsPage />} />
                            <Route path="/accounting/journal-entries" element={<JournalEntriesPage />} />

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
                            <Route path="/tools/bulk-editor" element={<BulkEditorPage />} />

                            {/* Settings */}
                            <Route path="/settings/*" element={<SettingsPage />} />
                        </Route>

                        {/* Redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </LanguageProvider>
    )
}

export default App
