import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { barcode } = await req.json()

    if (!barcode) {
      throw new Error('Barcode is required')
    }

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY')
    
    if (!firecrawlKey) {
        // Mock Fallback Logic
        return new Response(
            JSON.stringify({ 
                success: true, 
                data: {
                    name: `Product ${barcode}`,
                    brand: "Mock Brand",
                    category: "General",
                    description: "This is a mock description because FIRECRAWL_API_KEY is not set.",
                    sourceUrl: "mock://fallback"
                } 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Use Firecrawl's new /v1/search endpoint directly
    // This is more robust than Serper + Scrape manually
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlKey}`,
      },
      body: JSON.stringify({
        query: `product barcode ${barcode}`,
        limit: 1,
        lang: "id", // Prefer Indonesian results
        scrapeOptions: {
            formats: ['json'],
            jsonOptions: {
                prompt: `Extract product details for barcode ${barcode}. Return: name, brand, category, description.`
            }
        }
      }),
    })

    const data = await response.json()
    
    if (!data.success) {
       // Fallback to simpler search if deep scrape fails
       throw new Error(data.error || 'Firecrawl search failed')
    }

    // Extract the first meaningful result
    const result = data.data?.[0]
    const extracted = result?.metadata?.json || result?.markdown || {}
    
    // Normalize data structure
    const product = {
        name: extracted.name || result?.title || "Unknown Product",
        description: extracted.description || result?.description || "",
        category: extracted.category || "General",
        brand: extracted.brand || "",
        sourceUrl: result?.url || ""
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: product,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
