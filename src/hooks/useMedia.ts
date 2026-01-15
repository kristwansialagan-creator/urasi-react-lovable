import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Media {
    id: string
    name: string
    extension: string
    slug: string
    url: string | null
    alt: string | null
    author: string
    created_at: string
    updated_at: string
}

export function useMedia() {
    const [media, setMedia] = useState<Media[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchMedia = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error: err } = await supabase
                .from('media')
                .select('*')
                .order('created_at', { ascending: false })

            if (err) throw err
            setMedia(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const uploadFile = useCallback(async (file: File) => {
        setLoading(true)
        try {
            const user = await supabase.auth.getUser()
            const ext = file.name.split('.').pop() || 'unknown'
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
            const path = `uploads/${fileName}`

            // Upload to Supabase Storage
            const { error: uploadErr } = await supabase.storage
                .from('media')
                .upload(path, file)

            if (uploadErr) throw uploadErr

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('media')
                .getPublicUrl(path)

            // Create record
            const { error: dbErr } = await supabase
                .from('media')
                .insert([{
                    name: file.name,
                    extension: ext,
                    slug: path,
                    url: urlData.publicUrl,
                    author: user.data.user?.id
                }] as never)

            if (dbErr) throw dbErr

            await fetchMedia()
            return urlData.publicUrl
        } catch (err: any) {
            setError(err.message)
            return null
        } finally {
            setLoading(false)
        }
    }, [fetchMedia])

    const deleteMedia = useCallback(async (id: string) => {
        try {
            const item = media.find(m => m.id === id)
            if (!item) return false

            // Delete from storage
            if (item.slug) {
                await supabase.storage
                    .from('media')
                    .remove([item.slug])
            }

            // Delete from DB
            const { error: err } = await supabase
                .from('media')
                .delete()
                .eq('id', id)

            if (err) throw err
            await fetchMedia()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [media, fetchMedia])

    const updateMedia = useCallback(async (id: string, data: Partial<Media>) => {
        try {
            const { error: err } = await supabase
                .from('media')
                .update(data as never)
                .eq('id', id)

            if (err) throw err
            await fetchMedia()
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }, [fetchMedia])

    return {
        media,
        loading,
        error,
        fetchMedia,
        uploadFile,
        deleteMedia,
        updateMedia
    }
}
