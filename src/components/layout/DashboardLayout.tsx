import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import NotificationBell from '@/components/notifications/NotificationBell'
import { useIsMobile } from '@/hooks/use-mobile'
import AIChatWidget from '@/components/ai-chat/AIChatWidget'

export function DashboardLayout() {
    const isMobile = useIsMobile()
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

    // Update sidebar state when screen size changes
    useEffect(() => {
        setSidebarOpen(!isMobile)
    }, [isMobile])

    const navigate = useNavigate() // Added

    // Added
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const term = (e.target as HTMLInputElement).value
            if (term.trim()) {
                navigate(`/products?search=${encodeURIComponent(term.trim())}`)
            }
        }
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            {/* Sidebar */}
            <div className={cn('transition-transform duration-300 relative z-40', !sidebarOpen && '-translate-x-full')}>
                <Sidebar />
            </div>

            {/* Mobile Backdrop */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={cn('transition-all duration-300', sidebarOpen && !isMobile ? 'ml-64' : 'ml-0')}>
                {/* Top Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60 px-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="relative w-72 hidden md:block">
                            <Input
                                type="search"
                                placeholder="Search products, orders, customers..."
                                icon={<Search className="h-4 w-4" />}
                                className="bg-[hsl(var(--muted))]"
                                onKeyDown={handleSearch} // Modified
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <NotificationBell />
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>

            {/* AI Chat Widget - Only for authenticated users */}
            <AIChatWidget />
        </div>
    )
}
