import { useState, useEffect } from 'react'
import { Search, Grid3x3 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCurrency, getStorageUrl } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export interface Product {
    id: string
    name: string
    sku: string
    sale_price: number
    stock_quantity: number
    category_id?: string
    image_url?: string
}

interface POSGridProps {
    onProductSelect: (product: Product) => void
}

export default function POSGrid({ onProductSelect }: POSGridProps) {
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCategories()
        fetchProducts()
    }, [])

    useEffect(() => {
        filterProducts()
    }, [products, selectedCategory, search])

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('product_categories')
                .select('id, name')
                .order('name')

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('products')
                .select('id, name, sku, sale_price, stock_quantity, category_id, thumbnail_id, thumbnail:medias(*)')
                .eq('status', 'available')
                .gt('stock_quantity', 0)

            if (error) throw error
            
            // Map products and handle null values
            const mappedProducts: Product[] = (data || []).map(p => ({
                id: p.id,
                name: p.name,
                sku: p.sku || '',
                sale_price: p.sale_price ?? 0,
                stock_quantity: p.stock_quantity ?? 0,
                category_id: p.category_id || undefined,
                image_url: getStorageUrl(p.thumbnail?.slug) || undefined
            }))
            
            setProducts(mappedProducts)
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const filterProducts = () => {
        let filtered = [...products]

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category_id === selectedCategory)
        }

        if (search) {
            const searchLower = search.toLowerCase()
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchLower) ||
                p.sku.toLowerCase().includes(searchLower)
            )
        }

        setFilteredProducts(filtered)
    }

    return (
        <div className="flex flex-col h-full">
            {/* Search and Category Filter */}
            <div className="space-y-3 mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <Input
                        placeholder="Search products by name or SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                    <Button
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory('all')}
                    >
                        All Products
                    </Button>
                    {categories.map((category) => (
                        <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-[hsl(var(--muted-foreground))]">Loading products...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Grid3x3 className="h-16 w-16 text-[hsl(var(--muted-foreground))] mb-4" />
                        <p className="text-[hsl(var(--muted-foreground))]">No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filteredProducts.map((product) => {
                            const hasImage = product.image_url
                            return (
                                <button
                                    key={product.id}
                                    onClick={() => onProductSelect(product)}
                                    className="p-4 border rounded-lg hover:border-[hsl(var(--primary))] hover:shadow-md transition-all text-left"
                                >
                                    <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 overflow-hidden">
                                        {hasImage ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder.svg'
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                    <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">
                                                        {product.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h4>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
                                        {product.sku} • Stock: {product.stock_quantity}
                                    </p>
                                    <p className="text-lg font-bold text-[hsl(var(--primary))]">
                                        {formatCurrency(product.sale_price)}
                                    </p>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
