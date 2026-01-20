import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface ProductGroup {
    id: string
    name: string
    description: string | null
    created_at: string
    updated_at: string
}

export interface ProductGroupItem {
    id: string
    group_id: string
    product_id: string
    created_at: string
}

export interface ProductGroupWithCount extends ProductGroup {
    products_count: number
}

interface UseProductGroupsReturn {
    groups: ProductGroupWithCount[]
    loading: boolean
    error: string | null
    fetchGroups: () => Promise<void>
    getGroup: (id: string) => Promise<ProductGroup | null>
    createGroup: (group: Partial<ProductGroup>) => Promise<ProductGroup | null>
    updateGroup: (id: string, group: Partial<ProductGroup>) => Promise<ProductGroup | null>
    deleteGroup: (id: string) => Promise<boolean>

    // Product management
    getGroupProducts: (groupId: string) => Promise<any[]>
    addProductToGroup: (groupId: string, productId: string) => Promise<boolean>
    removeProductFromGroup: (groupId: string, productId: string) => Promise<boolean>
    addProductsToGroup: (groupId: string, productIds: string[]) => Promise<boolean>
    removeProductsFromGroup: (groupId: string, productIds: string[]) => Promise<boolean>
}

export function useProductGroups(): UseProductGroupsReturn {
    const [groups, setGroups] = useState<ProductGroupWithCount[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchGroups = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('product_groups')
                .select('*')
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            // Get product counts for each group
            const groupsWithCount: ProductGroupWithCount[] = await Promise.all(
                (data || []).map(async (group): Promise<ProductGroupWithCount> => {
                    const { count } = await supabase
                        .from('product_group_items')
                        .select('*', { count: 'exact', head: true })
                        .eq('group_id', group.id)

                    return {
                        id: group.id,
                        name: group.name,
                        description: group.description,
                        created_at: group.created_at ?? '',
                        updated_at: group.updated_at ?? '',
                        products_count: count || 0
                    }
                })
            )

            setGroups(groupsWithCount)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch product groups')
        } finally {
            setLoading(false)
        }
    }, [])

    const getGroup = useCallback(async (id: string): Promise<ProductGroup | null> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('product_groups')
                .select('*')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError
            return data as ProductGroup
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch product group')
            return null
        }
    }, [])

    const createGroup = useCallback(async (group: Partial<ProductGroup>): Promise<ProductGroup | null> => {
        try {
            const { data, error: createError } = await supabase
                .from('product_groups')
                .insert(group as any)
                .select()
                .single()

            if (createError) throw createError
            await fetchGroups()
            return data as ProductGroup
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create product group')
            return null
        }
    }, [fetchGroups])

    const updateGroup = useCallback(async (id: string, group: Partial<ProductGroup>): Promise<ProductGroup | null> => {
        try {
            const { data, error: updateError } = await supabase
                .from('product_groups')
                .update(group)
                .eq('id', id)
                .select()
                .single()

            if (updateError) throw updateError
            await fetchGroups()
            return data as ProductGroup
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update product group')
            return null
        }
    }, [fetchGroups])

    const deleteGroup = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from('product_groups')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError
            await fetchGroups()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete product group')
            return false
        }
    }, [fetchGroups])

    // Product management functions
    const getGroupProducts = useCallback(async (groupId: string) => {
        try {
            const { data, error: fetchError } = await supabase
                .from('product_group_items')
                .select(`
          *,
          product:products(*)
        `)
                .eq('group_id', groupId)

            if (fetchError) throw fetchError
            return data || []
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch group products')
            return []
        }
    }, [])

    const addProductToGroup = useCallback(async (groupId: string, productId: string): Promise<boolean> => {
        try {
            const { error: insertError } = await supabase
                .from('product_group_items')
                .insert([{ group_id: groupId, product_id: productId }])

            if (insertError) throw insertError
            await fetchGroups() // Refresh counts
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add product to group')
            return false
        }
    }, [fetchGroups])

    const removeProductFromGroup = useCallback(async (groupId: string, productId: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from('product_group_items')
                .delete()
                .eq('group_id', groupId)
                .eq('product_id', productId)

            if (deleteError) throw deleteError
            await fetchGroups() // Refresh counts
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove product from group')
            return false
        }
    }, [fetchGroups])

    const addProductsToGroup = useCallback(async (groupId: string, productIds: string[]): Promise<boolean> => {
        try {
            const items = productIds.map(productId => ({
                group_id: groupId,
                product_id: productId
            }))

            const { error: insertError } = await supabase
                .from('product_group_items')
                .insert(items)

            if (insertError) throw insertError
            await fetchGroups() // Refresh counts
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add products to group')
            return false
        }
    }, [fetchGroups])

    const removeProductsFromGroup = useCallback(async (groupId: string, productIds: string[]): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from('product_group_items')
                .delete()
                .eq('group_id', groupId)
                .in('product_id', productIds)

            if (deleteError) throw deleteError
            await fetchGroups() // Refresh counts
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove products from group')
            return false
        }
    }, [fetchGroups])

    useEffect(() => {
        fetchGroups()
    }, [fetchGroups])

    return {
        groups,
        loading,
        error,
        fetchGroups,
        getGroup,
        createGroup,
        updateGroup,
        deleteGroup,
        getGroupProducts,
        addProductToGroup,
        removeProductFromGroup,
        addProductsToGroup,
        removeProductsFromGroup
    }
}
