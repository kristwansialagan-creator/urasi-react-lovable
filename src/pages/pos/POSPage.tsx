import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Barcode, Check, PackageSearch, Smartphone, QrCode, Package } from 'lucide-react'
import { useProducts, useOrders, useCustomers, useRegisters, useCoupons, useSettings } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import { BarcodeScanner } from '@/components/barcode/BarcodeScanner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode' // You might need to install this or generate via URL


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
    const [showPayment, setShowPayment] = useState(false)
    const [payments, setPayments] = useState<{ payment_type_id: string; value: number }[]>([])
    const [barcodeInput, setBarcodeInput] = useState('')

    // Reset payment state when cart is empty
    useEffect(() => {
        if (cart.length === 0) {
            setShowPayment(false)
            setPayments([])
        }
    }, [cart.length])

    // Remote Scanner State
    const [remoteSessionId, setRemoteSessionId] = useState<string>('')
    const [qrCodeUrl, setQrCodeUrl] = useState('')

    const addToCart = useCallback((product: any) => {
        // Debug logging
        console.log('Product data:', {
            id: product.id,
            name: product.name,
            thumbnail: product.thumbnail,
            hasThumbnail: !!product.thumbnail
        });
        
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

        // Generate QR Data URL
        const url = `${window.location.origin}/scanner/${id}`
        QRCode.toDataURL(url)
            .then(setQrCodeUrl)
            .catch(console.error)

        // Subscribe to Realtime
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
        // Removed insufficient payment check to allow partial/unpaid orders


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

    const { settings } = useSettings()

    const printReceipt = (orderCode: string, items: CartItem[], sub: number, disc: number, tot: number, paid: number, change: number) => {
        // Load settings from database
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
                    table { width: 100%; border-collapse: collapse; }
                    td { padding: 2px 0; }
                    .right { text-align: right; }
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
                    <table>
                        <tr><td>Tanggal:</td><td class="right">${new Date().toLocaleString('id-ID')}</td></tr>
                        <tr><td>Order:</td><td class="right">${orderCode}</td></tr>
                        ${showCashier ? `<tr><td>Kasir:</td><td class="right">Staff</td></tr>` : ''}
                    </table>
                </div>
                
                <div style="border-top: 1px dashed #000; padding-top: 10px;">
                    ${items.map(item => `
                        <div class="item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>${formatCurrency(item.total_price)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="totals">
                    <div class="total-line"><span>Subtotal:</span><span>${formatCurrency(sub)}</span></div>
                    ${disc > 0 ? `<div class="total-line"><span>Diskon:</span><span>-${formatCurrency(disc)}</span></div>` : ''}
                    <div class="total-line"><span>Total:</span><span>${formatCurrency(tot)}</span></div>
                    <div class="total-line"><span>Dibayar:</span><span>${formatCurrency(paid)}</span></div>
                    <div class="total-line"><span>Kembali:</span><span>${formatCurrency(change)}</span></div>
                </div>
                
                <div class="footer">
                    <p>${footerText}</p>
                    <p style="margin-top: 10px;">***</p>
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

            // Priority 1: Exact SKU or Barcode match
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

            // Priority 2: If filtering results in exactly one item, select it
            if (filteredProducts.length === 1) {
                const product = filteredProducts[0]
                addToCart(product)
                setSearch('')
                toast({ title: "Product Added", description: `${product.name} added to cart.` })
                return
            }

            // Otherwise do nothing (keep filtered view)
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

    return (
        <div className="flex flex-col h-screen p-2 sm:p-4 lg:p-0 gap-2">
            {/* Clock Header */}
            <div className="flex justify-end px-1 shrink-0">
                <div className="text-xs sm:text-sm font-medium text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 sm:gap-2 bg-[hsl(var(--card))] px-2 sm:px-3 py-1 rounded-full shadow-sm border">
                    <span className="hidden sm:inline">
                        {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="sm:hidden text-[10px]">
                        {currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="w-px h-3 sm:h-4 bg-border"></span>
                    <span className="font-mono font-bold text-[hsl(var(--primary))] text-[10px] sm:text-sm">
                        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':')}
                    </span>
                </div>
            </div>

            {/* Main Content Row */}
            <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-2 sm:gap-4 items-start">
                {/* Left Section: Products */}
                <div className="flex-1 h-[50vh] lg:h-full min-h-0 self-stretch">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="pb-2 sm:pb-3 px-2 sm:px-4">
                            <div className="flex gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
                                <div className="flex-1 min-w-[150px]">
                                    <Input
                                        placeholder="Search or scan..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={handleSearchKeyDown}
                                        icon={<Search className="h-4 w-4" />}
                                        className="text-sm"
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
                                    className="w-32 lg:w-48 hidden md:flex text-sm"
                                />

                                {/* Camera Scanner Button */}
                                <BarcodeScanner onScan={handleBarcodeSearch} />

                                {/* Remote Scanner Button */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="icon" title="Connect Mobile Scanner" className="h-9 w-9 sm:h-10 sm:w-10">
                                            <Smartphone className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-2 shadow-xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-bold text-[hsl(var(--foreground))]">Remote Scanner</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex flex-col items-center justify-center p-4">
                                            <div className="w-full max-w-sm overflow-hidden rounded-xl border-2 border-[hsl(var(--ring))] bg-white relative p-6 flex justify-center">
                                                {qrCodeUrl ? (
                                                    <img src={qrCodeUrl} alt="Scan to connect" className="w-48 h-48 mix-blend-multiply" />
                                                ) : (
                                                    <div className="w-48 h-48 flex items-center justify-center bg-muted animate-pulse rounded">
                                                        Loading...
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center mt-4 space-y-2">
                                                <p className="text-base font-semibold text-[hsl(var(--foreground))]">
                                                    Scan with your phone
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Your phone will become a scanner for this POS session.
                                                </p>
                                                <div className="flex items-center justify-center gap-2 mt-2">
                                                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded border">Session: {remoteSessionId}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-2 sm:p-4">
                            {productsLoading ? (
                                <div className="text-center py-8 text-sm">Loading products...</div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-[hsl(var(--muted-foreground))] opacity-70">
                                    <PackageSearch className="h-10 sm:h-16 w-10 sm:w-16 mb-2 sm:mb-4 opacity-50" />
                                    <p className="text-sm sm:text-lg font-medium">No products found</p>
                                    <p className="text-xs sm:text-sm">Try searching for something else</p>
                                    {search && (
                                        <Button variant="link" onClick={() => setSearch('')} className="mt-2 text-xs sm:text-sm">
                                            Clear search
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-1.5 sm:gap-4 pb-2">
                                    {filteredProducts.slice(0, 50).map((product) => {
                                        // Safety check for thumbnail
                                        const hasImage = !!product.thumbnail?.slug
                                        return (
                                        <Card
                                            key={product.id}
                                            className="cursor-pointer hover:shadow-lg transition-shadow group flex flex-col h-full overflow-hidden active:scale-95"
                                            onClick={() => addToCart(product)}
                                        >
                                            <CardContent className="p-1.5 sm:p-3 text-center flex flex-col flex-1 justify-between min-h-[100px] sm:min-h-[120px]">
                                                {/* Product Image */}
                                                <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded sm:rounded-lg mb-1 sm:mb-2 overflow-hidden">
                                                    {hasImage ? (
                                                        <img
                                                            src={`https://higfoctduijxbszgqhuc.supabase.co/storage/v1/object/public/product-images/${product.thumbnail?.slug ?? ''}`}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/placeholder.svg'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="h-5 w-5 sm:h-8 sm:w-8 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="font-medium text-[10px] sm:text-sm mb-0.5 sm:mb-2 leading-tight group-hover:text-primary transition-colors break-words line-clamp-2">
                                                    {product.name}
                                                </div>
                                                <div className="mt-auto w-full">
                                                    <div className="hidden sm:block text-[10px] text-[hsl(var(--muted-foreground))] mb-0.5 truncate w-full px-1">
                                                        {product.sku || 'N/A'}
                                                    </div>
                                                    <div className="text-xs sm:text-base font-bold text-[hsl(var(--primary))] truncate w-full px-0.5 sm:px-1">
                                                        {formatCurrency(product.selling_price)}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Section: Cart */}
                <div className="w-full lg:w-[320px] xl:w-[400px] 2xl:w-[450px] flex-none h-auto max-h-[45vh] lg:max-h-full flex flex-col">
                    <Card className="flex flex-col max-h-full overflow-hidden shadow-lg">
                        <CardHeader className="py-2 sm:py-4 border-b shrink-0 px-2 sm:px-4">
                            <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                                Current Order ({cart.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col p-0 overflow-hidden">
                            {/* Cart Items List */}
                            <div className="overflow-y-auto p-4 space-y-3 flex-1">
                                {cart.length === 0 ? (
                                    <div className="h-32 flex flex-col items-center justify-center text-[hsl(var(--muted-foreground))] opacity-50">
                                        <ShoppingCart className="h-8 w-8 mb-2" />
                                        <p>Cart is empty</p>
                                        <p className="text-xs">Scan or select products</p>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item.product_id} className="flex items-start gap-3 p-3 rounded-lg border bg-[hsl(var(--muted))]/30">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{item.name}</div>
                                                <div className="text-sm text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                                                    <span>{formatCurrency(item.unit_price)}</span>
                                                    <span>x</span>
                                                    <span className="font-medium text-foreground">{item.quantity}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="flex flex-col gap-0.5">
                                                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.product_id, 1)}>
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.product_id, -1)}>
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="text-right min-w-[80px]">
                                                    <div className="font-bold">{formatCurrency(item.total_price)}</div>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 -mr-1 mt-1"
                                                        onClick={() => removeFromCart(item.product_id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Summary & Payment (Fixed at bottom of cart) */}
                            <div className="p-4 bg-[hsl(var(--muted))]/10 border-t space-y-3">
                                <select
                                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
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
                                        className="h-9 text-sm"
                                    />
                                    <Button onClick={applyCoupon} size="sm" variant="outline">Apply</Button>
                                </div>

                                <div className="space-y-1 text-sm pt-2">
                                    <div className="flex justify-between text-[hsl(var(--muted-foreground))]"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                                    {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
                                    <div className="flex justify-between font-bold text-xl pt-2 border-t mt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
                                </div>

                                {showPayment ? (
                                    <div className="w-full bg-background border-t pt-2 animate-in slide-in-from-bottom-2">
                                        {/* Inline Payment View */}
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-xs font-bold">Payment</h3>
                                            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => {
                                                setShowPayment(false)
                                                setPayments([])
                                            }}>Cancel</Button>
                                        </div>

                                        {/* Payment Methods Grid - 4 columns */}
                                        <div className="grid grid-cols-4 gap-1 mb-2 max-h-[100px] overflow-y-auto pr-1">
                                            {paymentTypes.map(pt => {
                                                const isSelected = payments.find(p => p.payment_type_id === pt.id)
                                                return (
                                                    <Button
                                                        key={pt.id}
                                                        variant={isSelected ? "default" : "outline"}
                                                        className={`h-7 text-xs px-1 justify-center relative ${isSelected ? 'border-primary ring-1 ring-primary' : ''}`}
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
                                                        <span className="truncate">{pt.label}</span>
                                                        {isSelected && <Check className="h-2 w-2 ml-1 flex-shrink-0" />}
                                                    </Button>
                                                )
                                            })}
                                        </div>

                                        {/* Payment Inputs - Always show when there are payment methods selected */}
                                        {payments.length > 0 && (
                                            <div className="space-y-1 mb-2 max-h-[80px] overflow-y-auto">
                                                {payments.map(p => {
                                                    const type = paymentTypes.find(pt => pt.id === p.payment_type_id)
                                                    return (
                                                        <div key={p.payment_type_id} className="flex items-center gap-2">
                                                            <span className="text-xs flex-1 truncate">{type?.label}</span>
                                                            <Input
                                                                type="number"
                                                                value={p.value}
                                                                className="w-20 text-right font-mono h-6 text-xs"
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

                                        {/* Show message when no payment method selected */}
                                        {payments.length === 0 && (
                                            <div className="text-center text-xs text-gray-500 py-1">
                                                Select a payment method to continue
                                            </div>
                                        )}

                                        <div className="flex justify-between text-xs font-semibold mb-2 bg-[hsl(var(--muted))] p-1 rounded">
                                            <span>Paid: {formatCurrency(totalPaid)}</span>
                                            <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                Change: {formatCurrency(change)}
                                            </span>
                                        </div>

                                        <Button 
                                            onClick={handleCheckout} 
                                            className="w-full h-10 text-sm font-semibold" 
                                            size="lg"
                                        >
                                            {totalPaid >= total ? 'Complete Sale' : totalPaid > 0 ? 'Complete (Partial)' : 'Complete (Unpaid)'}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button onClick={() => setShowPayment(true)} disabled={cart.length === 0} className="w-full h-12 text-lg shadow-md" size="lg">
                                        <div className="flex flex-col items-center -space-y-1">
                                            <span>Charge</span>
                                            <span className="text-xs opacity-90 font-normal">{formatCurrency(total)}</span>
                                        </div>
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
