import { Bell } from 'lucide-react'
import { useNotifications } from '@/hooks'
import { Link } from 'react-router-dom'

export default function NotificationBell() {
    const { notifications, unreadCount } = useNotifications()
    const recentNotifications = notifications.slice(0, 5)

    return (
        <div className="relative group">
            <Link to="/notifications" className="relative block p-2 hover:bg-[hsl(var(--muted))] rounded-full transition-colors">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top- 0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Link>

            {/* Dropdown Preview */}
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && <p className="text-xs text-[hsl(var(--muted-foreground))]">{unreadCount} unread</p>}
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {recentNotifications.length === 0 ? (
                        <div className="p-4 text-center text-[hsl(var(--muted-foreground))] text-sm">
                            No notifications
                        </div>
                    ) : (
                        recentNotifications.map(notification => (
                            <Link
                                key={notification.id}
                                to="/notifications"
                                className={`block p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-[hsl(var(--muted))] ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                            >
                                <div className="flex items-start gap-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{notification.title}</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">{notification.description || ''}</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                                            {notification.created_at ? new Date(notification.created_at).toLocaleDateString() : ''}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-1" />
                                    )}
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {recentNotifications.length > 0 && (
                    <Link
                        to="/notifications"
                        className="block p-3 text-center text-sm text-[hsl(var(--primary))] hover:underline border-t border-gray-200 dark:border-gray-700"
                    >
                        View all notifications
                    </Link>
                )}
            </div>
        </div>
    )
}
