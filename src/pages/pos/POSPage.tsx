import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Check, PackageSearch, Smartphone, Package, X, Banknote, Building2, QrCode, Wallet as WalletIcon, Coins } from 'lucide-react'
import { useProducts, useOrders, useCustomers, useRegisters, useCoupons, useSettings } from '@/hooks'
import { formatCurrency, getStorageUrl } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import { BarcodeScanner } from '@/components/barcode/BarcodeScanner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'


interface CartItem {
    product_id: string
    name: string
    unit_price: number
    quantity: number
    unit_id?: string
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
    const { toast } = useToast()

    const [cart, setCart] = useState<CartItem[]>([])
    const [search, setSearch] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
    const [couponCode, setCouponCode] = useState('')
    const [discount, setDiscount] = useState(0)
    const [payments, setPayments] = useState<{ payment_type_id: string; value: number }[]>([])

    // Remote Scanner State
    const [remoteSessionId, setRemoteSessionId] = useState<string>('')
    const [qrCodeUrl, setQrCodeUrl] = useState('')

    const addToCart = useCallback((product: any) => {
        const productId = product.id
        setCart(prevCart => {
            const existing = prevCart.find(item => item.product_id === productId)
            if (existing) {
                return prevCart.map(item =>
                    item.product_id === productId
                        ? { ...item, quantity: item.quantity + 1, total_price: (item.quantity + 1) * item.unit_price }
                        : item
                )
            } else {
                const unitId = product.stock && product.stock.length > 0 ? product.stock[0]?.unit_id : undefined
                return [...prevCart, {
                    product_id: productId,
                    name: product.name,
                    unit_price: product.selling_price,
                    quantity: 1,
                    unit_id: unitId,
                    discount: 0,
                    discount_type: 'flat' as const,
                    tax_value: 0,
                    total_price: product.selling_price
                }]
            }
        })
    }, [])

    const handleBarcodeSearch = useCallback((barcode: string) => {
        const product = products.find(p => p.barcode === barcode || p.sku === barcode)
        if (product) {
            addToCart(product)
            toast({
                title: "Product Added",
                description: `${product.name} added to cart`,
                duration: 2000
            })
        } else {
            toast({
                variant: "destructive",
                title: "Not Found",
                description: `Product with barcode ${barcode} not found`,
                duration: 3000
            })
        }
    }, [products, addToCart, toast])

    // Generate Session ID on mount
    useEffect(() => {
        const id = Math.random().toString(36).substring(2, 8).toUpperCase()
        setRemoteSessionId(id)

        const url = `${window.location.origin}/scanner/${id}`
        QRCode.toDataURL(url)
            .then(setQrCodeUrl)
            .catch(console.error)

        const channel = supabase.channel(`scanner:${id}`)
        channel
            .on('broadcast', { event: 'scan' }, ({ payload }) => {
                if (payload.code) {
                    handleBarcodeSearch(payload.code)
                    toast({
                        title: "Remote Scan",
                        description: `Received: ${payload.code}`,
                        duration: 1500
                    })
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [handleBarcodeSearch, toast])

    // Hook for External/Keyboard Scanners
    useBarcodeScanner({
        onScan: (code) => handleBarcodeSearch(code)
    })

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
            toast({ title: "Coupon Applied", description: validation.message })
        } else {
            toast({ variant: "destructive", title: "Invalid Coupon", description: validation.message })
            setDiscount(0)
        }
    }

    const { settings } = useSettings()

    const handleCheckout = async () => {
        const activeRegister = getActiveRegister()
        if (!activeRegister) {
            toast({ variant: "destructive", title: "Error", description: "No active register. Please open a register first." })
            return
        }

        if (cart.length === 0) {
            toast({ variant: "destructive", title: "Error", description: "Cart is empty" })
            return
        }

        const totalPayment = payments.reduce((sum, p) => sum + p.value, 0)

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
                printReceipt(order.code, cart, subtotal, discount, total, totalPayment, totalPayment - total)
                setCart([])
                setDiscount(0)
                setCouponCode('')
                setPayments([])
                setSelectedCustomer(null)
                toast({ title: "Success", description: `Order ${order.code} created successfully!` })
            }
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to create order" })
        }
    }

