import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useReports } from '@/hooks'
import { TransactionCard } from '@/components/dashboard/TransactionCard'
import { SaleCard } from '@/components/dashboard/SaleCard'
import { OrdersSummary } from '@/components/dashboard/OrdersSummary'
import { OrdersChart } from '@/components/dashboard/OrdersChart'
import { BestCustomers } from '@/components/dashboard/BestCustomers'

export default function DashboardPage() {
    const { getSalesStats } = useReports()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true)
            await getSalesStats()
            setLoading(false)
        }
        loadStats()
    }, [getSalesStats])

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
                <Link to="/app/pos">
                    <Button size="lg" className="gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Open POS
                    </Button>
                </Link>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <TransactionCard />
                <SaleCard />
                <OrdersSummary />
                <Card>
                    <CardContent className="p-6">
                        <Link to="/app/procurement/groups" className="block">
                            <Button variant="outline" className="w-full h-full min-h-[100px] flex flex-col gap-2">
                                <span className="text-lg font-bold">Procurement</span>
                                <span className="text-sm text-[hsl(var(--muted-foreground))]">Manage Groups</span>
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <OrdersChart />
                </div>
                <div>
                    <BestCustomers />
                </div>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <Link to="/app/pos" className="block">
                            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                                <ShoppingCart className="h-6 w-6" />
                                <span className="text-sm font-semibold">New Sale</span>
                            </Button>
                        </Link>
                        <Link to="/app/products/create" className="block">
                            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                                <span className="text-2xl">📦</span>
                                <span className="text-sm font-semibold">Add Product</span>
                            </Button>
                        </Link>
                        <Link to="/app/customers" className="block">
                            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                                <span className="text-2xl">👥</span>
                                <span className="text-sm font-semibold">Customers</span>
                            </Button>
                        </Link>
                        <Link to="/app/orders" className="block">
                            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                                <span className="text-2xl">🧾</span>
                                <span className="text-sm font-semibold">Orders</span>
                            </Button>
                        </Link>
                        <Link to="/app/reports" className="block">
                            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                                <span className="text-2xl">📊</span>
                                <span className="text-sm font-semibold">Reports</span>
                            </Button>
                        </Link>
                        <Link to="/app/settings" className="block">
                            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                                <span className="text-2xl">⚙️</span>
                                <span className="text-sm font-semibold">Settings</span>
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
