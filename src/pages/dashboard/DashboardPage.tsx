import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ShoppingCart,
    Package,
    Users,
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Receipt,
    AlertTriangle,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'

// Mock data for dashboard
const stats = [
    {
        title: 'Total Sales Today',
        value: formatCurrency(12500000),
        change: '+12.5%',
        trend: 'up',
        icon: DollarSign,
        color: 'bg-green-500',
    },
    {
        title: 'Orders Today',
        value: '48',
        change: '+8.3%',
        trend: 'up',
        icon: Receipt,
        color: 'bg-blue-500',
    },
    {
        title: 'Products',
        value: '256',
        change: '+3',
        trend: 'up',
        icon: Package,
        color: 'bg-purple-500',
    },
    {
        title: 'Customers',
        value: '1,234',
        change: '+5.2%',
        trend: 'up',
        icon: Users,
        color: 'bg-orange-500',
    },
]

const recentOrders = [
    { id: 'ORD-240111-0001', customer: 'John Doe', total: 250000, status: 'paid', time: '10:30' },
    { id: 'ORD-240111-0002', customer: 'Jane Smith', total: 175000, status: 'paid', time: '10:45' },
    { id: 'ORD-240111-0003', customer: 'Walk-in', total: 85000, status: 'paid', time: '11:00' },
    { id: 'ORD-240111-0004', customer: 'Mike Johnson', total: 520000, status: 'partially_paid', time: '11:15' },
    { id: 'ORD-240111-0005', customer: 'Walk-in', total: 45000, status: 'paid', time: '11:30' },
]

const lowStockProducts = [
    { name: 'Coca Cola 500ml', stock: 5, minStock: 20 },
    { name: 'Indomie Goreng', stock: 12, minStock: 50 },
    { name: 'Aqua 600ml', stock: 8, minStock: 30 },
]

export default function DashboardPage() {
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
                                        {stat.trend === 'up' ? (
                                            <>
                                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                                                <span className="text-green-500">{stat.change}</span>
                                            </>
                                        ) : (
                                            <>
                                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                                                <span className="text-red-500">{stat.change}</span>
                                            </>
                                        )}
                                        <span className="text-[hsl(var(--muted-foreground))]">from yesterday</span>
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
                                            <p className="font-medium">{order.id}</p>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{order.customer}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(order.total)}</p>
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'paid'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}
                                        >
                                            {order.status === 'paid' ? 'Paid' : 'Partial'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                                            style={{ width: `${(product.stock / product.minStock) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                        Min. stock: {product.minStock}
                                    </p>
                                </div>
                            ))}
                        </div>
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
                        <Link to="/reports/sales">
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
