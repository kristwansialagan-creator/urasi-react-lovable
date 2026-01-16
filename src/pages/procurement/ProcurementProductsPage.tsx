import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, X, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { formatCurrency } from '@/lib/utils'

interface Product {
    id: string
    name: string
    sku: string
    sale_price: number
    stock_quantity: number
}

interface GroupProduct extends Product {
    quantity: number
}

export default function ProcurementProductsPage() {
    const { groupId } = useParams<{ groupId: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [groupName, setGroupName] = useState('')
    const [groupProducts, setGroupProducts] = useState<GroupProduct[]>([])
    const [availableProducts, setAvailableProducts] = useState<Product[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddProducts, setShowAddProducts] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (groupId) {
            fetchGroupDetails()
            fetchGroupProducts()
            fetchAvailableProducts()
        }
    }, [groupId])

    const fetchGroupDetails = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('product_groups')
                .select('name')
                .eq('id', groupId)
                .single()
            if (error) throw error
            setGroupName(data.name)
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        }
    }

    const fetchGroupProducts = async () => {
        try {
            setLoading(true)
            const { data, error } = await (supabase as any)
                .from('product_group_items')
                .select(`
                    quantity,
                    product:products(id, name, sku, sale_price, stock_quantity)
                `)
                .eq('group_id', groupId)

            if (error) throw error
            const products = data?.map((item: any) => ({
                ...item.product,
                quantity: item.quantity
            })) || []
            setGroupProducts(products)
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const fetchAvailableProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, sku, sale_price, stock_quantity')
                .eq('status', 'available')

            if (error) throw error
            setAvailableProducts(data || [])
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        }
    }

    const handleAddProduct = async (product: Product) => {
        try {
            const { error } = await (supabase as any)
                .from('product_group_items')
                .insert([{
                    group_id: groupId,
                    product_id: product.id,
                    quantity: 1
                }] as any)

            if (error) throw error
            toast({ title: 'Success', description: 'Product added to group' })
            fetchGroupProducts()
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        }
    }

    const handleUpdateQuantity = async (productId: string, quantity: number) => {
        if (quantity <= 0) return
        try {
            const { error } = await (supabase as any)
                .from('product_group_items')
                .update({ quantity } as any)
                .eq('group_id', groupId || '')
                .eq('product_id', productId)

            if (error) throw error
            setGroupProducts(prev => prev.map(p => p.id === productId ? { ...p, quantity } : p))
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        }
    }

    const handleRemoveProduct = async (productId: string) => {
        try {
            const { error } = await (supabase as any)
                .from('product_group_items')
                .delete()
                .eq('group_id', groupId || '')
                .eq('product_id', productId)

            if (error) throw error
            toast({ title: 'Success', description: 'Product removed from group' })
            fetchGroupProducts()
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        }
    }

    const filteredAvailable = availableProducts.filter(p =>
        !groupProducts.find(gp => gp.id === p.id) &&
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/app/procurement/groups')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{groupName} - Products</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage products in this group</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Group Products ({groupProducts.length})</CardTitle>
                        <Button onClick={() => setShowAddProducts(!showAddProducts)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Products
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {showAddProducts && (
                        <div className="mb-6 p-4 border rounded-lg">
                            <h3 className="font-medium mb-3">Add Products to Group</h3>
                            <div className="mb-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                    <Input
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto space-y-2">
                                {filteredAvailable.length === 0 ? (
                                    <p className="text-center text-[hsl(var(--muted-foreground))] py-4">
                                        {searchQuery ? 'No products found' : 'All products already added'}
                                    </p>
                                ) : (
                                    filteredAvailable.map(product => (
                                        <div key={product.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-[hsl(var(--muted))]/50">
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                    {product.sku} • Stock: {product.stock_quantity} • {formatCurrency(product.sale_price)}
                                                </p>
                                            </div>
                                            <Button size="sm" onClick={() => handleAddProduct(product)}>
                                                Add
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="py-8 text-center">Loading...</div>
                    ) : groupProducts.length === 0 ? (
                        <div className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                            No products in this group yet
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {groupProducts.map(product => (
                                <div key={product.id} className="flex justify-between items-center p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                            {product.sku} • Stock: {product.stock_quantity} • {formatCurrency(product.sale_price)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm">Default Qty:</label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={product.quantity}
                                                onChange={(e) => handleUpdateQuantity(product.id, parseInt(e.target.value) || 1)}
                                                className="w-20"
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveProduct(product.id)}
                                        >
                                            <X className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
