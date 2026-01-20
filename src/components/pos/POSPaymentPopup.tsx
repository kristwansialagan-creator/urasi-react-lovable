import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface PaymentMethod {
    id: string
    label: string
    identifier: string
}

interface POSPaymentPopupProps {
    open: boolean
    onClose: () => void
    total: number
    onConfirm: (paymentType: string, tendered: number) => void
}

export default function POSPaymentPopup({ open, onClose, total, onConfirm }: POSPaymentPopupProps) {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [selectedMethod, setSelectedMethod] = useState<string>('')
    const [tendered, setTendered] = useState<number>(0)

    useEffect(() => {
        if (open) {
            fetchPaymentMethods()
            setTendered(total)
        }
    }, [open, total])

    const fetchPaymentMethods = async () => {
        try {
            const { data, error } = await (supabase
                .from('payment_types')
                .select('id, label, identifier')
                .eq('active', true) as any)

            if (error) throw error
            setPaymentMethods(data || [])
            if (data && data.length > 0) {
                setSelectedMethod(data[0].id)
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error)
        }
    }

    const change = tendered - total

    const handleConfirm = () => {
        // Validation removed to allow partial/unpaid payments
        onConfirm(selectedMethod, tendered)
        onClose()
    }

    const quickAmounts = [
        { label: 'Exact', value: total },
        { label: '+5', value: Math.ceil((total + 5) / 5) * 5 },
        { label: '+10', value: Math.ceil((total + 10) / 10) * 10 },
        { label: '+20', value: Math.ceil((total + 20) / 10) * 10 },
        { label: '+50', value: Math.ceil((total + 50) / 50) * 50 },
        { label: '+100', value: Math.ceil((total + 100) / 100) * 100 },
    ]

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Process Payment
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Total Display */}
                    <div className="p-4 bg-[hsl(var(--primary))]/10 rounded-lg">
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Total Amount</p>
                        <p className="text-3xl font-bold">{formatCurrency(total)}</p>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {paymentMethods.map((method) => (
                                <Button
                                    key={method.id}
                                    variant={selectedMethod === method.id ? 'default' : 'outline'}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className="justify-start"
                                >
                                    {method.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Tendered Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="tendered">Tendered Amount</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                            <Input
                                id="tendered"
                                type="number"
                                value={tendered}
                                onChange={(e) => setTendered(parseFloat(e.target.value) || 0)}
                                className="pl-10 text-lg font-medium"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                        {quickAmounts.map((amount) => (
                            <Button
                                key={amount.label}
                                variant="outline"
                                size="sm"
                                onClick={() => setTendered(amount.value)}
                            >
                                {amount.label}
                            </Button>
                        ))}
                    </div>

                    {/* Change Display */}
                    {change >= 0 && (
                        <div className={`p-4 rounded-lg ${change > 0 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-blue-50 dark:bg-blue-950/20'}`}>
                            <p className="text-sm mb-1">Change</p>
                            <p className="text-2xl font-bold">{formatCurrency(change)}</p>
                        </div>
                    )}

                    {change < 0 && (
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">
                                Insufficient amount: {formatCurrency(Math.abs(change))} short
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm}>
                        {tendered >= total ? 'Confirm Payment' : tendered > 0 ? 'Confirm (Partial)' : 'Confirm (Unpaid)'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
