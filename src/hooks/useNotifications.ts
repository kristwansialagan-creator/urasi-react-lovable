import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Notification {
    id: string
    user_id: string | null
    title: string
    description: string | null
    type?: string | null
    read: boolean | null
    url?: string | null
    source?: string | null
    identifier?: string | null
    entity_type?: string | null
    entity_id?: string | null
    created_at: string | null
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchNotifications = useCallback(async () => {
        setLoading(true)
        try {
            const user = await supabase.auth.getUser()
            if (!user.data.user) return

            const { data, error: err } = await (supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.data.user.id)
                .order('created_at', { ascending: false }) as any)

            if (err) throw err

            setNotifications(data || [])
            setUnreadCount(data?.filter((n: any) => !n.read).length || 0)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
        } finally {
            setLoading(false)
        }
    }, [])

    const createNotification = useCallback(async (data: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'read'>) => {
        try {
            const user = await supabase.auth.getUser()
            if (!user.data.user) return false

            const { error: err } = await supabase
                .from('notifications')
                .insert([{
                    ...data,
                    user_id: user.data.user.id,
                    read: false
                }] as never)

            if (err) throw err

            await fetchNotifications()
            return true
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to create notification')
            return false
        }
    }, [fetchNotifications])

    const markAsRead = useCallback(async (id: string) => {
        try {
            const { error: err } = await supabase
                .from('notifications')
                .update({ read: true } as never)
                .eq('id', id)

            if (err) throw err

            await fetchNotifications()
            return true
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to mark as read')
            return false
        }
    }, [fetchNotifications])

    const markAllAsRead = useCallback(async () => {
        try {
            const user = await supabase.auth.getUser()
            if (!user.data.user) return false

            const { error: err } = await supabase
                .from('notifications')
                .update({ read: true } as never)
                .eq('user_id', user.data.user.id)
                .eq('read', false)

            if (err) throw err

            await fetchNotifications()
            return true
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to mark all as read')
            return false
        }
    }, [fetchNotifications])

    const deleteNotification = useCallback(async (id: string) => {
        try {
            const { error: err } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id)

            if (err) throw err

            await fetchNotifications()
            return true
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to delete notification')
            return false
        }
    }, [fetchNotifications])

    const clearAll = useCallback(async () => {
        try {
            const user = await supabase.auth.getUser()
            if (!user.data.user) return false

            const { error: err } = await supabase
                .from('notifications')
                .delete()
                .eq('user_id', user.data.user.id)

            if (err) throw err

            setNotifications([])
            setUnreadCount(0)
            return true
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to clear notifications')
            return false
        }
    }, [])

    // Subscribe to real-time notifications
    useEffect(() => {
        fetchNotifications()

        const user = supabase.auth.getUser()
        user.then(({ data }) => {
            if (!data.user) return

            const channel = supabase
                .channel('notifications')
                .on('postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${data.user.id}`
                    },
                    () => {
                        fetchNotifications()
                    }
                )
                .subscribe()

            return () => {
                channel.unsubscribe()
            }
        })
    }, [fetchNotifications])

    return {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        createNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll
    }
}
