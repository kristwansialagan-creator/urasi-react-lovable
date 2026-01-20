import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Media {
    id: string
    name: string
    extension: string | null
    slug: string | null
    url?: string | null
    user_id?: string | null
    created_at: string | null
    updated_at: string | null
}

export function useMedia() {
    const [media, setMedia] = useState<Media[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchMedia = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error: err } = await supabase
                .from('medias')
                .select('*')
                .order('created_at', { ascending: false })

            if (err) throw err

            // Generate URL from slug for each media item
            // Use the same URL construction pattern as POSPage.tsx
            const STORAGE_BASE = 'https://higfoctduijxbszgqhuc.supabase.co/storage/v1/object/public'
            
            const mediaWithUrls = (data || []).map((item: any) => {
                let url: string | null = null
                if (item.slug) {
                    // Check if slug already contains bucket name
                    const knownBuckets = ['product-images', 'media', 'uploads']
                    const parts = item.slug.split('/')
                    const firstPart = parts[0]
                    
                    if (knownBuckets.includes(firstPart)) {
                        // Slug format: "bucket-name/path/file.jpg" - use as-is
                        url = `${STORAGE_BASE}/${item.slug}`
                    } else {
                        // Slug is just the path, prepend bucket
                        url = `${STORAGE_BASE}/product-images/${item.slug}`
                    }
                }
                return { ...item, url } as Media
            })

            setMedia(mediaWithUrls)
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

            // Use product-images bucket (the existing public bucket)
            const bucketName = 'product-images'
            const path = `uploads/${fileName}`

            const { error: uploadErr } = await supabase.storage
                .from(bucketName)
                .upload(path, file)

            if (uploadErr) throw uploadErr

            // Save path as "bucket-name/path" format for consistency
            const slug = `${bucketName}/${path}`

            const { error: dbErr } = await supabase
                .from('medias')
                .insert([{
                    name: file.name,
                    extension: ext,
                    slug: slug,
                    user_id: user.data.user?.id
                }])

            if (dbErr) throw dbErr

            await fetchMedia()

            // Return the public URL
            const { data: urlData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(path)
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

            // Delete from storage using slug
            if (item.slug) {
                const parts = item.slug.split('/')
                const bucketName = parts[0]
                const filePath = parts.slice(1).join('/')

                if (bucketName && filePath) {
                    await supabase.storage
                        .from(bucketName)
                        .remove([filePath])
                }
            }

            // Delete from DB
            const { error: err } = await supabase
                .from('medias')
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
                .from('medias')
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
