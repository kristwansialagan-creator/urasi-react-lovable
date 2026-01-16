import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Clock, Trash2, Eye } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export interface HeldOrder {
    id: string
    created_at: string
    customer_name?: string
    items_count: number
    total: number
    cart_data: any
}

interface POSHoldOrdersPopupProps {
    open: boolean
    onClose: () => void
    heldOrders: HeldOrder[]
    onRetrieve: (order: HeldOrder) => void
    onDelete: (orderId: string) => void
}

export default function POSHoldOrdersPopup({
    open,
    onClose,
    heldOrders,
    onRetrieve,
    onDelete
}: POSHoldOrdersPopupProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Held Orders
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-2">
                    {heldOrders.length === 0 ? (
                        <div className="p-8 text-center">
                            <Clock className="h-16 w-16 mx-auto text-[hsl(var(--muted-foreground))] mb-4" />
                            <p className="text-[hsl(var(--muted-foreground))]">No held orders</p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
                                Hold an order to save it for later
                            </p>
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <div className="max-h-96 overflow-y-auto divide-y">
                                {heldOrders.map((order) => (
                                    <div key={order.id} className="p-4 hover:bg-[hsl(var(--muted))]/50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium">
                                                        {order.customer_name || 'Walk-in Customer'}
                                                    </h4>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                    {formatDateTime(order.created_at)}
                                                </p>
                                                <p className="text-lg font-bold mt-2">
                                                    {formatCurrency(order.total)}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => onRetrieve(order)}
                                                    title="Retrieve order"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (confirm('Delete this held order?')) {
                                                            onDelete(order.id)
                                                        }
                                                    }}
                                                    title="Delete order"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
