import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ShoppingCart,
    Package,
    Users,
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    Receipt,
    AlertTriangle,
    Loader2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { useReports, useOrders, useProducts, useCustomers } from '@/hooks'

export default function DashboardPage() {
    const { getSalesStats, getLowStockCount } = useReports()
    const { orders, loading: ordersLoading } = useOrders()
    const { products } = useProducts()
    const { customers } = useCustomers()

    const [salesStats, setSalesStats] = useState({ today: { orders: 0, sales: 0 }, week: { orders: 0, sales: 0 }, month: { orders: 0, sales: 0 } })
    const [lowStockCount, setLowStockCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true)
            const [stats, lowStock] = await Promise.all([
                getSalesStats(),
                getLowStockCount()
            ])
            setSalesStats(stats)
            setLowStockCount(lowStock)
            setLoading(false)
        }
        loadStats()
    }, [getSalesStats, getLowStockCount])

    const stats = [
        {
            title: 'Total Sales Today',
            value: formatCurrency(salesStats.today.sales),
            change: `${salesStats.today.orders} orders`,
            icon: DollarSign,
            color: 'bg-green-500',
        },
        {
            title: 'Orders Today',
            value: salesStats.today.orders.toString(),
            change: `${salesStats.week.orders} this week`,
            icon: Receipt,
            color: 'bg-blue-500',
        },
        {
            title: 'Products',
            value: products.length.toString(),
            change: `${lowStockCount} low stock`,
            icon: Package,
            color: 'bg-purple-500',
        },
        {
            title: 'Customers',
            value: customers.length.toString(),
            change: 'total registered',
            icon: Users,
            color: 'bg-orange-500',
        },
    ]

    const recentOrders = orders.slice(0, 5)

    // Get low stock products
    const lowStockProducts = products
        .filter(p => p.stock?.some(s => s.stock_alert_enabled && s.quantity < s.low_quantity))
        .slice(0, 5)
        .map(p => {
            const stock = p.stock?.find(s => s.stock_alert_enabled) || p.stock?.[0]
            return {
                name: p.name,
                stock: stock?.quantity || 0,
                minStock: stock?.low_quantity || 10
            }
        })

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">
                        Welcome back! Here's an overview of your store.
                    </p>
                </div>
                <Link to="/pos">
                    <Button size="lg" className="gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Open POS
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="relative overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{stat.title}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <div className="flex items-center gap-1 text-sm">
                                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                                        <span className="text-[hsl(var(--muted-foreground))]">{stat.change}</span>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.color}`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Orders</CardTitle>
                        <Link to="/orders">
                            <Button variant="ghost" size="sm">
                                View All
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {ordersLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : recentOrders.length === 0 ? (
                            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                                No orders yet. Start selling!
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between p-4 rounded-lg bg-[hsl(var(--muted))]/50 hover:bg-[hsl(var(--muted))] transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))]">
                                                <Receipt className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{order.code}</p>
                                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                    {order.customer?.first_name ? `${order.customer.first_name} ${order.customer.last_name || ''}` : 'Walk-in'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{formatCurrency(order.total)}</p>
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${order.payment_status === 'paid'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : order.payment_status === 'partially_paid'
                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                            >
                                                {order.payment_status === 'paid' ? 'Paid' : order.payment_status === 'partially_paid' ? 'Partial' : 'Unpaid'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Low Stock Alert */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            Low Stock Alert
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lowStockProducts.length === 0 ? (
                            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                                All products are well stocked!
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {lowStockProducts.map((product, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-sm">{product.name}</p>
                                            <span className="text-sm text-[hsl(var(--destructive))]">
                                                {product.stock} left
                                            </span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-[hsl(var(--muted))]">
                                            <div
                                                className="h-full rounded-full bg-[hsl(var(--destructive))]"
                                                style={{ width: `${Math.min(100, (product.stock / product.minStock) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                            Min. stock: {product.minStock}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link to="/products" className="block mt-4">
                            <Button variant="outline" className="w-full">
                                Manage Inventory
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link to="/pos">
                            <Button variant="outline" className="w-full h-20 flex-col gap-2">
                                <ShoppingCart className="h-6 w-6" />
                                New Sale
                            </Button>
                        </Link>
                        <Link to="/products/create">
                            <Button variant="outline" className="w-full h-20 flex-col gap-2">
                                <Package className="h-6 w-6" />
                                Add Product
                            </Button>
                        </Link>
                        <Link to="/customers">
                            <Button variant="outline" className="w-full h-20 flex-col gap-2">
                                <Users className="h-6 w-6" />
                                New Customer
                            </Button>
                        </Link>
                        <Link to="/reports">
                            <Button variant="outline" className="w-full h-20 flex-col gap-2">
                                <TrendingUp className="h-6 w-6" />
                                View Reports
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
