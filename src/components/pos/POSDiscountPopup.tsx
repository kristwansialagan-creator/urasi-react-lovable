import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Percent, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface POSDiscountPopupProps {
    open: boolean
    onClose: () => void
    subtotal: number
    onApply: (discountType: 'percentage' | 'flat', discountValue: number) => void
}

export default function POSDiscountPopup({ open, onClose, subtotal, onApply }: POSDiscountPopupProps) {
    const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage')
    const [discountValue, setDiscountValue] = useState<number>(0)

    const calculateDiscount = () => {
        if (discountType === 'percentage') {
            return (subtotal * discountValue) / 100
        }
        return discountValue
    }

    const finalAmount = subtotal - calculateDiscount()

    const handleApply = () => {
        onApply(discountType, discountValue)
        onClose()
    }

    const quickDiscounts = [5, 10, 15, 20, 25, 50]

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Percent className="h-5 w-5" />
                        Apply Discount
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Subtotal Display */}
                    <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Subtotal</p>
                        <p className="text-2xl font-bold">{formatCurrency(subtotal)}</p>
                    </div>

                    {/* Discount Type Selection */}
                    <div className="space-y-2">
                        <Label>Discount Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={discountType === 'percentage' ? 'default' : 'outline'}
                                onClick={() => setDiscountType('percentage')}
                                className="gap-2"
                            >
                                <Percent className="h-4 w-4" />
                                Percentage
                            </Button>
                            <Button
                                variant={discountType === 'flat' ? 'default' : 'outline'}
                                onClick={() => setDiscountType('flat')}
                                className="gap-2"
                            >
                                <DollarSign className="h-4 w-4" />
                                Fixed Amount
                            </Button>
                        </div>
                    </div>

                    {/* Discount Value Input */}
                    <div className="space-y-2">
                        <Label htmlFor="discount">
                            {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                        </Label>
                        <Input
                            id="discount"
                            type="number"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                            placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                            min="0"
                            max={discountType === 'percentage' ? 100 : subtotal}
                            step={discountType === 'percentage' ? 1 : 0.01}
                        />
                    </div>

                    {/* Quick Discount Buttons (for percentage) */}
                    {discountType === 'percentage' && (
                        <div className="grid grid-cols-3 gap-2">
                            {quickDiscounts.map((percent) => (
                                <Button
                                    key={percent}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDiscountValue(percent)}
                                >
                                    {percent}%
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Discount Preview */}
                    {discountValue > 0 && (
                        <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                                <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : 'Fixed'}):</span>
                                <span>-{formatCurrency(calculateDiscount())}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>New Total:</span>
                                <span>{formatCurrency(finalAmount)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleApply} disabled={discountValue <= 0}>
                        Apply Discount
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
