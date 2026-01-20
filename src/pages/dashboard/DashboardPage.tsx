import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ShoppingCart,
    Loader2,
    Package,
    Users,
    Receipt,
    BarChart3,
    Settings,
    Plus,
    Truck,
    Tag,
    Calculator
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { TransactionCard } from '@/components/dashboard/TransactionCard'
import { SaleCard } from '@/components/dashboard/SaleCard'
import { MonthlySalesCard } from '@/components/dashboard/MonthlySalesCard'
import { OrdersChart } from '@/components/dashboard/OrdersChart'
import { BestCustomers } from '@/components/dashboard/BestCustomers'
import { useAuth } from '@/contexts/AuthContext'

interface QuickAction {
    to: string
    icon: React.ReactNode
    label: string
    description: string
}

export default function DashboardPage() {
    const { profile } = useAuth()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Just set loading to false after mount
        setLoading(false)
    }, [])

    const quickActions: QuickAction[] = [
        {
            to: '/pos',
            icon: <ShoppingCart className="h-6 w-6" />,
            label: 'Buka POS',
            description: 'Mulai transaksi baru'
        },
        {
            to: '/products/create',
            icon: <Plus className="h-6 w-6" />,
            label: 'Tambah Produk',
            description: 'Daftarkan produk baru'
        },
        {
            to: '/customers',
            icon: <Users className="h-6 w-6" />,
            label: 'Pelanggan',
            description: 'Kelola data pelanggan'
        },
        {
            to: '/orders',
            icon: <Receipt className="h-6 w-6" />,
            label: 'Pesanan',
            description: 'Lihat semua pesanan'
        },
        {
            to: '/reports/sales',
            icon: <BarChart3 className="h-6 w-6" />,
            label: 'Laporan',
            description: 'Analisis penjualan'
        },
        {
            to: '/settings',
            icon: <Settings className="h-6 w-6" />,
            label: 'Pengaturan',
            description: 'Konfigurasi sistem'
        },
    ]

    const additionalActions: QuickAction[] = [
        {
            to: '/products',
            icon: <Package className="h-5 w-5" />,
            label: 'Produk',
            description: 'Kelola inventaris'
        },
        {
            to: '/procurements',
            icon: <Truck className="h-5 w-5" />,
            label: 'Pengadaan',
            description: 'Kelola pembelian'
        },
        {
            to: '/registers',
            icon: <Calculator className="h-5 w-5" />,
            label: 'Register',
            description: 'Kelola kasir'
        },
        {
            to: '/coupons',
            icon: <Tag className="h-5 w-5" />,
            label: 'Kupon',
            description: 'Kelola diskon'
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Compact Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Selamat datang kembali, {profile?.first_name || profile?.username || 'User'}!
                    </p>
                </div>
                <Link to="/pos">
                    <Button className="gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Buka POS
                    </Button>
                </Link>
            </div>

            {/* Compact Stats and Quick Actions Row */}
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TransactionCard />
                <SaleCard />
                <MonthlySalesCard />
            </div>

            {/* Compact Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                    <OrdersChart />
                </div>
                <div className="lg:col-span-2">
                    <BestCustomers />
                </div>
            </div>

            {/* Compact Additional Actions */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Menu Lainnya</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {[...quickActions.slice(4), ...additionalActions].map((action) => (
                            <Link key={action.to} to={action.to} className="block">
                                <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-center">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        {action.icon}
                                    </div>
                                    <div>
                                        <p className="font-medium text-xs">{action.label}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}