import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Receipt,
    Settings,
    BarChart3,
    Wallet,
    Truck,
    Tag,
    Gift,
    FileText,
    Calculator,
    ChevronDown,
    LogOut,
} from 'lucide-react'
import { useState } from 'react'
import logoFull from '@/assets/logo-full.png'

interface NavItemProps {
    to: string
    icon: React.ReactNode
    label: string
    children?: { to: string; label: string }[]
}

function NavItem({ to, icon, label, children }: NavItemProps) {
    const location = useLocation()
    const [isOpen, setIsOpen] = useState(false)
    const isActive = location.pathname === to || location.pathname.startsWith(to + '/')

    if (children) {
        return (
            <div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                            ? 'bg-[hsl(var(--sidebar-gold))]/20 text-[hsl(var(--sidebar-gold))]'
                            : 'text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]'
                    )}
                >
                    {icon}
                    <span className="flex-1 text-left">{label}</span>
                    <ChevronDown
                        className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
                    />
                </button>
                {isOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                        {children.map((child) => (
                            <NavLink
                                key={child.to}
                                to={child.to}
                                className={({ isActive }) =>
                                    cn(
                                        'block px-3 py-2 rounded-lg text-sm transition-colors',
                                        isActive
                                            ? 'bg-[hsl(var(--sidebar-gold))]/20 text-[hsl(var(--sidebar-gold))]'
                                            : 'text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]'
                                    )
                                }
                            >
                                {child.label}
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                        ? 'bg-[hsl(var(--sidebar-gold))]/20 text-[hsl(var(--sidebar-gold))]'
                        : 'text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]'
                )
            }
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    )
}

export function Sidebar() {
    const { profile, signOut } = useAuth()

    const navigation = [
        { to: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
        { to: '/pos', icon: <ShoppingCart className="h-5 w-5" />, label: 'POS' },
        {
            to: '/products',
            icon: <Package className="h-5 w-5" />,
            label: 'Products',
            children: [
                { to: '/products', label: 'All Products' },
                { to: '/products/create', label: 'Add Product' },
                { to: '/products/categories', label: 'Categories' },
                { to: '/products/stock-adjustment', label: 'Stock Adjustment' },
            ],
        },
        {
            to: '/orders',
            icon: <Receipt className="h-5 w-5" />,
            label: 'Orders',
            children: [
                { to: '/orders', label: 'All Orders' },
                { to: '/orders/instalments', label: 'Instalments' },
            ],
        },
        {
            to: '/customers',
            icon: <Users className="h-5 w-5" />,
            label: 'Customers',
            children: [
                { to: '/customers', label: 'All Customers' },
                { to: '/customers/groups', label: 'Customer Groups' },
            ],
        },
        {
            to: '/procurements',
            icon: <Truck className="h-5 w-5" />,
            label: 'Procurements',
            children: [
                { to: '/procurements', label: 'All Procurements' },
                { to: '/procurements/providers', label: 'Providers' },
            ],
        },
        {
            to: '/registers',
            icon: <Calculator className="h-5 w-5" />,
            label: 'Registers',
        },
        {
            to: '/transactions',
            icon: <Wallet className="h-5 w-5" />,
            label: 'Transactions',
        },
        {
            to: '/reports',
            icon: <BarChart3 className="h-5 w-5" />,
            label: 'Reports',
            children: [
                { to: '/reports/sales', label: 'Sales' },
                { to: '/reports/inventory', label: 'Inventory' },
                { to: '/reports/customers', label: 'Customers' },
                { to: '/reports/cashflow', label: 'Cash Flow' },
                { to: '/reports/profit', label: 'Profit' },
                { to: '/reports/payment-types', label: 'Payment Types' },
                { to: '/reports/low-stock', label: 'Low Stock' },
                { to: '/reports/best-products', label: 'Best Products' },
                { to: '/reports/yearly', label: 'Yearly' },
            ],
        },
        { to: '/coupons', icon: <Tag className="h-5 w-5" />, label: 'Coupons' },
        { to: '/rewards', icon: <Gift className="h-5 w-5" />, label: 'Rewards' },
        { to: '/media', icon: <FileText className="h-5 w-5" />, label: 'Media Library' },
        { to: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
    ]

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-accent))]">
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center justify-center px-4 py-5 border-b border-[hsl(var(--sidebar-accent))]">
                    <img 
                        src={logoFull} 
                        alt="URASI" 
                        className="h-10 w-auto brightness-0 invert"
                    />
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {navigation.map((item) => (
                        <NavItem key={item.to} {...item} />
                    ))}
                </nav>

                {/* User Section */}
                <div className="border-t border-[hsl(var(--sidebar-accent))] p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--sidebar-gold))]/20 flex items-center justify-center text-[hsl(var(--sidebar-gold))] font-semibold">
                            {profile?.username?.[0]?.toUpperCase() || profile?.first_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[hsl(var(--sidebar-foreground))] truncate">
                                {profile?.first_name || profile?.username || 'User'}
                            </p>
                            <p className="text-xs text-[hsl(var(--sidebar-foreground))]/60 capitalize">
                                {profile?.role || 'Guest'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    )
}