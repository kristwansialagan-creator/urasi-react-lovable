import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Bell, Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            {/* Sidebar */}
            <div className={cn('transition-transform duration-300', !sidebarOpen && '-translate-x-full')}>
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className={cn('transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-0')}>
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
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-[hsl(var(--destructive))] rounded-full"></span>
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