    const printReceipt = (orderCode: string, items: CartItem[], sub: number, disc: number, tot: number, paid: number, change: number) => {
        const storeName = settings.store_name || 'URASI POS'
        const storeAddress = settings.store_address || ''
        const storePhone = settings.store_phone || ''
        const logoUrl = settings.receipt_logo_url || ''
        const headerText = settings.receipt_header || ''
        const footerText = settings.receipt_footer || 'Thank you for your purchase!'
        const showStoreName = settings.receipt_show_store_name ?? true
        const showStoreAddress = settings.receipt_show_store_address ?? true
        const showStorePhone = settings.receipt_show_store_phone ?? true
        const showCashier = settings.receipt_show_cashier ?? true
        const paperSize = settings.receipt_paper_size || '80mm'
        const fontSize = settings.receipt_font_size || '12'

        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - ${orderCode}</title>
                <style>
                    body { 
                        font-family: 'Courier New', monospace; 
                        width: ${paperSize === '58mm' ? '58mm' : '80mm'}; 
                        margin: 20px auto;
                        font-size: ${fontSize}px;
                        line-height: 1.4;
                    }
                    .center { text-align: center; }
                    .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; }
                    .item { display: flex; justify-content: space-between; margin: 5px 0; }
                    .totals { border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px; }
                    .total-line { display: flex; justify-content: space-between; font-weight: bold; }
                    .footer { text-align: center; margin-top: 20px; font-size: ${Math.max(10, parseInt(fontSize) - 1)}px; }
                </style>
            </head>
            <body>
                ${logoUrl ? `<div class="center"><img src="${logoUrl}" style="max-width: 80%; height: auto; margin-bottom: 10px;"></div>` : ''}
                <div class="header">
                    ${showStoreName ? `<h2>${storeName}</h2>` : ''}
                    ${showStoreAddress ? `<div>${storeAddress}</div>` : ''}
                    ${showStorePhone ? `<div>Telp: ${storePhone}</div>` : ''}
                    ${headerText ? `<div style="margin-top: 10px;">${headerText}</div>` : ''}
                </div>
                <div style="margin: 10px 0;">
                    <div>Tanggal: ${new Date().toLocaleString('id-ID')}</div>
                    <div>Order: ${orderCode}</div>
                    ${showCashier ? `<div>Kasir: Staff</div>` : ''}
                </div>
                <div style="border-top: 1px dashed #000; padding-top: 10px;">
                    ${items.map(item => `<div class="item"><span>${item.name} x${item.quantity}</span><span>${formatCurrency(item.total_price)}</span></div>`).join('')}
                </div>
                <div class="totals">
                    <div class="total-line"><span>Subtotal:</span><span>${formatCurrency(sub)}</span></div>
                    ${disc > 0 ? `<div class="total-line"><span>Diskon:</span><span>-${formatCurrency(disc)}</span></div>` : ''}
                    <div class="total-line"><span>Total:</span><span>${formatCurrency(tot)}</span></div>
                    <div class="total-line"><span>Dibayar:</span><span>${formatCurrency(paid)}</span></div>
                    <div class="total-line"><span>Kembali:</span><span>${formatCurrency(change)}</span></div>
                </div>
                <div class="footer"><p>${footerText}</p><p style="margin-top: 10px;">***</p></div>
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

