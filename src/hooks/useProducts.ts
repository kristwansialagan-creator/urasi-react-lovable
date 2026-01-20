import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Product {
    id: string
    name: string
    sku: string | null
    barcode: string | null
    type: string
    status: string
    stock_management: boolean
    description: string | null
    category_id: string | null
    selling_price: number
    purchase_price: number
    tax_type: string
    thumbnail_id: string | null
    created_at: string
    updated_at: string
}

interface ProductCategory {
    id: string
    name: string
    parent_id: string | null
    description: string | null
    total_items: number | null
    displays_on_pos: boolean | null
    media_id?: string | null
    author?: string | null
    status?: 'active' | 'inactive' | null
    icon?: string | null
    thumbnail?: string | null
    created_at: string | null
    updated_at: string | null
}

interface ProductUnitQuantity {
    id: string
    product_id: string | null
    unit_id: string | null
    quantity: number
    low_quantity: number
    stock_alert_enabled: boolean
    sale_price: number
    purchase_price: number
}

interface ProductWithStock extends Product {
    category?: ProductCategory | null
    stock?: ProductUnitQuantity[]
    thumbnail?: {
        id: string
        name: string
        extension: string | null
        slug: string | null
        user_id: string | null
        created_at: string
        updated_at: string
    } | null
}

interface UseProductsReturn {
    products: ProductWithStock[]
    categories: ProductCategory[]
    loading: boolean
    error: string | null
    fetchProducts: (search?: string, categoryId?: string) => Promise<void>
    fetchCategories: () => Promise<void>
    createProduct: (product: Partial<Product>) => Promise<Product | null>
    updateProduct: (id: string, product: Partial<Product>) => Promise<Product | null>
    deleteProduct: (id: string) => Promise<boolean>
    createCategory: (category: Partial<ProductCategory>) => Promise<ProductCategory | null>
    updateCategory: (id: string, category: Partial<ProductCategory>) => Promise<ProductCategory | null>
    deleteCategory: (id: string) => Promise<boolean>
    updateStock: (productId: string, unitId: string, quantity: number) => Promise<boolean>
    getLowStockProducts: () => Promise<ProductWithStock[]>
}

export function useProducts(): UseProductsReturn {
    const [products, setProducts] = useState<ProductWithStock[]>([])
    const [categories, setCategories] = useState<ProductCategory[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchProducts = useCallback(async (search?: string, categoryId?: string) => {
        setLoading(true)
        setError(null)
        try {
            let query = supabase
                .from('products')
                .select(`
                    *,
                    category:product_categories(*),
                    stock:product_unit_quantities(*),
                    thumbnail:medias(*)
                `)
                .order('created_at', { ascending: false })

            if (search) {
                query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`)
            }
            if (categoryId) {
                query = query.eq('category_id', categoryId)
            }

            const { data, error: fetchError } = await query

            if (fetchError) throw fetchError
            setProducts((data as ProductWithStock[]) || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch products')
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchCategories = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error: fetchError } = await supabase
                .from('product_categories')
                .select('*')
                .order('name')

            if (fetchError) throw fetchError
            setCategories((data as ProductCategory[]) || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch categories')
        } finally {
            setLoading(false)
        }
    }, [])

    const createProduct = useCallback(async (product: Partial<Product>): Promise<Product | null> => {
        try {
            const { data, error: createError } = await supabase
                .from('products')
                .insert(product as any)
                .select()
                .single()

            if (createError) throw createError
            await fetchProducts()
            return data as Product
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create product')
            return null
        }
    }, [fetchProducts])

    const updateProduct = useCallback(async (id: string, product: Partial<Product>): Promise<Product | null> => {
        try {
            const { data, error: updateError } = await supabase
                .from('products')
                .update(product)
                .eq('id', id)
                .select()
                .single()

            if (updateError) throw updateError
            await fetchProducts()
            return data as Product
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update product')
            return null
        }
    }, [fetchProducts])

    const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from('products')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError
            await fetchProducts()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete product')
            return false
        }
    }, [fetchProducts])

    const createCategory = useCallback(async (category: Partial<ProductCategory>): Promise<ProductCategory | null> => {
        try {
            const { data, error: createError } = await supabase
                .from('product_categories')
                .insert(category as any)
                .select()
                .single()

            if (createError) throw createError
            await fetchCategories()
            return data as ProductCategory
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create category')
            return null
        }
    }, [fetchCategories])

    const updateCategory = useCallback(async (id: string, category: Partial<ProductCategory>): Promise<ProductCategory | null> => {
        try {
            const { data, error: updateError } = await supabase
                .from('product_categories')
                .update(category)
                .eq('id', id)
                .select()
                .single()

            if (updateError) throw updateError
            await fetchCategories()
            return data as ProductCategory
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update category')
            return null
        }
    }, [fetchCategories])

    const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from('product_categories')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError
            await fetchCategories()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete category')
            return false
        }
    }, [fetchCategories])

    const updateStock = useCallback(async (productId: string, unitId: string, quantity: number): Promise<boolean> => {
        try {
            const { error: updateError } = await supabase
                .from('product_unit_quantities')
                .upsert({
                    product_id: productId,
                    unit_id: unitId,
                    quantity
                }, { onConflict: 'product_id,unit_id' })

            if (updateError) throw updateError
            await fetchProducts()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update stock')
            return false
        }
    }, [fetchProducts])

    const getLowStockProducts = useCallback(async (): Promise<ProductWithStock[]> => {
        try {
            const { data } = await supabase
                .from('products')
                .select(`*, category:product_categories(*), stock:product_unit_quantities(*), thumbnail:medias(*)`)

            const allProducts = (data || []) as ProductWithStock[]
            return allProducts.filter(p =>
                p.stock?.some(s => s.stock_alert_enabled && s.quantity < s.low_quantity)
            )
        } catch {
            return []
        }
    }, [])

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [fetchProducts, fetchCategories])

    return {
        products,
        categories,
        loading,
        error,
        fetchProducts,
        fetchCategories,
        createProduct,
        updateProduct,
        deleteProduct,
        createCategory,
        updateCategory,
        deleteCategory,
        updateStock,
        getLowStockProducts
    }
}
