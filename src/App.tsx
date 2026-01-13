import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout'

// Pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import POSPage from '@/pages/pos/POSPage'
import ProductsPage from '@/pages/products/ProductsPage'
import ProductCreatePage from '@/pages/products/ProductCreatePage'
import CategoriesPage from '@/pages/products/CategoriesPage'
import OrdersPage from '@/pages/orders/OrdersPage'
import CustomersPage from '@/pages/customers/CustomersPage'
import RegistersPage from '@/pages/registers/RegistersPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import SettingsPage from '@/pages/settings/SettingsPage'

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

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

                    {/* Orders */}
                    <Route path="/orders" element={<OrdersPage />} />

                    {/* Customers */}
                    <Route path="/customers" element={<CustomersPage />} />

                    {/* Registers */}
                    <Route path="/registers" element={<RegistersPage />} />

                    {/* Reports */}
                    <Route path="/reports/*" element={<ReportsPage />} />

                    {/* Settings */}
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    )
}

export default App
