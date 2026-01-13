import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Search,
    Plus,
    Minus,
    Trash2,
    ShoppingBag,
    User,
    CreditCard,
    Banknote,
    Wallet,
    Percent,
    X,
    Calculator,
    Pause,
    Grid,
    List,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

// Mock products
const products = [
    { id: '1', name: 'Coca Cola 500ml', price: 8000, sku: 'CC500', category: 'Beverages', image: null },
    { id: '2', name: 'Indomie Goreng', price: 3500, sku: 'IG001', category: 'Food', image: null },
    { id: '3', name: 'Aqua 600ml', price: 4000, sku: 'AQ600', category: 'Beverages', image: null },
    { id: '4', name: 'Chitato Original 68g', price: 12000, sku: 'CH068', category: 'Snacks', image: null },
    { id: '5', name: 'Teh Botol Sosro 450ml', price: 5000, sku: 'TBS45', category: 'Beverages', image: null },
    { id: '6', name: 'Pocari Sweat 500ml', price: 7500, sku: 'PS500', category: 'Beverages', image: null },
    { id: '7', name: 'Oreo Original 133g', price: 10000, sku: 'OR133', category: 'Snacks', image: null },
    { id: '8', name: 'Roti Tawar Sari Roti', price: 15000, sku: 'RTSR', category: 'Bakery', image: null },
]

interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
}

export default function POSPage() {
    const [cart, setCart] = useState<CartItem[]>([])
    const [search, setSearch] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase())
    )

    const addToCart = (product: typeof products[0]) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id)
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }]
        })
    }

    const updateQuantity = (id: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
                )
                .filter((item) => item.quantity > 0)
        )
    }

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id))
    }

    const clearCart = () => setCart([])

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

    return (
        <div className="h-[calc(100vh-7rem)] flex gap-6">
            {/* Products Section */}
            <div className="flex-1 flex flex-col">
                {/* Search and Controls */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search products by name or barcode..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Search className="h-4 w-4" />}
                            className="bg-[hsl(var(--card))]"
                        />
                    </div>
                    <div className="flex items-center gap-2 border rounded-lg p-1 bg-[hsl(var(--card))]">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Products Grid/List */}
                <div className="flex-1 overflow-y-auto">
                    <div
                        className={cn(
                            viewMode === 'grid'
                                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                                : 'space-y-2'
                        )}
                    >
                        {filteredProducts.map((product) => (
                            <Card
                                key={product.id}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => addToCart(product)}
                            >
                                <CardContent
                                    className={cn(
                                        'p-4',
                                        viewMode === 'list' && 'flex items-center justify-between'
                                    )}
                                >
                                    {viewMode === 'grid' ? (
                                        <>
                                            <div className="aspect-square rounded-lg bg-[hsl(var(--muted))] mb-3 flex items-center justify-center">
                                                <ShoppingBag className="h-8 w-8 text-[hsl(var(--muted-foreground))]/50" />
                                            </div>
                                            <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                                                {product.sku}
                                            </p>
                                            <p className="text-[hsl(var(--primary))] font-semibold mt-2">
                                                {formatCurrency(product.price)}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                                                    <ShoppingBag className="h-5 w-5 text-[hsl(var(--muted-foreground))]/50" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">{product.name}</h3>
                                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                        {product.sku}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-[hsl(var(--primary))] font-semibold">
                                                {formatCurrency(product.price)}
                                            </p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Section */}
            <Card className="w-96 flex flex-col">
                <CardContent className="flex-1 flex flex-col p-4">
                    {/* Cart Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Current Order</h2>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" title="Hold Order">
                                <Pause className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={clearCart}
                                disabled={cart.length === 0}
                                title="Clear Cart"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Customer Selection */}
                    <Button variant="outline" className="w-full justify-start gap-2 mb-4">
                        <User className="h-4 w-4" />
                        Select Customer
                    </Button>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto space-y-3">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-[hsl(var(--muted-foreground))]">
                                <ShoppingBag className="h-12 w-12 mb-2 opacity-50" />
                                <p>Cart is empty</p>
                                <p className="text-sm">Select products to add</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--muted))]/50"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{item.name}</p>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                            {formatCurrency(item.price)} × {item.quantity}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => updateQuantity(item.id, -1)}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => updateQuantity(item.id, 1)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-[hsl(var(--destructive))]"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-4 mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[hsl(var(--muted-foreground))]">Tax (10%)</span>
                            <span>{formatCurrency(tax)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                            <span>Total</span>
                            <span className="text-[hsl(var(--primary))]">{formatCurrency(total)}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <Button variant="outline" className="gap-2">
                            <Percent className="h-4 w-4" />
                            Discount
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Calculator className="h-4 w-4" />
                            Numpad
                        </Button>
                    </div>

                    {/* Payment Buttons */}
                    <div className="space-y-3 mt-4">
                        <Button className="w-full gap-2" size="lg" disabled={cart.length === 0}>
                            <Banknote className="h-5 w-5" />
                            Pay with Cash
                        </Button>
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="secondary" className="gap-2" disabled={cart.length === 0}>
                                <CreditCard className="h-4 w-4" />
                                Card
                            </Button>
                            <Button variant="secondary" className="gap-2" disabled={cart.length === 0}>
                                <Wallet className="h-4 w-4" />
                                Account
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
