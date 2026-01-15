import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface UseRealtimeOptions {
    onStockChange?: (productId: string) => void
    onNewOrder?: (order: any) => void
    onRegisterUpdate?: (registerId: string) => void
}

export function useRealtime({ onStockChange, onNewOrder, onRegisterUpdate }: UseRealtimeOptions) {
    useEffect(() => {
        const subscriptions: any[] = []

        // Stock updates subscription
        if (onStockChange) {
            const stockChannel = supabase
                .channel('stock-changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'product_unit_quantities'
                    },
                    (payload) => {
                        if (payload.new && typeof payload.new === 'object' && 'product_id' in payload.new) {
                            onStockChange((payload.new as any).product_id)
                        }
                    }
                )
                .subscribe()

            subscriptions.push(stockChannel)
        }

        // New orders subscription
        if (onNewOrder) {
            const ordersChannel = supabase
                .channel('new-orders')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'orders'
                    },
                    (payload) => {
                        if (payload.new) {
                            onNewOrder(payload.new)
                            // Show notification
                            if (Notification.permission === 'granted') {
                                new Notification('New Order', {
                                    body: `Order ${(payload.new as any).code} has been created`,
                                    icon: '/icon.png'
                                })
                            }
                        }
                    }
                )
                .subscribe()

            subscriptions.push(ordersChannel)
        }

        // Register updates subscription
        if (onRegisterUpdate) {
            const registerChannel = supabase
                .channel('register-updates')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'registers'
                    },
                    (payload) => {
                        if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
                            onRegisterUpdate((payload.new as any).id)
                        }
                    }
                )
                .subscribe()

            subscriptions.push(registerChannel)
        }

        // Request notification permission on mount
        if (Notification.permission === 'default') {
            Notification.requestPermission()
        }

        // Cleanup subscriptions
        return () => {
            subscriptions.forEach(channel => {
                supabase.removeChannel(channel)
            })
        }
    }, [onStockChange, onNewOrder, onRegisterUpdate])
}

// Example hook to enable real-time for products
export function useRealtimeProducts(onUpdate: () => void) {
    useRealtime({
        onStockChange: () => onUpdate()
    })
}

// Example hook to enable real-time for orders
export function useRealtimeOrders(onNewOrder: (order: any) => void) {
    useRealtime({
        onNewOrder
    })
}

// Example hook to enable real-time for registers
export function useRealtimeRegisters(onUpdate: () => void) {
    useRealtime({
        onRegisterUpdate: () => onUpdate()
    })
}
