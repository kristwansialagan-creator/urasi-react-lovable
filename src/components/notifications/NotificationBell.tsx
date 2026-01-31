import { Bell } from 'lucide-react'
import { useNotifications } from '@/hooks'
import { Link, useNavigate } from 'react-router-dom'

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead } = useNotifications()
    const navigate = useNavigate()
    const recentNotifications = notifications.slice(0, 5)

    const handleNotificationClick = async (e: React.MouseEvent, notificationId: string, url?: string | null, read?: boolean | null) => {
        e.preventDefault()

        // Mark as read if unread
        if (!read) {
            await markAsRead(notificationId)
        }

        // Navigate to URL if provided, otherwise go to notifications page
        if (url) {
            navigate(url)
        } else {
            navigate('/notifications')
        }
    }

    return (
        <div className="relative group">
            <Link to="/notifications" className="relative block p-2 hover:bg-[hsl(var(--muted))] rounded-full transition-colors">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Link>

            {/* Dropdown Preview */}
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 shadow-xl rounded-lg border border-gray-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && <p className="text-xs text-gray-600 dark:text-slate-300">{unreadCount} unread</p>}
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {recentNotifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-slate-400 text-sm">
                            No notifications
                        </div>
                    ) : (
                        recentNotifications.map(notification => (
                            <button
                                key={notification.id}
                                onClick={(e) => handleNotificationClick(e, notification.id, notification.url, notification.read)}
                                className={`w-full text-left p-3 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${!notification.read
                                        ? 'bg-blue-50 dark:bg-blue-950/40'
                                        : 'bg-white dark:bg-slate-900'
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-gray-900 dark:text-white">{notification.title}</p>
                                        <p className="text-xs text-gray-700 dark:text-slate-200 line-clamp-2 mt-1">{notification.description || ''}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                            {notification.created_at ? new Date(notification.created_at).toLocaleDateString('id-ID') : ''}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {recentNotifications.length > 0 && (
                    <Link
                        to="/notifications"
                        className="block p-3 text-center text-sm text-blue-600 dark:text-blue-400 hover:underline border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-b-lg font-medium"
                    >
                        View all notifications
                    </Link>
                )}
            </div>
        </div>
    )
}
