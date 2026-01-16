import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, RefreshCw, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

interface OrderProduct {
    id: string
    name: string
    quantity: number
    unit_price: number
    total_price: number
    unit: {
        id: string
        name: string
    }
}

interface RefundProduct {
    productId: string
    quantity: number
    condition: 'damaged' | 'unspoiled'
    unitPrice: number
}

export default function OrderRefundPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [products, setProducts] = useState<OrderProduct[]>([])
    const [refundProducts, setRefundProducts] = useState<RefundProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [orderCode, setOrderCode] = useState('')

    useEffect(() => {
        if (id) fetchOrderProducts()
    }, [id])

    const fetchOrderProducts = async () => {
        try {
            setLoading(true)
            const { data: order, error } = await (supabase as any)
                .from('orders')
                .select(`
                    code,
                    products:order_products(
                        id,
                        name,
                        quantity,
                        unit_price,
                        total_price,
                        unit:units(id, name)
                    )
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            setProducts(order.products || [])
            setOrderCode(order.code)
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const handleQuantityChange = (productId: string, quantity: number, unitPrice: number) => {
        setRefundProducts(prev => {
            const existing = prev.find(p => p.productId === productId)
            if (quantity <= 0) {
                return prev.filter(p => p.productId !== productId)
            }
            if (existing) {
                return prev.map(p => p.productId === productId ? { ...p, quantity } : p)
            }
            return [...prev, { productId, quantity, condition: 'unspoiled', unitPrice }]
        })
    }

    const handleConditionChange = (productId: string, condition: 'damaged' | 'unspoiled') => {
        setRefundProducts(prev =>
            prev.map(p => p.productId === productId ? { ...p, condition } : p)
        )
    }

    const getRefundQuantity = (productId: string) => {
        return refundProducts.find(p => p.productId === productId)?.quantity || 0
    }

    const getRefundCondition = (productId: string) => {
        return refundProducts.find(p => p.productId === productId)?.condition || 'unspoiled'
    }

    const calculateRefundTotal = () => {
        return refundProducts.reduce((sum, item) => {
            return sum + (item.quantity * item.unitPrice)
        }, 0)
    }

    const handleSubmitRefund = async () => {
        if (refundProducts.length === 0) {
            toast({ title: 'Error', description: 'Please select at least one product to refund', variant: 'destructive' })
            return
        }

        try {
            setSubmitting(true)

            // Insert refund records
            const refundData = refundProducts.map(item => ({
                order_id: id,
                order_product_id: item.productId,
                quantity: item.quantity,
                condition: item.condition,
                total_price: item.quantity * item.unitPrice,
                unit_id: products.find(p => p.id === item.productId)?.unit.id
            }))

            const { error } = await (supabase as any)
                .from('order_refunds')
                .insert(refundData)

            if (error) throw error

            toast({ title: 'Success', description: 'Refund processed successfully' })
            navigate(`/app/orders/${id}`)
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/app/orders/${id}`)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Refund Order #{orderCode}</h1>
                        <p className="text-[hsl(var(--muted-foreground))]">Select products and quantities to refund</p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5" />
                            Products to Refund
                        </span>
                        <span className="text-lg font-bold">
                            Total Refund: {formatCurrency(calculateRefundTotal())}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {products.map((product) => {
                        const refundQty = getRefundQuantity(product.id)
                        const refundCondition = getRefundCondition(product.id)

                        return (
                            <div key={product.id} className="p-4 border rounded-lg space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium">{product.name}</h4>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                            Available: {product.quantity} | Unit: {product.unit?.name || 'N/A'} |
                                            Price: {formatCurrency(product.unit_price)}
                                        </p>
                                    </div>
                                    <span className="font-medium">{formatCurrency(product.total_price)}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`qty-${product.id}`}>Refund Quantity</Label>
                                        <Input
                                            id={`qty-${product.id}`}
                                            type="number"
                                            min="0"
                                            max={product.quantity}
                                            value={refundQty}
                                            onChange={(e) => handleQuantityChange(
                                                product.id,
                                                parseInt(e.target.value) || 0,
                                                product.unit_price
                                            )}
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`condition-${product.id}`}>Condition</Label>
                                        <select
                                            id={`condition-${product.id}`}
                                            className="w-full border rounded-md px-3 py-2"
                                            value={refundCondition}
                                            onChange={(e) => handleConditionChange(
                                                product.id,
                                                e.target.value as 'damaged' | 'unspoiled'
                                            )}
                                            disabled={refundQty === 0}
                                        >
                                            <option value="unspoiled">Unspoiled (Return to Stock)</option>
                                            <option value="damaged">Damaged (Do Not Return)</option>
                                        </select>
                                    </div>
                                </div>

                                {refundQty > 0 && (
                                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg flex items-center gap-2">
                                        <Check className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm">
                                            Refunding {refundQty} unit(s) - {formatCurrency(refundQty * product.unit_price)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate(`/app/orders/${id}`)}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmitRefund}
                    disabled={submitting || refundProducts.length === 0}
                    className="gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    {submitting ? 'Processing...' : `Process Refund (${formatCurrency(calculateRefundTotal())})`}
                </Button>
            </div>
        </div>
    )
}
