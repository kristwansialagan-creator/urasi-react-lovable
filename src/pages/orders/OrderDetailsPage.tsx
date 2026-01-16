import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer, RefreshCw, DollarSign, Package, User, Truck, FileText } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

interface OrderDetails {
    id: string
    code: string
    subtotal: number
    discount: number
    discount_type: 'percentage' | 'flat'
    discount_percentage?: number
    shipping: number
    total_coupons: number
    total: number
    tax_value: number
    change: number
    tendered: number
    payment_status: string
    delivery_status: string
    process_status: string
    created_at: string
    customer: {
        id: string
        first_name: string
        last_name: string
    }
    products: Array<{
        id: string
        name: string
        quantity: number
        total_price: number
        unit: {
            name: string
        }
    }>
    refunded_products: Array<{
        id: string
        quantity: number
        total_price: number
        condition: 'damaged' | 'unspoiled'
        order_product: {
            name: string
        }
        unit: {
            name: string
        }
    }>
}

const deliveryStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'failed', label: 'Failed' }
]

const processingStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
]

export default function OrderDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [order, setOrder] = useState<OrderDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [showDeliverySelect, setShowDeliverySelect] = useState(false)
    const [showProcessingSelect, setShowProcessingSelect] = useState(false)
    const [deliveryStatus, setDeliveryStatus] = useState('')
    const [processStatus, setProcessStatus] = useState('')

    useEffect(() => {
        if (id) fetchOrderDetails()
    }, [id])

    const fetchOrderDetails = async () => {
        try {
            setLoading(true)
            const { data, error } = await (supabase as any)
                .from('orders')
                .select(`
                    *,
                    customer:customers(*),
                    products:order_products(
                        *,
                        unit:units(name)
                    ),
                    refunded_products:order_refunds(
                        *,
                        order_product:order_products(name),
                        unit:units(name)
                    )
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            setOrder(data)
            setDeliveryStatus(data.delivery_status)
            setProcessStatus(data.process_status)
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const updateDeliveryStatus = async () => {
        if (!order) return
        try {
            const { error } = await (supabase as any)
                .from('orders')
                .update({ delivery_status: deliveryStatus })
                .eq('id', order.id)

            if (error) throw error
            toast({ title: 'Success', description: 'Delivery status updated' })
            setShowDeliverySelect(false)
            fetchOrderDetails()
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        }
    }

    const updateProcessingStatus = async () => {
        if (!order) return
        try {
            const { error } = await (supabase as any)
                .from('orders')
                .update({ process_status: processStatus })
                .eq('id', order.id)

            if (error) throw error
            toast({ title: 'Success', description: 'Processing status updated' })
            setShowProcessingSelect(false)
            fetchOrderDetails()
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        }
    }

    const getStatusLabel = (status: string, type: 'delivery' | 'processing' | 'payment') => {
        if (type === 'delivery') {
            return deliveryStatuses.find(s => s.value === status)?.label || status
        } else if (type === 'processing') {
            return processingStatuses.find(s => s.value === status)?.label || status
        }
        return status
    }

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading...</div>
    }

    if (!order) {
        return <div className="text-center py-8">Order not found</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/app/orders')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Order #{order.code}</h1>
                        <p className="text-[hsl(var(--muted-foreground))]">{formatDateTime(order.created_at)}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => navigate(`/app/orders/${id}/refund`)}>
                        <RefreshCw className="h-4 w-4" />
                        Refund
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => navigate(`/app/orders/${id}/payment`)}>
                        <DollarSign className="h-4 w-4" />
                        Add Payment
                    </Button>
                </div>
            </div>

            {/* Payment Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Payment Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg flex justify-between items-center">
                            <span className="font-medium">Sub Total</span>
                            <span className="text-[hsl(var(--muted-foreground))]">{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="p-4 border rounded-lg flex justify-between items-center bg-red-50 dark:bg-red-950/20">
                            <span className="font-medium">
                                Discount
                                {order.discount_type === 'percentage' && ` (${order.discount_percentage}%)`}
                                {order.discount_type === 'flat' && ' (Flat)'}
                            </span>
                            <span className="text-red-600 dark:text-red-400">{formatCurrency(order.discount)}</span>
                        </div>
                        <div className="p-4 border rounded-lg flex justify-between items-center">
                            <span className="font-medium">Shipping</span>
                            <span className="text-[hsl(var(--muted-foreground))]">{formatCurrency(order.shipping)}</span>
                        </div>
                        <div className="p-4 border rounded-lg flex justify-between items-center bg-red-50 dark:bg-red-950/20">
                            <span className="font-medium">Coupons</span>
                            <span className="text-red-600 dark:text-red-400">{formatCurrency(order.total_coupons)}</span>
                        </div>
                        <div className="p-4 border rounded-lg flex justify-between items-center bg-green-50 dark:bg-green-950/20">
                            <span className="font-medium">Total</span>
                            <span className="text-green-600 dark:text-green-400 font-bold">{formatCurrency(order.total)}</span>
                        </div>
                        <div className="p-4 border rounded-lg flex justify-between items-center bg-blue-50 dark:bg-blue-950/20">
                            <span className="font-medium">Taxes</span>
                            <span className="text-blue-600 dark:text-blue-400">{formatCurrency(order.tax_value)}</span>
                        </div>
                        <div className="p-4 border rounded-lg flex justify-between items-center bg-red-50 dark:bg-red-950/20">
                            <span className="font-medium">Change</span>
                            <span className="text-red-600 dark:text-red-400">{formatCurrency(order.change)}</span>
                        </div>
                        <div className="p-4 border rounded-lg flex justify-between items-center">
                            <span className="font-medium">Paid</span>
                            <span className="text-[hsl(var(--muted-foreground))]">{formatCurrency(order.tendered)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Order Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="font-medium">Customer</span>
                            </div>
                            <span className="text-[hsl(var(--muted-foreground))]">
                                {order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'Walk-in'}
                            </span>
                        </div>

                        <div className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <Truck className="h-4 w-4" />
                                    <span className="font-medium">Delivery Status</span>
                                </div>
                                {!showDeliverySelect && (
                                    <Button
                                        variant="link"
                                        className="h-auto p-0"
                                        onClick={() => setShowDeliverySelect(true)}
                                    >
                                        {getStatusLabel(order.delivery_status, 'delivery')}
                                    </Button>
                                )}
                            </div>
                            {showDeliverySelect && (
                                <div className="flex gap-2 mt-2">
                                    <select
                                        className="flex-1 border rounded px-3 py-2"
                                        value={deliveryStatus}
                                        onChange={(e) => setDeliveryStatus(e.target.value)}
                                    >
                                        {deliveryStatuses.map(status => (
                                            <option key={status.value} value={status.value}>{status.label}</option>
                                        ))}
                                    </select>
                                    <Button variant="ghost" onClick={() => setShowDeliverySelect(false)}>Cancel</Button>
                                    <Button onClick={updateDeliveryStatus}>Save</Button>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    <span className="font-medium">Processing Status</span>
                                </div>
                                {!showProcessingSelect && (
                                    <Button
                                        variant="link"
                                        className="h-auto p-0"
                                        onClick={() => setShowProcessingSelect(true)}
                                    >
                                        {getStatusLabel(order.process_status, 'processing')}
                                    </Button>
                                )}
                            </div>
                            {showProcessingSelect && (
                                <div className="flex gap-2 mt-2">
                                    <select
                                        className="flex-1 border rounded px-3 py-2"
                                        value={processStatus}
                                        onChange={(e) => setProcessStatus(e.target.value)}
                                    >
                                        {processingStatuses.map(status => (
                                            <option key={status.value} value={status.value}>{status.label}</option>
                                        ))}
                                    </select>
                                    <Button variant="ghost" onClick={() => setShowProcessingSelect(false)}>Cancel</Button>
                                    <Button onClick={updateProcessingStatus}>Save</Button>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border rounded-lg flex justify-between items-center">
                            <span className="font-medium">Payment Status</span>
                            <span className="text-[hsl(var(--muted-foreground))]">
                                {getStatusLabel(order.payment_status, 'payment')}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Products */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.products?.map((product) => (
                            <div key={product.id} className="p-4 border rounded-lg flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium">{product.name} (x{product.quantity})</h4>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{product.unit?.name || 'N/A'}</p>
                                </div>
                                <span className="font-medium">{formatCurrency(product.total_price)}</span>
                            </div>
                        ))}

                        {order.refunded_products && order.refunded_products.length > 0 && (
                            <>
                                <div className="pt-4 border-t">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-medium">Refunded Products</h4>
                                        <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/app/orders/${id}/refund`)}>
                                            All Refunds
                                        </Button>
                                    </div>
                                    {order.refunded_products.map((product, index) => (
                                        <div key={index} className="p-4 border rounded-lg flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium">{product.order_product.name} (x{product.quantity})</h4>
                                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                    {product.unit?.name || 'N/A'} |{' '}
                                                    <span className={`px-2 py-1 rounded-full text-xs ${product.condition === 'damaged'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                        }`}>
                                                        {product.condition}
                                                    </span>
                                                </p>
                                            </div>
                                            <span className="font-medium">{formatCurrency(product.total_price)}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