    const filteredProducts = useMemo(() => {
        if (!search) return products
        const lowerSearch = search.toLowerCase().trim()
        return products.filter(p =>
            (p.name || '').toLowerCase().includes(lowerSearch) ||
            (p.sku && p.sku.toLowerCase().includes(lowerSearch)) ||
            (p.barcode && p.barcode.includes(lowerSearch))
        )
    }, [products, search])

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && search.trim()) {
            const term = search.trim().toLowerCase()
            const exactMatch = products.find(p =>
                (p.sku && p.sku.toLowerCase() === term) ||
                (p.barcode && p.barcode === term)
            )

            if (exactMatch) {
                addToCart(exactMatch)
                setSearch('')
                toast({ title: "Product Added", description: `${exactMatch.name} added to cart.` })
                return
            }

            if (filteredProducts.length === 1) {
                const product = filteredProducts[0]
                addToCart(product)
                setSearch('')
                toast({ title: "Product Added", description: `${product.name} added to cart.` })
            }
        }
    }

    // Clock State
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0)
    const total = subtotal - discount
    const totalPaid = payments.reduce((sum, p) => sum + p.value, 0)
    const change = totalPaid - total

    const cancelOrder = () => {
        setCart([])
        setDiscount(0)
        setCouponCode('')
        setPayments([])
        setSelectedCustomer(null)
    }

    return (
        <div className="flex flex-col h-full min-h-0 gap-2">
            {/* Clock Header */}
            <div className="flex justify-end px-1 shrink-0">
                <div className="text-xs font-medium text-muted-foreground flex items-center gap-2 bg-card px-3 py-1 rounded-full shadow-sm border">
                    <span className="hidden sm:inline">
                        {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="sm:hidden text-[10px]">
                        {currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="w-px h-4 bg-border"></span>
                    <span className="font-mono font-bold text-primary text-xs">
                        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':')}
                    </span>
                </div>
            </div>

            {/* Main Content - 3 Column Layout */}
            <div className="flex flex-1 min-h-0 gap-2">
                {/* Column 1: Product Catalog */}
                <div className="flex-1 min-w-0 flex flex-col min-h-0">
                    <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <CardHeader className="py-2 px-3 border-b shrink-0">
                            <div className="flex gap-2 items-center">
                                {/* Combined Search/Scan Input */}
                                <div className="flex-1 relative">
                                    <Input
                                        placeholder="Search or scan barcode..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={handleSearchKeyDown}
                                        className="h-9 text-sm pl-9"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>

                                {/* Camera Scanner Button */}
                                <BarcodeScanner onScan={handleBarcodeSearch} />

                                {/* Remote Scanner Button */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="icon" title="Connect Mobile Scanner" className="h-9 w-9">
                                            <Smartphone className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md bg-card">
                                        <DialogHeader>
                                            <DialogTitle>Remote Scanner</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex flex-col items-center p-4">
                                            <div className="bg-white p-4 rounded-lg border">
                                                {qrCodeUrl ? (
                                                    <img src={qrCodeUrl} alt="Scan to connect" className="w-48 h-48" />
                                                ) : (
                                                    <div className="w-48 h-48 flex items-center justify-center bg-muted animate-pulse rounded">
                                                        Loading...
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center mt-4 space-y-2">
                                                <p className="text-sm font-semibold">Scan with your phone</p>
                                                <p className="text-xs text-muted-foreground">Your phone will become a scanner for this POS session.</p>
                                                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">Session: {remoteSessionId}</span>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>

                        {/* Product List - Vertical scrollable */}
                        <CardContent className="flex-1 overflow-y-auto p-2 min-h-0">
                            {productsLoading ? (
                                <div className="text-center py-8 text-sm text-muted-foreground">Loading products...</div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <PackageSearch className="h-12 w-12 mb-3 opacity-50" />
                                    <p className="text-sm font-medium">No products found</p>
                                    <p className="text-xs">Try searching for something else</p>
                                    {search && (
                                        <Button variant="link" onClick={() => setSearch('')} className="mt-2 text-xs">
                                            Clear search
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredProducts.slice(0, 100).map((product) => {
                                        const hasImage = !!product.thumbnail?.slug
                                        return (
                                            <div
                                                key={product.id}
                                                className="flex items-center gap-3 p-2 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors active:scale-[0.99]"
                                                onClick={() => addToCart(product)}
                                            >
                                                {/* Product Image */}
                                                <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                                                    {hasImage ? (
                                                        <img
                                                            src={getStorageUrl(product.thumbnail?.slug) || '/placeholder.svg'}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                                                        />
                                                    ) : (
                                                        <Package className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate">{product.name}</div>
                                                    <div className="text-xs text-muted-foreground truncate">{product.sku || 'No SKU'}</div>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right shrink-0">
                                                    <div className="font-bold text-sm text-primary">{formatCurrency(product.selling_price)}</div>
                                                    <div className="text-[10px] text-muted-foreground">Stock: {product.stock?.[0]?.quantity ?? 0}</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Column 2: Current Order */}
                <div className="w-[260px] shrink-0 flex flex-col min-h-0">
                    <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <CardHeader className="py-2 px-3 border-b shrink-0">
                            <CardTitle className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4" />
                                    <span>Current Order ({cart.length})</span>
                                </div>
                                {cart.length > 0 && (
                                    <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive hover:text-destructive" onClick={cancelOrder}>
                                        <X className="h-3 w-3 mr-1" /> Clear
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>

                        {/* Cart Items */}
                        <CardContent className="flex-1 overflow-y-auto p-2 min-h-0">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                    <ShoppingCart className="h-8 w-8 mb-2 opacity-50" />
                                    <p className="text-xs">Cart is empty</p>
                                    <p className="text-[10px]">Click products to add</p>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {cart.map((item) => (
                                        <div key={item.product_id} className="p-2 rounded border bg-muted/30">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-xs truncate">{item.name}</div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {formatCurrency(item.unit_price)} each
                                                    </div>
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-5 w-5 text-destructive hover:text-destructive shrink-0"
                                                    onClick={() => removeFromCart(item.product_id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center justify-between mt-1.5">
                                                <div className="flex items-center gap-1">
                                                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.product_id, -1)}>
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.product_id, 1)}>
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="font-bold text-xs">{formatCurrency(item.total_price)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>

                        {/* Cart Footer - Customer & Coupon */}
                        <div className="shrink-0 p-2 border-t bg-muted/10 space-y-2">
                            {/* Customer Select */}
                            <Select value={selectedCustomer || 'walk-in'} onValueChange={(v) => setSelectedCustomer(v === 'walk-in' ? null : v)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Walk-in Customer" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-[150]">
                                    <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                                    {customers.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.first_name} {c.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Coupon Input */}
                            <div className="flex gap-1">
                                <Input
                                    placeholder="Coupon code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    className="h-7 text-xs"
                                />
                                <Button onClick={applyCoupon} size="sm" variant="outline" className="h-7 text-xs px-2">Apply</Button>
                            </div>

                            {/* Order Summary */}
                            <div className="space-y-1 pt-2 border-t">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-xs text-green-600">
                                        <span>Discount</span>
                                        <span>-{formatCurrency(discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-sm pt-1 border-t">
                                    <span>Total</span>
                                    <span className="text-primary">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Column 3: Payment */}
                <div className="w-[220px] shrink-0 flex flex-col min-h-0">
                    <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <CardHeader className="py-2 px-3 border-b shrink-0">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <CreditCard className="h-4 w-4" />
                                <span>Pembayaran</span>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto p-2 min-h-0 space-y-3">
                            {/* Payment Methods - Single row with icons */}
                            <div className="space-y-1">
                                {paymentTypes.map(pt => {
                                    const isSelected = payments.find(p => p.payment_type_id === pt.id)
                                    // Get icon based on identifier
                                    const getPaymentIcon = (identifier: string) => {
                                        const id = identifier.toLowerCase()
                                        if (id.includes('cash') || id.includes('tunai')) return <Banknote className="h-4 w-4" />
                                        if (id.includes('bank') || id.includes('transfer')) return <Building2 className="h-4 w-4" />
                                        if (id.includes('qris') || id.includes('qr')) return <QrCode className="h-4 w-4" />
                                        if (id.includes('credit') || id.includes('card') || id.includes('debit')) return <CreditCard className="h-4 w-4" />
                                        if (id.includes('wallet') || id.includes('ewallet') || id.includes('gopay') || id.includes('ovo') || id.includes('dana')) return <WalletIcon className="h-4 w-4" />
                                        return <Coins className="h-4 w-4" />
                                    }
                                    // Clean label - remove redundant words
                                    const cleanLabel = (label: string) => {
                                        return label
                                            .replace(/payment/gi, '')
                                            .replace(/pembayaran/gi, '')
                                            .replace(/method/gi, '')
                                            .replace(/metode/gi, '')
                                            .trim()
                                    }
                                    return (
                                        <Button
                                            key={pt.id}
                                            variant={isSelected ? "default" : "outline"}
                                            className={`w-full h-9 text-xs justify-start gap-2 ${isSelected ? 'ring-1 ring-primary' : ''}`}
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
                                            {getPaymentIcon(pt.identifier)}
                                            <span className="flex-1 text-left truncate">{cleanLabel(pt.label)}</span>
                                            {isSelected && <Check className="h-3 w-3 shrink-0" />}
                                        </Button>
                                    )
                                })}
                            </div>

                            {/* Payment Inputs */}
                            {payments.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Amount</p>
                                    {payments.map(p => {
                                        const type = paymentTypes.find(pt => pt.id === p.payment_type_id)
                                        return (
                                            <div key={p.payment_type_id} className="flex items-center gap-2">
                                                <span className="text-xs flex-1 truncate">{type?.label}</span>
                                                <Input
                                                    type="number"
                                                    value={p.value}
                                                    className="w-24 text-right font-mono h-7 text-xs"
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value)
                                                        setPayments(payments.map(pay =>
                                                            pay.payment_type_id === p.payment_type_id
                                                                ? { ...pay, value: isNaN(val) ? 0 : val }
                                                                : pay
                                                        ))
                                                    }}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {payments.length === 0 && (
                                <div className="text-center text-xs text-muted-foreground py-4">
                                    Select payment method above
                                </div>
                            )}
                        </CardContent>

                        {/* Payment Summary & Action */}
                        <div className="shrink-0 p-2 border-t bg-muted/10 space-y-2">
                            {/* Payment Summary */}
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">To Pay</span>
                                    <span className="font-bold">{formatCurrency(total)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Paid</span>
                                    <span className="font-bold">{formatCurrency(totalPaid)}</span>
                                </div>
                                <div className={`flex justify-between font-bold text-sm pt-1 border-t ${change >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                                    <span>Change</span>
                                    <span>{formatCurrency(change)}</span>
                                </div>
                            </div>

                            {/* Complete Sale Button */}
                            <Button
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                className="w-full h-10 font-semibold"
                            >
                                {cart.length === 0 ? 'No Items' :
                                    totalPaid >= total ? 'Complete Sale' :
                                        totalPaid > 0 ? 'Complete (Partial)' : 'Complete (Unpaid)'}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
