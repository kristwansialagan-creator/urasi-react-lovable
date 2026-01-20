import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/layout'
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

                        {/* Protected Routes - Base authenticated */}
                        <Route
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout />
                                </ProtectedRoute>
                            }
                        >
                            {/* Dashboard - accessible to all authenticated users */}
                            <Route path="/dashboard" element={<DashboardPage />} />
                            
                            {/* POS - requires pos permission or admin */}
                            <Route path="/pos" element={
                                <ProtectedRoute requiredPermission="pos.access">
                                    <POSPage />
                                </ProtectedRoute>
                            } />

                            {/* Products - requires products permission */}
                            <Route path="/products" element={
                                <ProtectedRoute requiredPermission="products.read">
                                    <ProductsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/products/create" element={
                                <ProtectedRoute requiredPermission="products.create">
                                    <ProductCreatePage />
                                </ProtectedRoute>
                            } />
                            <Route path="/products/edit/:id" element={
                                <ProtectedRoute requiredPermission="products.update">
                                    <ProductCreatePage />
                                </ProtectedRoute>
                            } />
                            <Route path="/products/categories" element={
                                <ProtectedRoute requiredPermission="categories.read">
                                    <CategoriesPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/products/stock-adjustment" element={
                                <ProtectedRoute requiredPermission="products.update">
                                    <StockAdjustmentPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/products/print-labels" element={
                                <ProtectedRoute requiredPermission="products.read">
                                    <PrintLabelsPage />
                                </ProtectedRoute>
                            } />

                            {/* Orders - requires orders permission */}
                            <Route path="/orders" element={
                                <ProtectedRoute requiredPermission="orders.read">
                                    <OrdersPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/orders/:id" element={
                                <ProtectedRoute requiredPermission="orders.read">
                                    <OrderDetailsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/orders/:id/refund" element={
                                <ProtectedRoute requiredPermission="orders.refund">
                                    <OrderRefundPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/orders/:id/payment" element={
                                <ProtectedRoute requiredPermission="orders.update">
                                    <OrderPaymentPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/installments" element={
                                <ProtectedRoute requiredPermission="orders.read">
                                    <InstallmentsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/orders/invoice/:id" element={
                                <ProtectedRoute requiredPermission="orders.read">
                                    <InvoicePage />
                                </ProtectedRoute>
                            } />

                            {/* Customers - requires customers permission */}
                            <Route path="/customers" element={
                                <ProtectedRoute requiredPermission="customers.read">
                                    <CustomersPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/customers/groups" element={
                                <ProtectedRoute requiredPermission="customers.read">
                                    <CustomerGroupsPage />
                                </ProtectedRoute>
                            } />

                            {/* Registers - requires registers permission */}
                            <Route path="/registers" element={
                                <ProtectedRoute requiredPermission="registers.read">
                                    <RegistersPage />
                                </ProtectedRoute>
                            } />

                            {/* Reports - requires reports permission */}
                            <Route path="/reports/*" element={
                                <ProtectedRoute requiredPermission="reports.read">
                                    <ReportsPage />
                                </ProtectedRoute>
                            } />

                            {/* Procurement - requires procurement permission */}
                            <Route path="/procurements" element={
                                <ProtectedRoute requiredPermission="procurements.read">
                                    <ProcurementPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/procurements/providers" element={
                                <ProtectedRoute requiredPermission="procurements.read">
                                    <ProvidersPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/procurement/groups" element={
                                <ProtectedRoute requiredPermission="procurements.read">
                                    <ProductGroupsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/procurement/groups/:groupId/products" element={
                                <ProtectedRoute requiredPermission="procurements.read">
                                    <ProcurementProductsPage />
                                </ProtectedRoute>
                            } />

                            {/* Marketing - requires marketing permission */}
                            <Route path="/coupons" element={
                                <ProtectedRoute requiredPermission="coupons.read">
                                    <CouponsPage />
                                </ProtectedRoute>
                            } />

                            {/* Transactions / Accounting - requires accounting permission */}
                            <Route path="/transactions" element={
                                <ProtectedRoute requiredPermission="transactions.read">
                                    <TransactionsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/accounting/journal-entries" element={
                                <ProtectedRoute requiredPermission="accounting.read">
                                    <JournalEntriesPage />
                                </ProtectedRoute>
                            } />

                            {/* Media - requires media permission */}
                            <Route path="/media" element={
                                <ProtectedRoute requiredPermission="media.read">
                                    <MediaLibraryPage />
                                </ProtectedRoute>
                            } />

                            {/* Rewards - requires rewards permission */}
                            <Route path="/rewards" element={
                                <ProtectedRoute requiredPermission="rewards.read">
                                    <RewardsPage />
                                </ProtectedRoute>
                            } />

                            {/* Profile - accessible to all authenticated users */}
                            <Route path="/profile" element={<ProfilePage />} />

                            {/* Notifications - accessible to all authenticated users */}
                            <Route path="/notifications" element={<NotificationsPage />} />

                            {/* Tools - admin only */}
                            <Route path="/tools/data-management" element={
                                <ProtectedRoute requireAdmin>
                                    <DataManagementPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/tools/bulk-editor" element={
                                <ProtectedRoute requireAdmin>
                                    <BulkEditorPage />
                                </ProtectedRoute>
                            } />

                            {/* Settings - admin only */}
                            <Route path="/settings/*" element={
                                <ProtectedRoute requireAdmin>
                                    <SettingsPage />
                                </ProtectedRoute>
                            } />
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