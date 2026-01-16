import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, DollarSign, CreditCard, History } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

interface PaymentMethod {
    id: string
    label: string
}

interface PaymentHistory {
    id: string
    amount: number
    payment_type: string
    created_at: string
}

export default function OrderPaymentPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [orderCode, setOrderCode] = useState('')
    const [orderTotal, setOrderTotal] = useState(0)
    const [paidAmount, setPaidAmount] = useState(0)
    const [paymentAmount, setPaymentAmount] = useState(0)
    const [selectedPaymentType, setSelectedPaymentType] = useState('')
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])

    useEffect(() => {
        fetchOrderDetails()
        fetchPaymentMethods()
        fetchPaymentHistory()
    }, [id])

    const fetchOrderDetails = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('orders')
                .select('code, total, tendered')
                .eq('id', id)
                .single()

            if (error) throw error
            setOrderCode(data.code)
            setOrderTotal(data.total)
            setPaidAmount(data.tendered)
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        }
    }

    const fetchPaymentMethods = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('payment_types')
                .select('id, label')
                .eq('active', true)

            if (error) throw error
            setPaymentMethods(data || [])
            if (data && data.length > 0) {
                setSelectedPaymentType(data[0].id)
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const fetchPaymentHistory = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('order_payments')
                .select('id, amount, payment_type, created_at')
                .eq('order_id', id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setPaymentHistory(data || [])
        } catch (error: any) {
            console.error('Error fetching payment history:', error)
        }
    }

    const handleSubmitPayment = async () => {
        if (!paymentAmount || paymentAmount <= 0) {
            toast({ title: 'Error', description: 'Please enter a valid payment amount', variant: 'destructive' })
            return
        }

        if (!selectedPaymentType) {
            toast({ title: 'Error', description: 'Please select a payment method', variant: 'destructive' })
            return
        }

        const newPaidAmount = paidAmount + paymentAmount
        if (newPaidAmount > orderTotal) {
            toast({
                title: 'Warning',
                description: 'Payment amount exceeds remaining balance. Change will be calculated.',
                variant: 'default'
            })
        }

        try {
            setSubmitting(true)

            // Insert payment record
            const { error: paymentError } = await (supabase as any)
                .from('order_payments')
                .insert({
                    order_id: id,
                    amount: paymentAmount,
                    payment_type: selectedPaymentType
                })

            if (paymentError) throw paymentError

            // Update order tendered amount and payment status
            const updatedTendered = newPaidAmount
            let paymentStatus = 'unpaid'
            if (updatedTendered >= orderTotal) {
                paymentStatus = 'paid'
            } else if (updatedTendered > 0) {
                paymentStatus = 'partially_paid'
            }

            const { error: orderError } = await (supabase as any)
                .from('orders')
                .update({
                    tendered: updatedTendered,
                    payment_status: paymentStatus,
                    change: Math.max(0, updatedTendered - orderTotal)
                })
                .eq('id', id)

            if (orderError) throw orderError

            toast({ title: 'Success', description: 'Payment added successfully' })
            navigate(`/app/orders/${id}`)
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setSubmitting(false)
        }
    }

    const remainingBalance = orderTotal - paidAmount

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/app/orders/${id}`)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Add Payment - Order #{orderCode}</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Process additional payment for this order</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Order Total</p>
                        <p className="text-2xl font-bold">{formatCurrency(orderTotal)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Paid Amount</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Remaining Balance</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(remainingBalance)}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="payment-method">Payment Method</Label>
                        <select
                            id="payment-method"
                            className="w-full border rounded-md px-3 py-2"
                            value={selectedPaymentType}
                            onChange={(e) => setSelectedPaymentType(e.target.value)}
                        >
                            {paymentMethods.map(method => (
                                <option key={method.id} value={method.id}>{method.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="payment-amount">Payment Amount</Label>
                        <Input
                            id="payment-amount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                            placeholder="Enter payment amount"
                        />
                        <div className="flex gap-2 mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPaymentAmount(remainingBalance)}
                            >
                                Pay Full Balance
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPaymentAmount(remainingBalance / 2)}
                            >
                                Pay Half
                            </Button>
                        </div>
                    </div>

                    {paymentAmount > 0 && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span>Current Paid:</span>
                                <span className="font-medium">{formatCurrency(paidAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>New Payment:</span>
                                <span className="font-medium">{formatCurrency(paymentAmount)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>Total Paid:</span>
                                <span>{formatCurrency(paidAmount + paymentAmount)}</span>
                            </div>
                            {(paidAmount + paymentAmount) > orderTotal && (
                                <div className="flex justify-between text-green-600">
                                    <span>Change:</span>
                                    <span>{formatCurrency((paidAmount + paymentAmount) - orderTotal)}</span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {paymentHistory.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Payment History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {paymentHistory.map((payment) => (
                                <div key={payment.id} className="p-3 border rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{payment.payment_type}</p>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                            {formatDateTime(payment.created_at)}
                                        </p>
                                    </div>
                                    <span className="font-bold">{formatCurrency(payment.amount)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate(`/app/orders/${id}`)}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmitPayment}
                    disabled={submitting || !paymentAmount || paymentAmount <= 0}
                    className="gap-2"
                >
                    <DollarSign className="h-4 w-4" />
                    {submitting ? 'Processing...' : `Add Payment (${formatCurrency(paymentAmount)})`}
                </Button>
            </div>
        </div>
    )
}
