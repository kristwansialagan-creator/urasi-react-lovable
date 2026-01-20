const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Product schema based on database columns - extractable fields
const PRODUCT_EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    name: { 
      type: 'string', 
      description: 'Product name or title' 
    },
    sku: { 
      type: 'string', 
      description: 'Stock Keeping Unit code' 
    },
    barcode: { 
      type: 'string', 
      description: 'Barcode or UPC/EAN code' 
    },
    description: { 
      type: 'string', 
      description: 'Product description' 
    },
    selling_price: { 
      type: 'number', 
      description: 'Selling/retail price (numeric value only, no currency symbols)' 
    },
    purchase_price: { 
      type: 'number', 
      description: 'Purchase/cost price if available' 
    },
    wholesale_price: { 
      type: 'number', 
      description: 'Wholesale price if available' 
    },
    stock_quantity: { 
      type: 'number', 
      description: 'Available stock quantity' 
    },
    category: { 
      type: 'string', 
      description: 'Product category name' 
    },
    brand: { 
      type: 'string', 
      description: 'Brand or manufacturer name' 
    },
    weight: { 
      type: 'string', 
      description: 'Product weight with unit' 
    },
    dimensions: { 
      type: 'string', 
      description: 'Product dimensions' 
    },
    image_url: { 
      type: 'string', 
      description: 'Main product image URL' 
    },
    specifications: { 
      type: 'object', 
      description: 'Additional product specifications as key-value pairs',
      additionalProperties: { type: 'string' }
    }
  },
  required: ['name']
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Extracting product data from URL:', formattedUrl);
    console.log('Using schema:', JSON.stringify(PRODUCT_EXTRACTION_SCHEMA, null, 2));

    // Call Firecrawl with extract format and JSON schema
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['extract', 'markdown'],
        extract: {
          schema: PRODUCT_EXTRACTION_SCHEMA,
          prompt: `Extract product information from this e-commerce page. 
Focus on finding: product name, SKU, barcode, description, prices (selling price, purchase price, wholesale price), 
stock quantity, category, brand, weight, dimensions, and main product image URL.
For prices, extract only the numeric value without currency symbols.
If a field is not found, leave it as null.
Return the data in the exact schema format provided.`
        },
        onlyMainContent: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extraction successful:', JSON.stringify(data, null, 2));

    // Process the response
    const extractedData = data?.data?.extract || {};
    const markdown = data?.data?.markdown || '';
    const metadata = data?.data?.metadata || {};

    // Calculate how many fields were extracted
    const extractableFields = Object.keys(PRODUCT_EXTRACTION_SCHEMA.properties);
    const filledFields = extractableFields.filter(field => {
      const value = extractedData[field];
      return value !== null && value !== undefined && value !== '';
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          extracted: extractedData,
          markdown: markdown,
          metadata: {
            ...metadata,
            sourceUrl: formattedUrl,
            extractedAt: new Date().toISOString(),
            fieldsExtracted: filledFields.length,
            totalFields: extractableFields.length,
            filledFields: filledFields,
            schema: PRODUCT_EXTRACTION_SCHEMA.properties
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error extracting product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract product data';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
