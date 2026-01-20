import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface StockBatch {
  id: string
  product_id: string
  unit_id: string
  batch_number: string
  expiry_date: string | null
  quantity: number | null
  initial_quantity: number | null
  purchase_price: number | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
  author: string | null
  // Joined data
  product?: { id: string; name: string; sku: string | null } | null
  unit?: { id: string; name: string; identifier: string } | null
}

export interface CreateStockBatchData {
  product_id: string
  unit_id: string
  batch_number: string
  expiry_date?: string | null
  quantity: number
  purchase_price?: number | null
  notes?: string | null
}

export function useStockBatches(productId?: string) {
  const [batches, setBatches] = useState<StockBatch[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchBatches = useCallback(async (filterProductId?: string) => {
    setLoading(true)
    try {
      let query = supabase
        .from('stock_batches')
        .select(`
          *,
          product:products(id, name, sku),
          unit:units(id, name, identifier)
        `)
        .order('expiry_date', { ascending: true, nullsFirst: false })

      if (filterProductId) {
        query = query.eq('product_id', filterProductId)
      }

      const { data, error } = await query

      if (error) throw error
      setBatches(data || [])
    } catch (err: any) {
      console.error('Error fetching stock batches:', err)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load stock batches'
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchBatches(productId)
  }, [fetchBatches, productId])

  const createBatch = async (data: CreateStockBatchData): Promise<StockBatch | null> => {
    try {
      const { data: user } = await supabase.auth.getUser()

      const { data: newBatch, error } = await supabase
        .from('stock_batches')
        .insert({
          product_id: data.product_id,
          unit_id: data.unit_id,
          batch_number: data.batch_number,
          expiry_date: data.expiry_date || null,
          quantity: data.quantity,
          initial_quantity: data.quantity,
          purchase_price: data.purchase_price || null,
          notes: data.notes || null,
          author: user?.user?.id || null
        })
        .select(`
          *,
          product:products(id, name, sku),
          unit:units(id, name, identifier)
        `)
        .single()

      if (error) throw error

      // Update product_unit_quantities total
      await syncProductUnitQuantity(data.product_id, data.unit_id)

      setBatches(prev => [...prev, newBatch].sort((a, b) => {
        if (!a.expiry_date) return 1
        if (!b.expiry_date) return -1
        return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
      }))

      toast({
        title: 'Success',
        description: 'Stock batch added successfully'
      })

      return newBatch
    } catch (err: any) {
      console.error('Error creating stock batch:', err)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to create stock batch'
      })
      return null
    }
  }

  const updateBatch = async (id: string, data: Partial<CreateStockBatchData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('stock_batches')
        .update(data)
        .eq('id', id)

      if (error) throw error

      // Get the batch to sync quantities
      const batch = batches.find(b => b.id === id)
      if (batch) {
        await syncProductUnitQuantity(batch.product_id, batch.unit_id)
      }

      await fetchBatches(productId)

      toast({
        title: 'Success',
        description: 'Stock batch updated successfully'
      })

      return true
    } catch (err: any) {
      console.error('Error updating stock batch:', err)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to update stock batch'
      })
      return false
    }
  }

  const deleteBatch = async (id: string): Promise<boolean> => {
    try {
      const batch = batches.find(b => b.id === id)
      
      const { error } = await supabase
        .from('stock_batches')
        .delete()
        .eq('id', id)

      if (error) throw error

      if (batch) {
        await syncProductUnitQuantity(batch.product_id, batch.unit_id)
      }

      setBatches(prev => prev.filter(b => b.id !== id))

      toast({
        title: 'Success',
        description: 'Stock batch deleted successfully'
      })

      return true
    } catch (err: any) {
      console.error('Error deleting stock batch:', err)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to delete stock batch'
      })
      return false
    }
  }

  // FEFO: Deduct stock from batches with earliest expiry first
  const deductStockFEFO = async (
    targetProductId: string,
    targetUnitId: string,
    quantity: number
  ): Promise<{ success: boolean; deductions: Array<{ batch_id: string; batch_number: string; expiry_date: string | null; quantity: number }> }> => {
    try {
      // Get batches sorted by expiry date (FEFO)
      const { data: availableBatches, error: fetchError } = await supabase
        .from('stock_batches')
        .select('*')
        .eq('product_id', targetProductId)
        .eq('unit_id', targetUnitId)
        .gt('quantity', 0)
        .order('expiry_date', { ascending: true, nullsFirst: false })

      if (fetchError) throw fetchError

      if (!availableBatches || availableBatches.length === 0) {
        throw new Error('No stock available for this product')
      }

      const totalAvailable = availableBatches.reduce((sum, b) => sum + Number(b.quantity), 0)
      if (totalAvailable < quantity) {
        throw new Error(`Insufficient stock. Available: ${totalAvailable}, Required: ${quantity}`)
      }

      let remaining = quantity
      const deductions: Array<{ batch_id: string; batch_number: string; expiry_date: string | null; quantity: number }> = []

      for (const batch of availableBatches) {
        if (remaining <= 0) break

        const toDeduct = Math.min(Number(batch.quantity), remaining)

        // Update batch quantity
        const { error: updateError } = await supabase
          .from('stock_batches')
          .update({ quantity: Number(batch.quantity) - toDeduct })
          .eq('id', batch.id)

        if (updateError) throw updateError

        deductions.push({
          batch_id: batch.id,
          batch_number: batch.batch_number,
          expiry_date: batch.expiry_date,
          quantity: toDeduct
        })

        remaining -= toDeduct
      }

      // Sync total quantity in product_unit_quantities
      await syncProductUnitQuantity(targetProductId, targetUnitId)

      return { success: true, deductions }
    } catch (err: any) {
      console.error('Error deducting stock (FEFO):', err)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to deduct stock'
      })
      return { success: false, deductions: [] }
    }
  }

  // Get total stock for a product/unit from all batches
  const getTotalStock = async (targetProductId: string, targetUnitId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('stock_batches')
        .select('quantity')
        .eq('product_id', targetProductId)
        .eq('unit_id', targetUnitId)

      if (error) throw error

      return (data || []).reduce((sum, b) => sum + Number(b.quantity), 0)
    } catch (err) {
      console.error('Error getting total stock:', err)
      return 0
    }
  }

  // Sync product_unit_quantities with total from batches
  const syncProductUnitQuantity = async (targetProductId: string, targetUnitId: string) => {
    try {
      const total = await getTotalStock(targetProductId, targetUnitId)

      // Upsert product_unit_quantities
      const { error } = await supabase
        .from('product_unit_quantities')
        .upsert({
          product_id: targetProductId,
          unit_id: targetUnitId,
          quantity: total
        }, {
          onConflict: 'product_id,unit_id'
        })

      if (error) {
        // If upsert fails, try update
        await supabase
          .from('product_unit_quantities')
          .update({ quantity: total })
          .eq('product_id', targetProductId)
          .eq('unit_id', targetUnitId)
      }
    } catch (err) {
      console.error('Error syncing product unit quantity:', err)
    }
  }

  // Get batches expiring soon (within days)
  const getExpiringSoon = async (days: number = 30): Promise<StockBatch[]> => {
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)

      const { data, error } = await supabase
        .from('stock_batches')
        .select(`
          *,
          product:products(id, name, sku),
          unit:units(id, name, identifier)
        `)
        .gt('quantity', 0)
        .not('expiry_date', 'is', null)
        .lte('expiry_date', futureDate.toISOString().split('T')[0])
        .order('expiry_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching expiring batches:', err)
      return []
    }
  }

  return {
    batches,
    loading,
    fetchBatches,
    createBatch,
    updateBatch,
    deleteBatch,
    deductStockFEFO,
    getTotalStock,
    syncProductUnitQuantity,
    getExpiringSoon
  }
}
