import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface SkuParent {
  id: string
  code: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  author: string | null
}

export interface CreateSkuParentData {
  code: string
  name: string
  description?: string
}

export function useSkuParents() {
  const [skuParents, setSkuParents] = useState<SkuParent[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchSkuParents = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sku_parents')
        .select('*')
        .order('code', { ascending: true })

      if (error) throw error
      setSkuParents(data || [])
    } catch (err: any) {
      console.error('Error fetching SKU parents:', err)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load SKU parents'
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSkuParents()
  }, [fetchSkuParents])

  const createSkuParent = async (data: CreateSkuParentData): Promise<SkuParent | null> => {
    try {
      const { data: user } = await supabase.auth.getUser()
      
      const { data: newParent, error } = await supabase
        .from('sku_parents')
        .insert({
          code: data.code,
          name: data.name,
          description: data.description || null,
          author: user?.user?.id || null
        })
        .select()
        .single()

      if (error) throw error

      setSkuParents(prev => [...prev, newParent].sort((a, b) => a.code.localeCompare(b.code)))
      
      toast({
        title: 'Success',
        description: 'SKU Parent created successfully'
      })
      
      return newParent
    } catch (err: any) {
      console.error('Error creating SKU parent:', err)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to create SKU parent'
      })
      return null
    }
  }

  const updateSkuParent = async (id: string, data: Partial<CreateSkuParentData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sku_parents')
        .update(data)
        .eq('id', id)

      if (error) throw error

      setSkuParents(prev => 
        prev.map(p => p.id === id ? { ...p, ...data } : p)
          .sort((a, b) => a.code.localeCompare(b.code))
      )
      
      toast({
        title: 'Success',
        description: 'SKU Parent updated successfully'
      })
      
      return true
    } catch (err: any) {
      console.error('Error updating SKU parent:', err)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to update SKU parent'
      })
      return false
    }
  }

  const deleteSkuParent = async (id: string): Promise<boolean> => {
    try {
      // Check if any products are using this SKU parent
      const { data: products, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('sku_parent_id', id)
        .limit(1)

      if (checkError) throw checkError

      if (products && products.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Cannot Delete',
          description: 'This SKU Parent is being used by products. Remove products first.'
        })
        return false
      }

      const { error } = await supabase
        .from('sku_parents')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSkuParents(prev => prev.filter(p => p.id !== id))
      
      toast({
        title: 'Success',
        description: 'SKU Parent deleted successfully'
      })
      
      return true
    } catch (err: any) {
      console.error('Error deleting SKU parent:', err)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to delete SKU parent'
      })
      return false
    }
  }

  return {
    skuParents,
    loading,
    fetchSkuParents,
    createSkuParent,
    updateSkuParent,
    deleteSkuParent
  }
}
