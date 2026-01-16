import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Ticket, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface Coupon {
    id: string
    code: string
    name: string
    discount_type: 'percentage' | 'flat'
    discount_value: number
    min_purchase?: number
    max_discount?: number
    active: boolean
}

interface POSCouponsPopupProps {
    open: boolean
    onClose: () => void
    subtotal: number
    onApply: (coupon: Coupon) => void
    appliedCoupons: Coupon[]
}

export default function POSCouponsPopup({ open, onClose, subtotal, onApply, appliedCoupons }: POSCouponsPopupProps) {
    const [couponCode, setCouponCode] = useState('')
    const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (open) {
            fetchAvailableCoupons()
        }
    }, [open])

    const fetchAvailableCoupons = async () => {
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('active', true)
                .lte('min_purchase', subtotal)

            if (error) throw error
            setAvailableCoupons(data || [])
        } catch (error) {
            console.error('Error fetching coupons:', error)
        }
    }

    const handleApplyCouponCode = async () => {
        if (!couponCode.trim()) return

        try {
            setLoading(true)
            setError('')

            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('active', true)
                .single()

            if (error || !data) {
                setError('Invalid coupon code')
                return
            }

            if (data.min_purchase && subtotal < data.min_purchase) {
                setError(`Minimum purchase of ${formatCurrency(data.min_purchase)} required`)
                return
            }

            if (appliedCoupons.find(c => c.id === data.id)) {
                setError('Coupon already applied')
                return
            }

            onApply(data)
            setCouponCode('')
            setError('')
        } catch (error) {
            setError('Error applying coupon')
        } finally {
            setLoading(false)
        }
    }

    const handleApplyCoupon = (coupon: Coupon) => {
        if (appliedCoupons.find(c => c.id === coupon.id)) {
            setError('Coupon already applied')
            return
        }
        onApply(coupon)
    }

    const calculateCouponDiscount = (coupon: Coupon) => {
        let discount = 0
        if (coupon.discount_type === 'percentage') {
            discount = (subtotal * coupon.discount_value) / 100
        } else {
            discount = coupon.discount_value
        }

        if (coupon.max_discount && discount > coupon.max_discount) {
            discount = coupon.max_discount
        }

        return discount
    }

    const isCouponApplied = (couponId: string) => {
        return appliedCoupons.some(c => c.id === couponId)
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Ticket className="h-5 w-5" />
                        Apply Coupons
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Subtotal Display */}
                    <div className="p-3 bg-[hsl(var(--muted))] rounded-lg flex justify-between">
                        <span className="text-sm">Current Subtotal:</span>
                        <span className="font-bold">{formatCurrency(subtotal)}</span>
                    </div>

                    {/* Coupon Code Input */}
                    <div className="space-y-2">
                        <Label htmlFor="coupon-code">Enter Coupon Code</Label>
                        <div className="flex gap-2">
                            <Input
                                id="coupon-code"
                                placeholder="Enter coupon code..."
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                onKeyPress={(e) => e.key === 'Enter' && handleApplyCouponCode()}
                            />
                            <Button onClick={handleApplyCouponCode} disabled={loading || !couponCode.trim()}>
                                Apply
                            </Button>
                        </div>
                        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                    </div>

                    {/* Available Coupons */}
                    <div className="space-y-2">
                        <Label>Available Coupons</Label>
                        <div className="border rounded-lg overflow-hidden">
                            <div className="max-h-64 overflow-y-auto divide-y">
                                {availableCoupons.length === 0 ? (
                                    <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                                        No coupons available for this order amount
                                    </div>
                                ) : (
                                    availableCoupons.map((coupon) => {
                                        const isApplied = isCouponApplied(coupon.id)
                                        const discount = calculateCouponDiscount(coupon)

                                        return (
                                            <div
                                                key={coupon.id}
                                                className={`p-4 ${isApplied ? 'bg-green-50 dark:bg-green-950/20' : 'hover:bg-[hsl(var(--muted))]/50'}`}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-mono font-bold text-[hsl(var(--primary))]">
                                                                {coupon.code}
                                                            </span>
                                                            {isApplied && (
                                                                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                                                                    <Check className="h-3 w-3" />
                                                                    Applied
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm mb-2">{coupon.name}</p>
                                                        <div className="text-xs text-[hsl(var(--muted-foreground))] space-y-1">
                                                            <p>
                                                                Discount: {coupon.discount_type === 'percentage'
                                                                    ? `${coupon.discount_value}%`
                                                                    : formatCurrency(coupon.discount_value)}
                                                            </p>
                                                            {coupon.min_purchase && (
                                                                <p>Min. Purchase: {formatCurrency(coupon.min_purchase)}</p>
                                                            )}
                                                            {coupon.max_discount && (
                                                                <p>Max. Discount: {formatCurrency(coupon.max_discount)}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Saves</p>
                                                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                                            {formatCurrency(discount)}
                                                        </p>
                                                        {!isApplied && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="mt-2"
                                                                onClick={() => handleApplyCoupon(coupon)}
                                                            >
                                                                Apply
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Applied Coupons Summary */}
                    {appliedCoupons.length > 0 && (
                        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <p className="text-sm font-medium mb-2">Applied Coupons ({appliedCoupons.length})</p>
                            <div className="space-y-1">
                                {appliedCoupons.map((coupon) => (
                                    <div key={coupon.id} className="flex justify-between text-sm">
                                        <span>{coupon.code}</span>
                                        <span className="font-medium">-{formatCurrency(calculateCouponDiscount(coupon))}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
