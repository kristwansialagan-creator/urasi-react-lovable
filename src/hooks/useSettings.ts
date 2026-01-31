import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Setting {
    id: string
    key: string
    value: any
    category: string | null
    created_at: string | null
    updated_at: string | null
}

export function useSettings() {
    const [settings, setSettings] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchSettings = useCallback(async (category?: string) => {
        setLoading(true)
        try {
            let query = supabase.from('settings').select('*')

            if (category) {
                query = query.eq('category', category)
            }

            const { data, error: err } = await (query as any)

            if (err) throw err

            const settingsObject: Record<string, any> = {}
            data?.forEach((setting: Setting) => {
                settingsObject[setting.key] = setting.value
            })

            setSettings(settingsObject)
            return settingsObject
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch settings')
            return {}
        } finally {
            setLoading(false)
        }
    }, [])

    const getSetting = useCallback(async (key: string, defaultValue: any = null) => {
        try {
            const { data, error: err } = await supabase
                .from('settings')
                .select('value')
                .eq('key', key)
                .maybeSingle()

            if (err) return defaultValue
            return (data as any)?.value || defaultValue
        } catch {
            return defaultValue
        }
    }, [])

    const updateSetting = useCallback(async (key: string, value: any, category: string = 'general') => {
        try {
            const { data: existing } = await supabase
                .from('settings')
                .select('id')
                .eq('key', key)
                .maybeSingle()

            if (existing) {
                const { error: err } = await supabase
                    .from('settings')
                    .update({ value, updated_at: new Date().toISOString() } as never)
                    .eq('key', key)

                if (err) throw err
            } else {
                const { error: err } = await supabase
                    .from('settings')
                    .insert([{ key, value, category }] as never)

                if (err) throw err
            }

            setSettings(prev => ({ ...prev, [key]: value }))
            return true
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update setting')
            return false
        }
    }, [])

    const bulkUpdate = useCallback(async (settingsData: Record<string, any>, category: string = 'general') => {
        try {
            for (const [key, value] of Object.entries(settingsData)) {
                await updateSetting(key, value, category)
            }
            return true
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update settings')
            return false
        }
    }, [updateSetting])

    const deleteSetting = useCallback(async (key: string) => {
        try {
            const { error: err } = await supabase
                .from('settings')
                .delete()
                .eq('key', key)

            if (err) throw err

            setSettings(prev => {
                const updated = { ...prev }
                delete updated[key]
                return updated
            })
            return true
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to delete setting')
            return false
        }
    }, [])

    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    return {
        settings,
        loading,
        error,
        fetchSettings,
        getSetting,
        updateSetting,
        bulkUpdate,
        deleteSetting
    }
}
