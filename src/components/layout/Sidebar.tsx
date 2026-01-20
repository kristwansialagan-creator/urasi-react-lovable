import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/hooks'
import { useLanguage } from '@/contexts/LanguageContext'
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
import { useState, useMemo } from 'react'
import logoFull from '@/assets/logo-full.png'

interface NavItemProps {
    to: string
    icon: React.ReactNode
    label: string
    children?: { to: string; label: string; permission?: string }[]
    permission?: string
}

function NavItem({ to, icon, label, children, permission }: NavItemProps) {
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
    const { profile, signOut, isAdmin, hasPermission, can } = useAuth()
    const { settings } = useSettings()
    const { t } = useLanguage()

    // Filter navigation based on permissions - memoized with language dependency
    const navigation = useMemo(() => {
        // Define navigation with permissions inside useMemo so it updates when language changes
        const fullNavigation: {
            to: string
            icon: React.ReactNode
            label: string
            permission?: string
            children?: { to: string; label: string; permission?: string }[]
        }[] = [
            { 
                to: '/dashboard', 
                icon: <LayoutDashboard className="h-5 w-5" />, 
                label: t('nav.dashboard'),
            },
            { 
                to: '/pos', 
                icon: <ShoppingCart className="h-5 w-5" />, 
                label: t('nav.pos'),
                permission: 'pos.access'
            },
            {
                to: '/products',
                icon: <Package className="h-5 w-5" />,
                label: t('nav.products'),
                permission: 'products.read',
                children: [
                    { to: '/products', label: t('nav.allProducts'), permission: 'products.read' },
                    { to: '/products/create', label: t('nav.addProduct'), permission: 'products.create' },
                    { to: '/products/categories', label: t('nav.categories'), permission: 'categories.read' },
                    { to: '/products/stock-adjustment', label: t('nav.stockAdjustment'), permission: 'products.update' },
                ],
            },
            {
                to: '/orders',
                icon: <Receipt className="h-5 w-5" />,
                label: t('nav.orders'),
                permission: 'orders.read',
                children: [
                    { to: '/orders', label: t('nav.allOrders'), permission: 'orders.read' },
                    { to: '/installments', label: t('nav.instalments'), permission: 'orders.read' },
                ],
            },
            {
                to: '/customers',
                icon: <Users className="h-5 w-5" />,
                label: t('nav.customers'),
                permission: 'customers.read',
                children: [
                    { to: '/customers', label: t('nav.allCustomers'), permission: 'customers.read' },
                    { to: '/customers/groups', label: t('nav.customerGroups'), permission: 'customers.read' },
                ],
            },
            {
                to: '/procurements',
                icon: <Truck className="h-5 w-5" />,
                label: t('nav.procurements'),
                permission: 'procurements.read',
                children: [
                    { to: '/procurements', label: t('nav.allProcurements'), permission: 'procurements.read' },
                    { to: '/procurements/providers', label: t('nav.providers'), permission: 'procurements.read' },
                ],
            },
            {
                to: '/registers',
                icon: <Calculator className="h-5 w-5" />,
                label: t('nav.registers'),
                permission: 'registers.read',
            },
            {
                to: '/transactions',
                icon: <Wallet className="h-5 w-5" />,
                label: t('nav.transactions'),
                permission: 'transactions.read',
            },
            {
                to: '/reports',
                icon: <BarChart3 className="h-5 w-5" />,
                label: t('nav.reports'),
                permission: 'reports.read',
                children: [
                    { to: '/reports/sales', label: t('nav.sales'), permission: 'reports.read' },
                    { to: '/reports/inventory', label: t('nav.inventory'), permission: 'reports.read' },
                    { to: '/reports/customers', label: t('nav.customers'), permission: 'reports.read' },
                    { to: '/reports/cashflow', label: t('nav.cashFlow'), permission: 'reports.read' },
                    { to: '/reports/profit', label: t('nav.profit'), permission: 'reports.read' },
                    { to: '/reports/payment-types', label: t('nav.paymentTypes'), permission: 'reports.read' },
                    { to: '/reports/low-stock', label: t('nav.lowStock'), permission: 'reports.read' },
                    { to: '/reports/best-products', label: t('nav.bestProducts'), permission: 'reports.read' },
                    { to: '/reports/yearly', label: t('nav.yearly'), permission: 'reports.read' },
                ],
            },
            { 
                to: '/coupons', 
                icon: <Tag className="h-5 w-5" />, 
                label: t('nav.coupons'),
                permission: 'coupons.read'
            },
            { 
                to: '/rewards', 
                icon: <Gift className="h-5 w-5" />, 
                label: t('nav.rewards'),
                permission: 'rewards.read'
            },
            { 
                to: '/media', 
                icon: <FileText className="h-5 w-5" />, 
                label: t('nav.mediaLibrary'),
                permission: 'media.read'
            },
            { 
                to: '/settings', 
                icon: <Settings className="h-5 w-5" />, 
                label: t('nav.settings'),
                permission: 'admin'
            },
        ]

        return fullNavigation.filter(item => {
            // If no permission required, show to everyone
            if (!item.permission) return true
            
            // Admin has access to everything
            if (isAdmin) return true
            
            // Special case for admin-only items
            if (item.permission === 'admin') return isAdmin
            
            // Check specific permission
            return hasPermission(item.permission)
        }).map(item => {
            // Filter children based on permissions
            if (item.children) {
                const filteredChildren = item.children.filter(child => {
                    if (!child.permission) return true
                    if (isAdmin) return true
                    return hasPermission(child.permission)
                })
                return { ...item, children: filteredChildren.length > 0 ? filteredChildren : undefined }
            }
            return item
        })
    }, [isAdmin, hasPermission, t])

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-accent))]">
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center justify-center px-4 py-5 border-b border-[hsl(var(--sidebar-accent))]">
                    <img
                        src={settings?.logo_url || logoFull}
                        alt={settings?.store_name || "URASI"}
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
                                {isAdmin ? 'Admin' : (profile?.role || 'User')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        {t('auth.signOut')}
                    </button>
                </div>
            </div>
        </aside>
    )
}