/**
 * Product Extraction Context
 * 
 * Stores extracted product data from Firecrawl for use in Add Product form.
 * 
 * ============================================
 * IMPORTANT: When adding new fields, update these files:
 * ============================================
 * 1. src/schemas/productSchema.ts (schema definition - START HERE)
 * 2. supabase/functions/firecrawl-product-extract/index.ts (extraction)
 * 3. This file (ExtractedProductData interface)
 * 4. src/pages/products/ProductCreatePage.tsx (form auto-fill)
 * 
 * See: docs/PRODUCT_EXTRACTION_GUIDE.md for complete instructions
 * ============================================
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Extracted product data interface
 * Keep in sync with:
 * - src/schemas/productSchema.ts (PRODUCT_FIELDS)
 * - supabase/functions/firecrawl-product-extract/index.ts (PRODUCT_EXTRACTION_SCHEMA)
 */
export interface ExtractedProductData {
  name?: string;
  sku?: string;
  barcode?: string;
  description?: string;
  selling_price?: number;
  purchase_price?: number;
  wholesale_price?: number;
  stock_quantity?: number;
  category?: string;
  brand?: string;
  weight?: string;
  dimensions?: string;
  image_url?: string;
  specifications?: Record<string, string>;
  // New regulatory fields
  shelf_life?: string;
  bpom_number?: string;
  registration_number?: string;
  halal_number?: string;
  composition?: string;
}

export interface ExtractionMetadata {
  sourceUrl: string;
  extractedAt: string;
  fieldsExtracted: number;
  totalFields: number;
  filledFields: string[];
}

interface ProductExtractionContextType {
  extractedData: ExtractedProductData | null;
  metadata: ExtractionMetadata | null;
  isExtracting: boolean;
  setExtractedData: (data: ExtractedProductData | null, metadata?: ExtractionMetadata | null) => void;
  clearExtractedData: () => void;
  hasData: boolean;
}

const ProductExtractionContext = createContext<ProductExtractionContextType | undefined>(undefined);

export function ProductExtractionProvider({ children }: { children: React.ReactNode }) {
  const [extractedData, setExtractedDataState] = useState<ExtractedProductData | null>(null);
  const [metadata, setMetadata] = useState<ExtractionMetadata | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const setExtractedData = useCallback((data: ExtractedProductData | null, meta?: ExtractionMetadata | null) => {
    setExtractedDataState(data);
    setMetadata(meta ?? null);
  }, []);

  const clearExtractedData = useCallback(() => {
    setExtractedDataState(null);
    setMetadata(null);
  }, []);

  const hasData = extractedData !== null && Object.keys(extractedData).length > 0;

  return (
    <ProductExtractionContext.Provider value={{
      extractedData,
      metadata,
      isExtracting,
      setExtractedData,
      clearExtractedData,
      hasData
    }}>
      {children}
    </ProductExtractionContext.Provider>
  );
}

export function useProductExtraction() {
  const context = useContext(ProductExtractionContext);
  if (context === undefined) {
    throw new Error('useProductExtraction must be used within a ProductExtractionProvider');
  }
  return context;
}
