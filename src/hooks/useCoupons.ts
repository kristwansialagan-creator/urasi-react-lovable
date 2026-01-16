import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Coupon {
    id: string
    name: string
    code: string
    type?: string | null
    discount_value: number | null
    discount_type?: string | null
    minimum_cart_value: number | null
    valid_until: string | null
    usage_count: number | null
    active: boolean | null
    created_at: string | null
}

interface CouponValidation {
    valid: boolean
    discount: number
    message?: string
}

interface UseCouponsReturn {
    coupons: Coupon[]
    loading: boolean
    error: string | null
    fetchCoupons: () => Promise<void>
    validateCoupon: (code: string, cartTotal: number, customerId?: string) => Promise<CouponValidation>
    applyCoupon: (code: string, orderId: string) => Promise<boolean>
    createCoupon: (coupon: Partial<Coupon>) => Promise<Coupon | null>
    updateCoupon: (id: string, coupon: Partial<Coupon>) => Promise<Coupon | null>
    deleteCoupon: (id: string) => Promise<boolean>
}

export function useCoupons(): UseCouponsReturn {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchCoupons = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error: fetchError } = await (supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false }) as any)

            if (fetchError) throw fetchError
            setCoupons((data as Coupon[]) || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch coupons')
        } finally {
            setLoading(false)
        }
    }, [])

    const validateCoupon = useCallback(async (
        code: string,
        cartTotal: number
    ): Promise<CouponValidation> => {
        try {
            const { data: coupon, error: fetchError } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', code)
                .eq('active', true)
                .single()

            if (fetchError || !coupon) {
                return { valid: false, discount: 0, message: 'Invalid coupon code' }
            }

            const couponData = coupon as any
            const now = new Date()

            // Check validity dates
            if (couponData.valid_until && new Date(couponData.valid_until) < now) {
                return { valid: false, discount: 0, message: 'Coupon has expired' }
            }

            // Check minimum cart value
            if (cartTotal < (couponData.minimum_cart_value || 0)) {
                return {
                    valid: false,
                    discount: 0,
                    message: `Minimum cart value of ${couponData.minimum_cart_value} required`
                }
            }

            // Calculate discount
            const discount = couponData.discount_type === 'percentage'
                ? (cartTotal * (couponData.discount_value || 0)) / 100
                : (couponData.discount_value || 0)

            return { valid: true, discount, message: 'Coupon applied successfully' }
        } catch {
            return { valid: false, discount: 0, message: 'Error validating coupon' }
        }
    }, [])

    const applyCoupon = useCallback(async (code: string, orderId: string): Promise<boolean> => {
        try {
            const { data: coupon } = await (supabase
                .from('coupons')
                .select('*')
                .eq('code', code)
                .single() as any)

            if (!coupon) return false

            const couponData = coupon as any

            // Record coupon usage
            await supabase.from('orders_coupons').insert({
                order_id: orderId,
                coupon_id: couponData.id,
                discount_value: couponData.discount_value,
                discount_type: couponData.discount_type
            } as never)

            // Increment usage count
            await supabase
                .from('coupons')
                .update({ usage_count: (couponData.usage_count || 0) + 1 } as never)
                .eq('id', couponData.id)

            return true
        } catch {
            return false
        }
    }, [])

    const createCoupon = useCallback(async (coupon: Partial<Coupon>): Promise<Coupon | null> => {
        try {
            const { data, error: createError } = await (supabase
                .from('coupons')
                .insert(coupon as never)
                .select()
                .single() as any)

            if (createError) throw createError
            await fetchCoupons()
            return data as Coupon
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create coupon')
            return null
        }
    }, [fetchCoupons])

    const updateCoupon = useCallback(async (id: string, coupon: Partial<Coupon>): Promise<Coupon | null> => {
        try {
            const { data, error: updateError } = await (supabase
                .from('coupons')
                .update(coupon as never)
                .eq('id', id)
                .select()
                .single() as any)

            if (updateError) throw updateError
            await fetchCoupons()
            return data as Coupon
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update coupon')
            return null
        }
    }, [fetchCoupons])

    const deleteCoupon = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from('coupons')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError
            await fetchCoupons()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete coupon')
            return false
        }
    }, [fetchCoupons])

    useEffect(() => {
        fetchCoupons()
    }, [fetchCoupons])

    return {
        coupons,
        loading,
        error,
        fetchCoupons,
        validateCoupon,
        applyCoupon,
        createCoupon,
        updateCoupon,
        deleteCoupon
    }
}
