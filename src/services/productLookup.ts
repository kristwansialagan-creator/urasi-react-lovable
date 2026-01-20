import { supabase } from '@/integrations/supabase/client'

export interface ProductInfo {
    name: string
    category?: string
    description?: string
    barcode: string
    images?: string[]
    brand?: string
}

export const productLookupService = {
    async identifyAndFetch(code: string): Promise<ProductInfo | null> {
        try {
            if (code.startsWith('{') && code.endsWith('}')) {
                const data = JSON.parse(code)
                if (data.name || data.product_name) {
                    return {
                        name: data.name || data.product_name,
                        category: data.category || data.cat,
                        description: data.description || data.desc,
                        barcode: data.barcode || data.sku || data.id || code,
                        brand: data.brand
                    }
                }
            }
        } catch (e) {
        }

        if (code.includes('|')) {
            const parts = code.split('|')
            if (parts.length >= 2) {
                return {
                    barcode: parts[0].trim(),
                    name: parts[1].trim(),
                    category: parts[2]?.trim(),
                    description: parts[3]?.trim()
                }
            }
        }

        if (/^\d+$/.test(code)) {
            const firecrawlResult = await this.fetchViaFirecrawl(code)
            if (firecrawlResult) return firecrawlResult
        }

        return null
    },

    async fetchViaFirecrawl(barcode: string): Promise<ProductInfo | null> {
        const { data, error } = await supabase.functions.invoke('product-lookup', {
            body: { barcode },
        })

        if (error) {
            throw error
        }

        if (!data?.success) {
            throw new Error(data?.message || data?.error || 'Lookup failed')
        }

        if (!data?.data) return null

        const info = data.data
        const images = Array.isArray(info.images) ? info.images : []
        const image = typeof info.image === 'string' ? info.image : images[0]

        return {
            name: info.name || 'Unknown Product',
            category: info.category || 'General',
            description: info.description || '',
            barcode,
            images: image ? [image] : [],
            brand: info.brand,
        }
    }
}
