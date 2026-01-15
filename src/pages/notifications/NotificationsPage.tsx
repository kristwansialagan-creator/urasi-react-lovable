import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle, AlertCircle, Info, AlertTriangle, Trash2, Check } from 'lucide-react'
import { useNotifications } from '@/hooks'

export default function NotificationsPage() {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications()
    const [filter, setFilter] = useState<'all' | 'unread' | 'info' | 'success' | 'warning' | 'error'>('all')

    const filtered = notifications.filter(n => {
        if (filter === 'unread') return !n.read
        if (filter === 'all') return true
        return n.type === filter
    })

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
            default: return <Info className="h-5 w-5 text-blue-500" />
        }
    }

    const getColorClass = (type: string) => {
        switch (type) {
            case 'success': return 'border-l-green-500 bg-green-50'
            case 'error': return 'border-l-red-500 bg-red-50'
            case 'warning': return 'border-l-yellow-500 bg-yellow-50'
            default: return 'border-l-blue-500 bg-blue-50'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Bell className="h-8 w-8" />Notifications {unreadCount > 0 && <span className="px-2 py-1 bg-red-500 text-white rounded-full text-sm">{unreadCount}</span>}</h1>
                <div className="flex gap-2">
                    {unreadCount > 0 && <Button variant="outline" onClick={markAllAsRead}><Check className="h-4 w-4 mr-2" />Mark All Read</Button>}
                    {notifications.length > 0 && <Button variant="destructive" onClick={() => { if (confirm('Clear all notifications?')) clearAll() }}><Trash2 className="h-4 w-4 mr-2" />Clear All</Button>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{notifications.length}</div></CardContent></Card>
                <Card className="border-red-500"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-500" />Unread</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{unreadCount}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Info className="h-4 w-4 text-blue-500" />Info</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{notifications.filter(n => n.type === 'info').length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Success</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{notifications.filter(n => n.type === 'success').length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" />Warnings</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{notifications.filter(n => n.type === 'warning').length}</div></CardContent></Card>
            </div>

            <Card><CardContent className="pt-6">
                <div className="flex gap-2">
                    {(['all', 'unread', 'info', 'success', 'warning', 'error'] as const).map(f => (
                        <Button key={f} variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize" size="sm">{f}</Button>
                    ))}
                </div>
            </CardContent></Card>

            <div className="space-y-3">
                {loading ? (
                    <Card><CardContent className="text-center py-8">Loading notifications...</CardContent></Card>
                ) : filtered.length === 0 ? (
                    <Card><CardContent className="text-center py-12">
                        <Bell className="h-16 w-16 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
                        <h3 className="text-xl font-semibold mb-2">No notifications</h3>
                        <p className="text-[hsl(var(--muted-foreground))]">You're all caught up!</p>
                    </CardContent></Card>
                ) : (
                    filtered.map(notification => (
                        <Card key={notification.id} className={`border-l-4 ${getColorClass(notification.type)} ${!notification.read ? 'shadow-md' : 'opacity-75'}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">{getIcon(notification.type)}</div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold text-lg">{notification.title}</h3>
                                                {!notification.read && <span className="inline-block px-2 py-0.5 bg-red-500 text-white text-xs rounded-full mt-1">New</span>}
                                            </div>
                                            <span className="text-sm text-[hsl(var(--muted-foreground))]">{new Date(notification.created_at).toLocaleString()}</span>
                                        </div>
                                        <p className="text-[hsl(var(--muted-foreground))] mb-3">{notification.message}</p>
                                        <div className="flex gap-2">
                                            {!notification.read && (
                                                <Button size="sm" variant="outline" onClick={() => markAsRead(notification.id)}><Check className="h-3 w-3 mr-1" />Mark as Read</Button>
                                            )}
                                            <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
