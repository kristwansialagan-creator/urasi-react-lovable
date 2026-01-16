import { X, Plus, Minus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

export interface CartItem {
    id: string
    product_id: string
    name: string
    unit_price: number
    quantity: number
    discount: number
    discount_type: 'percentage' | 'flat'
    tax_rate: number
    total: number
}

interface POSCartProps {
    items: CartItem[]
    onUpdateQuantity: (itemId: string, quantity: number) => void
    onRemoveItem: (itemId: string) => void
    onApplyDiscount: () => void
    onApplyCoupon: () => void
    subtotal: number
    discount: number
    tax: number
    total: number
}

export default function POSCart({
    items,
    onUpdateQuantity,
    onRemoveItem,
    onApplyDiscount,
    onApplyCoupon,
    subtotal,
    discount,
    tax,
    total
}: POSCartProps) {
    return (
        <div className="flex flex-col h-full">
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                        Cart is empty. Add products to start.
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="p-3 border rounded-lg space-y-2">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-medium">{item.name}</h4>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        {formatCurrency(item.unit_price)} each
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onRemoveItem(item.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                <span className="font-bold">{formatCurrency(item.total)}</span>
                            </div>

                            {item.discount > 0 && (
                                <div className="text-sm text-red-600 dark:text-red-400">
                                    Discount: -{formatCurrency(item.discount)}
                                    {item.discount_type === 'percentage' && ` (${((item.discount / (item.unit_price * item.quantity)) * 100).toFixed(0)}%)`}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Cart Actions */}
            <div className="border-t pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={onApplyDiscount} className="text-sm">
                        Discount
                    </Button>
                    <Button variant="outline" onClick={onApplyCoupon} className="text-sm">
                        Coupon
                    </Button>
                </div>

                {/* Cart Summary */}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-[hsl(var(--muted-foreground))]">Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-red-600 dark:text-red-400">
                            <span>Discount:</span>
                            <span>-{formatCurrency(discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-[hsl(var(--muted-foreground))]">Tax:</span>
                        <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
