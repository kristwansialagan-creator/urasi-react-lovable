// ============================================
// PRODUCT SCHEMA DEFINITION - SINGLE SOURCE OF TRUTH
// ============================================
// 
// IMPORTANT: When adding new fields to product forms,
// update this file and the schema will automatically
// propagate to:
// 1. ProductExtractionContext (frontend types)
// 2. Firecrawl Product Extract (edge function)
// 3. Product Create Form (auto-fill mapping)
//
// See: docs/PRODUCT_EXTRACTION_GUIDE.md for details
// ============================================

export interface ProductFieldDefinition {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  description: string;
  required?: boolean;
  formField?: string | null; // Mapping ke form state name
}

export const PRODUCT_FIELDS: ProductFieldDefinition[] = [
  { key: 'name', type: 'string', description: 'Product name or title', required: true, formField: 'name' },
  { key: 'sku', type: 'string', description: 'Stock Keeping Unit code', formField: 'sku' },
  { key: 'barcode', type: 'string', description: 'Barcode or UPC/EAN code', formField: 'barcode' },
  { key: 'description', type: 'string', description: 'Product description', formField: 'description' },
  { key: 'selling_price', type: 'number', description: 'Selling/retail price (numeric only, no currency symbol)', formField: 'sellingPrice' },
  { key: 'purchase_price', type: 'number', description: 'Purchase/cost price', formField: 'purchasePrice' },
  { key: 'wholesale_price', type: 'number', description: 'Wholesale price', formField: null },
  { key: 'stock_quantity', type: 'number', description: 'Available stock quantity', formField: 'stock' },
  { key: 'category', type: 'string', description: 'Product category name', formField: null },
  { key: 'brand', type: 'string', description: 'Brand or manufacturer name', formField: null },
  { key: 'weight', type: 'string', description: 'Product weight with unit (e.g., 500g, 1kg)', formField: null },
  { key: 'dimensions', type: 'string', description: 'Product dimensions (e.g., 10x5x3 cm)', formField: null },
  { key: 'image_url', type: 'string', description: 'Main product image URL', formField: 'imageUrl' },
  { key: 'specifications', type: 'object', description: 'Additional product specifications as key-value pairs', formField: null },
];

/**
 * Generate JSON Schema for Firecrawl extraction
 * Use this in the edge function to define extraction schema
 */
export function generateExtractionSchema() {
  const properties: Record<string, object> = {};
  
  PRODUCT_FIELDS.forEach(field => {
    if (field.type === 'object') {
      properties[field.key] = {
        type: 'object',
        description: field.description,
        additionalProperties: { type: 'string' }
      };
    } else {
      properties[field.key] = {
        type: field.type,
        description: field.description
      };
    }
  });

  return {
    type: 'object',
    properties,
    required: PRODUCT_FIELDS.filter(f => f.required).map(f => f.key)
  };
}

/**
 * Get fields that have form mapping
 * Useful for auto-fill logic
 */
export function getFormMappedFields() {
  return PRODUCT_FIELDS.filter(f => f.formField !== null);
}

/**
 * Get all field keys for type generation
 */
export function getFieldKeys() {
  return PRODUCT_FIELDS.map(f => f.key);
}
