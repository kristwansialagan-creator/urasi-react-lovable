import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'

interface POSQuantityPopupProps {
    open: boolean
    onClose: () => void
    productName: string
    currentQuantity: number
    maxQuantity?: number
    onConfirm: (quantity: number) => void
}

export default function POSQuantityPopup({
    open,
    onClose,
    productName,
    currentQuantity,
    maxQuantity,
    onConfirm
}: POSQuantityPopupProps) {
    const [quantity, setQuantity] = useState(currentQuantity)

    const handleNumberClick = (num: string) => {
        if (num === 'clear') {
            setQuantity(0)
        } else if (num === 'backspace') {
            setQuantity(Math.floor(quantity / 10))
        } else {
            const newQty = parseInt(`${quantity}${num}`)
            if (maxQuantity && newQty > maxQuantity) return
            setQuantity(newQty)
        }
    }

    const handleConfirm = () => {
        if (quantity <= 0) {
            alert('Quantity must be greater than 0')
            return
        }
        onConfirm(quantity)
        onClose()
    }

    const numpadButtons = [
        ['7', '8', '9'],
        ['4', '5', '6'],
        ['1', '2', '3'],
        ['clear', '0', 'backspace']
    ]

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Set Quantity
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Product Name */}
                    <div className="p-3 bg-[hsl(var(--muted))] rounded-lg">
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Product</p>
                        <p className="font-medium">{productName}</p>
                        {maxQuantity && (
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                                Available: {maxQuantity}
                            </p>
                        )}
                    </div>

                    {/* Quantity Display */}
                    <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">Quantity</p>
                        <p className="text-4xl font-bold">{quantity}</p>
                    </div>

                    {/* Quick Quantity Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                        {[1, 5, 10, 20].map((qty) => (
                            <Button
                                key={qty}
                                variant="outline"
                                size="sm"
                                onClick={() => setQuantity(qty)}
                            >
                                {qty}
                            </Button>
                        ))}
                    </div>

                    {/* Numpad */}
                    <div className="grid grid-cols-3 gap-2">
                        {numpadButtons.flat().map((btn, index) => (
                            <Button
                                key={index}
                                variant={btn === 'clear' || btn === 'backspace' ? 'destructive' : 'outline'}
                                onClick={() => handleNumberClick(btn)}
                                className="h-14 text-lg font-semibold"
                            >
                                {btn === 'clear' ? 'C' : btn === 'backspace' ? '←' : btn}
                            </Button>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={quantity <= 0}>
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
