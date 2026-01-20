import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Search, Menu, PanelLeftClose, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import NotificationBell from '@/components/notifications/NotificationBell'
import { useIsMobile } from '@/hooks/use-mobile'
import AIChatWidget from '@/components/ai-chat/AIChatWidget'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

export function DashboardLayout() {
    const isMobile = useIsMobile()
    const location = useLocation()
    const navigate = useNavigate()
    
    // Auto-hide sidebar on POS page
    const isPOSPage = location.pathname === '/pos'
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile && !isPOSPage)
    const [autoHide, setAutoHide] = useState(() => {
        const saved = localStorage.getItem('sidebar-auto-hide')
        return saved ? JSON.parse(saved) : true
    })

    // Update sidebar state when screen size or route changes
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false)
        } else if (autoHide && isPOSPage) {
            setSidebarOpen(false)
        } else if (!isPOSPage) {
            setSidebarOpen(true)
        }
    }, [isMobile, isPOSPage, autoHide])

    // Save auto-hide preference
    useEffect(() => {
        localStorage.setItem('sidebar-auto-hide', JSON.stringify(autoHide))
    }, [autoHide])

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const term = (e.target as HTMLInputElement).value
            if (term.trim()) {
                navigate(`/products?search=${encodeURIComponent(term.trim())}`)
            }
        }
    }

    const toggleAutoHide = () => {
        setAutoHide(!autoHide)
    }

    return (
        <div className="flex h-screen bg-[hsl(var(--background))]">
            {/* Sidebar */}
            <aside className={cn(
                'fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                <Sidebar />
            </aside>

            {/* Mobile Backdrop */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={cn(
                'flex-1 flex flex-col min-w-0 transition-all duration-300',
                sidebarOpen && !isMobile ? 'ml-64' : 'ml-0'
            )}>
                {/* Top Header */}
                <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60 px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        {/* Toggle sidebar button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        
                        {/* Auto-hide toggle - only visible on desktop */}
                        {!isMobile && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={toggleAutoHide}
                                            className={cn(
                                                "h-8 w-8",
                                                autoHide ? "text-primary" : "text-muted-foreground"
                                            )}
                                        >
                                            {autoHide ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <p className="text-xs">{autoHide ? 'Auto-hide ON (POS)' : 'Auto-hide OFF'}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        <div className="relative w-72 hidden md:block">
                            <Input
                                type="search"
                                placeholder="Search products, orders, customers..."
                                icon={<Search className="h-4 w-4" />}
                                className="bg-[hsl(var(--muted))]"
                                onKeyDown={handleSearch}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <NotificationBell />
                    </div>
                </header>

                {/* Page Content - Scrollable */}
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>

            {/* AI Chat Widget - Only for authenticated users */}
            <AIChatWidget />
        </div>
    )
}
