import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Barcode } from 'lucide-react'
import { useProducts, useOrders, useCustomers, useRegisters, useCoupons } from '@/hooks'
import { formatCurrency } from '@/lib/utils'


interface CartItem {
    product_id: string
    name: string
    unit_price: number
    quantity: number
    discount: number
    discount_type: 'flat' | 'percentage'
    tax_value: number
    total_price: number
}

export default function POSPage() {
    const { products, loading: productsLoading } = useProducts()
    const { paymentTypes, createOrder } = useOrders()
    const { customers } = useCustomers()
    const { getActiveRegister } = useRegisters()
    const { validateCoupon } = useCoupons()

    const [cart, setCart] = useState<CartItem[]>([])
    const [search, setSearch] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
    const [couponCode, setCouponCode] = useState('')
    const [discount, setDiscount] = useState(0)
    const [showPayment, setShowPayment] = useState(false)
    const [payments, setPayments] = useState<{ payment_type_id: string; value: number }[]>([])
    const [barcodeInput, setBarcodeInput] = useState('')

    // Barcode scanner support with Web API
    useEffect(() => {
        let barcodeBuffer = ''
        let lastKeyTime = Date.now()

        const handleKeyPress = (e: KeyboardEvent) => {
            const currentTime = Date.now()
            // If more than 50ms between keys, reset buffer (not a scanner)
            if (currentTime - lastKeyTime > 50) {
                barcodeBuffer = ''
            }
            lastKeyTime = currentTime

            if (e.key === 'Enter' && barcodeBuffer.length > 3) {
                // Barcode scanned
                handleBarcodeSearch(barcodeBuffer)
                barcodeBuffer = ''
            } else if (e.key.length === 1) {
                barcodeBuffer += e.key
            }
        }

        window.addEventListener('keypress', handleKeyPress)
        return () => window.removeEventListener('keypress', handleKeyPress)
    }, [])

    const handleBarcodeSearch = (barcode: string) => {
        const product = products.find(p => p.barcode === barcode || p.sku === barcode)
        if (product) {
            addToCart(product.id, product.name, product.selling_price)
        }
    }

    const addToCart = (productId: string, name: string, price: number) => {
        const existing = cart.find(item => item.product_id === productId)
        if (existing) {
            setCart(cart.map(item =>
                item.product_id === productId
                    ? { ...item, quantity: item.quantity + 1, total_price: (item.quantity + 1) * item.unit_price }
                    : item
            ))
        } else {
            setCart([...cart, {
                product_id: productId,
                name,
                unit_price: price,
                quantity: 1,
                discount: 0,
                discount_type: 'flat',
                tax_value: 0,
                total_price: price
            }])
        }
    }

    const updateQuantity = (productId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.product_id === productId) {
                const newQty = Math.max(0, item.quantity + delta)
                return { ...item, quantity: newQty, total_price: newQty * item.unit_price }
            }
            return item
        }).filter(item => item.quantity > 0))
    }

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.product_id !== productId))
    }

    const applyCoupon = async () => {
        if (!couponCode) return
        const validation = await validateCoupon(couponCode, subtotal)
        if (validation.valid) {
            setDiscount(validation.discount)
            alert(validation.message)
        } else {
            alert(validation.message)
            setDiscount(0)
        }
    }

    const handleCheckout = async () => {
        const activeRegister = getActiveRegister()
        if (!activeRegister) {
            alert('No active register. Please open a register first.')
            return
        }

        if (cart.length === 0) {
            alert('Cart is empty')
            return
        }

        const totalPayment = payments.reduce((sum, p) => sum + p.value, 0)
        if (totalPayment < total) {
            alert('Insufficient payment')
            return
        }

        try {
            const order = await createOrder({
                type: 'in-store',
                customer_id: selectedCustomer,
                register_id: activeRegister.id,
                products: cart,
                discount,
                discount_type: 'flat',
                note: couponCode ? `Coupon: ${couponCode}` : undefined,
                payments
            })

            if (order) {
                // Print receipt
                printReceipt(order.code, cart, subtotal, discount, total, totalPayment, totalPayment - total)

                // Reset
                setCart([])
                setDiscount(0)
                setCouponCode('')
                setPayments([])
                setShowPayment(false)
                setSelectedCustomer(null)
                alert(`Order ${order.code} created successfully!`)
            }
        } catch (err) {
            alert('Failed to create order')
        }
    }

    const printReceipt = (orderCode: string, items: CartItem[], sub: number, disc: number, tot: number, paid: number, change: number) => {
        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - ${orderCode}</title>
                <style>
                    body { font-family: 'Courier New', monospace; width: 300px; margin: 20px auto; }
                    .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; }
                    .item { display: flex; justify-content: space-between; margin: 5px 0; }
                    .totals { border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px; }
                    .total-line { display: flex; justify-content: space-between; font-weight: bold; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>URASI POS</h2>
                    <p>Order: ${orderCode}</p>
                    <p>${new Date().toLocaleString()}</p>
                </div>
                <div class="items">
                    ${items.map(item => `
                        <div class="item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>${formatCurrency(item.total_price)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="totals">
                    <div class="total-line"><span>Subtotal:</span><span>${formatCurrency(sub)}</span></div>
                    ${disc > 0 ? `<div class="total-line"><span>Discount:</span><span>-${formatCurrency(disc)}</span></div>` : ''}
                    <div class="total-line"><span>Total:</span><span>${formatCurrency(tot)}</span></div>
                    <div class="total-line"><span>Paid:</span><span>${formatCurrency(paid)}</span></div>
                    <div class="total-line"><span>Change:</span><span>${formatCurrency(change)}</span></div>
                </div>
                <div class="footer">
                    <p>Thank you for your purchase!</p>
                </div>
            </body>
            </html>
        `

        const printWindow = window.open('', '', 'width=400,height=600')
        if (printWindow) {
            printWindow.document.write(receiptHTML)
            printWindow.document.close()
            printWindow.print()
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
        (p.barcode && p.barcode.includes(search))
    )

    const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0)
    const total = subtotal - discount
    const totalPaid = payments.reduce((sum, p) => sum + p.value, 0)
    const change = totalPaid - total

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] gap-4">
            {/* Top Section: Products */}
            <div className="flex-1 overflow-hidden">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search products (or scan barcode)..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    icon={<Search className="h-4 w-4" />}
                                />
                            </div>
                            <Input
                                placeholder="Barcode..."
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && barcodeInput) {
                                        handleBarcodeSearch(barcodeInput)
                                        setBarcodeInput('')
                                    }
                                }}
                                icon={<Barcode className="h-4 w-4" />}
                                className="w-48"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                        {productsLoading ? (
                            <div className="text-center py-8">Loading products...</div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredProducts.slice(0, 50).map((product) => (
                                    <Card
                                        key={product.id}
                                        className="cursor-pointer hover:shadow-lg transition-shadow"
                                        onClick={() => addToCart(product.id, product.name, product.selling_price)}
                                    >
                                        <CardContent className="p-4 text-center">
                                            <div className="font-medium truncate">{product.name}</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">{product.sku || 'N/A'}</div>
                                            <div className="text-lg font-bold text-[hsl(var(--primary))] mt-2">
                                                {formatCurrency(product.selling_price)}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Cart */}
            <Card className="h-96">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Cart ({cart.length} items)
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4 h-80">
                    {/* Cart Items */}
                    <div className="col-span-2 overflow-y-auto border rounded p-2">
                        {cart.length === 0 ? (
                            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">Cart is empty</div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.product_id} className="flex items-center justify-between p-2 border-b">
                                    <div className="flex-1">
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                            {formatCurrency(item.unit_price)} x {item.quantity}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="icon" variant="outline" onClick={() => updateQuantity(item.product_id, -1)}>
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                                        <Button size="icon" variant="outline" onClick={() => updateQuantity(item.product_id, 1)}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" onClick={() => removeFromCart(item.product_id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="w-24 text-right font-bold">{formatCurrency(item.total_price)}</div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Summary & Payment */}
                    <div className="flex flex-col gap-3">
                        <select
                            className="px-3 py-2 border rounded"
                            value={selectedCustomer || ''}
                            onChange={(e) => setSelectedCustomer(e.target.value || null)}
                        >
                            <option value="">Walk-in Customer</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.first_name} {c.last_name}
                                </option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Coupon code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                            />
                            <Button onClick={applyCoupon} size="sm">Apply</Button>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
                            {discount > 0 && <div className="flex justify-between text-red-600"><span>Discount:</span><span>-{formatCurrency(discount)}</span></div>}
                            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total:</span><span>{formatCurrency(total)}</span></div>
                        </div>

                        {!showPayment ? (
                            <Button onClick={() => setShowPayment(true)} disabled={cart.length === 0} className="w-full" size="lg">
                                <CreditCard className="h-5 w-5 mr-2" />
                                Pay {formatCurrency(total)}
                            </Button>
                        ) : (
                            <div className="space-y-2">
                                {paymentTypes.map(pt => (
                                    <Button
                                        key={pt.id}
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            const existing = payments.find(p => p.payment_type_id === pt.id)
                                            if (existing) {
                                                setPayments(payments.filter(p => p.payment_type_id !== pt.id))
                                            } else {
                                                const remaining = total - totalPaid
                                                setPayments([...payments, { payment_type_id: pt.id, value: remaining > 0 ? remaining : 0 }])
                                            }
                                        }}
                                    >
                                        {pt.label}
                                    </Button>
                                ))}
                                {totalPaid > 0 && (
                                    <div className="space-y-1 text-sm border-t pt-2">
                                        <div className="flex justify-between"><span>Paid:</span><span className="text-green-600">{formatCurrency(totalPaid)}</span></div>
                                        {change > 0 && <div className="flex justify-between"><span>Change:</span><span className="font-bold">{formatCurrency(change)}</span></div>}
                                    </div>
                                )}
                                <Button onClick={handleCheckout} disabled={totalPaid < total} className="w-full" size="lg">
                                    Complete Sale
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
