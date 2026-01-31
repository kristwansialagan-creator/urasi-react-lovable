import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle, AlertCircle, Info, AlertTriangle, Trash2, Check, ExternalLink } from 'lucide-react'
import { useNotifications } from '@/hooks'
import { Link } from 'react-router-dom'

export default function NotificationsPage() {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications()
    const [filter, setFilter] = useState<'all' | 'unread' | 'info' | 'success' | 'warning' | 'error'>('all')

    const filtered = notifications.filter((n: any) => {
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

    const getBorderColor = (type: string) => {
        switch (type) {
            case 'success': return 'border-l-green-500'
            case 'error': return 'border-l-red-500'
            case 'warning': return 'border-l-yellow-500'
            default: return 'border-l-blue-500'
        }
    }

    const getSourceLabel = (source: string) => {
        switch (source) {
            case 'auth': return 'Authentication'
            case 'register': return 'Register'
            case 'stock': return 'Stock'
            case 'expiry': return 'Expiry'
            case 'installment': return 'Installment'
            case 'order': return 'Order'
            default: return 'System'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Bell className="h-8 w-8" />Notifications
                    {unreadCount > 0 && <span className="px-2 py-1 bg-red-500 text-white rounded-full text-sm">{unreadCount}</span>}
                </h1>
                <div className="flex gap-2">
                    {unreadCount > 0 && <Button variant="outline" onClick={markAllAsRead}><Check className="h-4 w-4 mr-2" />Mark All Read</Button>}
                    {notifications.length > 0 && <Button variant="destructive" onClick={() => { if (confirm('Clear all notifications?')) clearAll() }}><Trash2 className="h-4 w-4 mr-2" />Clear All</Button>}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{notifications.length}</div></CardContent></Card>
                <Card className="border-red-500"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-500" />Unread</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{unreadCount}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Info className="h-4 w-4 text-blue-500" />Info</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{notifications.filter((n: any) => n.type === 'info').length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" />Warnings</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{notifications.filter((n: any) => n.type === 'warning').length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-500" />Errors</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{notifications.filter((n: any) => n.type === 'error').length}</div></CardContent></Card>
            </div>

            <Card><CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
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
                    filtered.map((notification: any) => (
                        <Card key={notification.id} className={`border-l-4 ${getBorderColor(notification.type)} bg-white dark:bg-slate-950 ${!notification.read ? 'shadow-md' : 'shadow-sm text-opacity-90'}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">{getIcon(notification.type)}</div>
                                    <div className="flex-1">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-2 gap-2">
                                            <div>
                                                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-50">{notification.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {!notification.read && <span className="inline-block px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">New</span>}
                                                    <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-full font-medium">
                                                        {getSourceLabel(notification.source)}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-sm text-slate-500 dark:text-slate-400">{new Date(notification.created_at).toLocaleString('id-ID')}</span>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 mb-3">{notification.description || ''}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {notification.url && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    asChild
                                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                                >
                                                    <Link to={notification.url}>
                                                        <ExternalLink className="h-3 w-3 mr-1" />View Details
                                                    </Link>
                                                </Button>
                                            )}
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
