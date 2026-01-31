import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface LabelTemplate {
    id: string
    name: string
    width: number | null
    height: number | null
    template: string | null
    is_default: boolean | null
    paper_size: string | null
    created_at: string | null
    updated_at: string | null
}

export function useLabelTemplates() {
    const [templates, setTemplates] = useState<LabelTemplate[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchTemplates = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error: err } = await supabase
                .from('label_templates')
                .select('id, name, width, height, template, is_default, paper_size, created_at, updated_at')
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false })

            if (err) throw err
            setTemplates(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const createTemplate = useCallback(async (data: { name: string; width: number; height: number; template: string; is_default: boolean; paper_size: string }) => {
        try {
            const { error: err } = await supabase
                .from('label_templates')
                .insert([data])

            if (err) throw err
            await fetchTemplates()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchTemplates])

    const updateTemplate = useCallback(async (id: string, data: { name?: string; width?: number; height?: number; template?: string; is_default?: boolean; paper_size?: string }) => {
        try {
            const { error: err } = await supabase
                .from('label_templates')
                .update(data)
                .eq('id', id)

            if (err) throw err
            await fetchTemplates()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchTemplates])

    const deleteTemplate = useCallback(async (id: string) => {
        try {
            const { error: err } = await supabase
                .from('label_templates')
                .delete()
                .eq('id', id)

            if (err) throw err
            await fetchTemplates()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchTemplates])

    const setAsDefault = useCallback(async (id: string) => {
        try {
            // First, unset all defaults
            await supabase
                .from('label_templates')
                .update({ is_default: false })
                .neq('id', '00000000-0000-0000-0000-000000000000')

            // Then set the selected one as default
            const { error: err } = await supabase
                .from('label_templates')
                .update({ is_default: true })
                .eq('id', id)

            if (err) throw err
            await fetchTemplates()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchTemplates])

    return {
        templates,
        loading,
        error,
        fetchTemplates,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        setAsDefault
    }
}
