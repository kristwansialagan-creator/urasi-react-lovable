import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Reward {
    id: string
    name: string
    target: number
    discount_type: 'flat' | 'percentage'
    discount_value: number
    min_points: number
    active: boolean
    author: string
    created_at: string
}

interface RewardTransaction {
    id: string
    customer_id: string
    type: 'earn' | 'redeem'
    points: number
    description: string | null
    customer?: { first_name: string; last_name: string }
    created_at: string
}

interface UseRewardsReturn {
    rewards: Reward[]
    transactions: RewardTransaction[]
    loading: boolean
    error: string | null
    fetchRewards: () => Promise<void>
    createReward: (data: Partial<Reward>) => Promise<boolean>
    updateReward: (id: string, data: Partial<Reward>) => Promise<boolean>
    deleteReward: (id: string) => Promise<boolean>
    getCustomerPoints: (customerId: string) => Promise<number>
    earnPoints: (customerId: string, points: number, reason?: string) => Promise<boolean>
    redeemPoints: (customerId: string, points: number) => Promise<boolean>
    calculatePoints: (orderTotal: number) => number
}

export function useRewards(): UseRewardsReturn {
    const [rewards, setRewards] = useState<Reward[]>([])
    const [transactions, setTransactions] = useState<RewardTransaction[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchRewards = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error: err } = await supabase
                .from('rewards_system')
                .select('*')
                .order('name')

            if (err) throw err
            setRewards(data || [])

            // Fetch transactions
            const { data: txData } = await supabase
                .from('customers_rewards')
                .select('*, customer:customers(first_name, last_name)')
                .order('created_at', { ascending: false })
                .limit(100)

            setTransactions(txData || [])
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch rewards')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchRewards()
    }, [fetchRewards])

    const createReward = useCallback(async (data: Partial<Reward>): Promise<boolean> => {
        try {
            const user = await supabase.auth.getUser()
            const { error: err } = await supabase
                .from('rewards_system')
                .insert([{ ...data, author: user.data.user?.id }] as never)

            if (err) throw err
            await fetchRewards()
            return true
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to create reward')
            return false
        }
    }, [fetchRewards])

    const updateReward = useCallback(async (id: string, data: Partial<Reward>): Promise<boolean> => {
        try {
            const { error: err } = await supabase
                .from('rewards_system')
                .update(data as never)
                .eq('id', id)

            if (err) throw err
            await fetchRewards()
            return true
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update reward')
            return false
        }
    }, [fetchRewards])

    const deleteReward = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: err } = await supabase
                .from('rewards_system')
                .delete()
                .eq('id', id)

            if (err) throw err
            await fetchRewards()
            return true
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to delete reward')
            return false
        }
    }, [fetchRewards])

    const getCustomerPoints = useCallback(async (customerId: string): Promise<number> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('customers')
                .select('reward_system_points')
                .eq('id', customerId)
                .single()

            if (fetchError) throw fetchError
            return (data as { reward_system_points: number }).reward_system_points || 0
        } catch {
            return 0
        }
    }, [])

    const earnPoints = useCallback(async (
        customerId: string,
        points: number,
        reason?: string
    ): Promise<boolean> => {
        setLoading(true)
        try {
            const currentPoints = await getCustomerPoints(customerId)
            const newPoints = currentPoints + points

            const { error: updateError } = await supabase
                .from('customers')
                .update({ reward_system_points: newPoints } as never)
                .eq('id', customerId)

            if (updateError) throw updateError

            const user = await supabase.auth.getUser()
            await supabase.from('customers_rewards').insert({
                customer_id: customerId,
                points,
                description: reason || 'Points earned',
                type: 'earn',
                author: user.data.user?.id
            } as never)

            await fetchRewards()
            return true
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to add points')
            return false
        } finally {
            setLoading(false)
        }
    }, [getCustomerPoints, fetchRewards])

    const redeemPoints = useCallback(async (
        customerId: string,
        points: number
    ): Promise<boolean> => {
        setLoading(true)
        try {
            const currentPoints = await getCustomerPoints(customerId)

            if (currentPoints < points) {
                setError('Insufficient points')
                return false
            }

            const newPoints = currentPoints - points

            const { error: updateError } = await supabase
                .from('customers')
                .update({ reward_system_points: newPoints } as never)
                .eq('id', customerId)

            if (updateError) throw updateError

            const user = await supabase.auth.getUser()
            await supabase.from('customers_rewards').insert({
                customer_id: customerId,
                points: -points,
                description: 'Points redeemed',
                type: 'redeem',
                author: user.data.user?.id
            } as never)

            await fetchRewards()
            return true
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to redeem points')
            return false
        } finally {
            setLoading(false)
        }
    }, [getCustomerPoints, fetchRewards])

    const calculatePoints = useCallback((orderTotal: number): number => {
        return Math.floor(orderTotal / 100)
    }, [])

    return {
        rewards,
        transactions,
        loading,
        error,
        fetchRewards,
        createReward,
        updateReward,
        deleteReward,
        getCustomerPoints,
        earnPoints,
        redeemPoints,
        calculatePoints
    }
}
