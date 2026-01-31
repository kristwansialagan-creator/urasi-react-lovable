import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getStorageUrl, parseStorageSlug } from '@/lib/utils'

interface Media {
    id: string
    name: string
    extension: string | null
    slug: string | null
    url?: string | null
    user_id?: string | null
    created_at: string | null
    updated_at: string | null
    products?: { id: string; name: string }[] // Products using this media
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

            // Fetch products for each media
            const mediaIds = (data || []).map((m: any) => m.id)
            const { data: productsData } = await supabase
                .from('products')
                .select('id, name, thumbnail_id')
                .in('thumbnail_id', mediaIds)

            // Map products to their media
            const productsByMedia = (productsData || []).reduce((acc: any, product: any) => {
                if (!acc[product.thumbnail_id]) acc[product.thumbnail_id] = []
                acc[product.thumbnail_id].push({ id: product.id, name: product.name })
                return acc
            }, {})

            // Generate URL from slug for each media item using utility function
            const mediaWithUrls = (data || []).map((item: any) => ({
                ...item,
                url: getStorageUrl(item.slug),
                products: productsByMedia[item.id] || []
            } as Media))

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
            const path = `product-images/${fileName}`

            const { error: uploadErr } = await supabase.storage
                .from(bucketName)
                .upload(path, file)

            if (uploadErr) throw uploadErr

            // Save the full storage path as slug
            // Storage structure: files at "product-images/filename.jpg" inside bucket "product-images"
            // So slug is: "product-images/filename.jpg"
            const slug = path

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
                const { bucket, filePath } = parseStorageSlug(item.slug)
                if (filePath) {
                    await supabase.storage
                        .from(bucket)
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
