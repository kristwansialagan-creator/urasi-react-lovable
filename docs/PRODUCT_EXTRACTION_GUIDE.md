# Product Extraction Schema Guide

## Overview

Sistem ini menggunakan **Firecrawl** untuk extract data produk dari URL e-commerce (Tokopedia, Shopee, dll).
Ketika menambah field baru ke form Add Product, ikuti langkah-langkah berikut agar extraction otomatis ter-update.

## Single Source of Truth

📁 **File utama:** `src/schemas/productSchema.ts`

File ini mendefinisikan semua field produk yang bisa di-extract. Ketika menambah field baru, mulai dari sini.

## Langkah Menambah Field Baru

### Step 1: Update Schema Definition

Edit `src/schemas/productSchema.ts`:

```typescript
export const PRODUCT_FIELDS: ProductFieldDefinition[] = [
  // ... existing fields
  { 
    key: 'new_field_name',        // Key untuk extraction (snake_case)
    type: 'string',               // string | number | boolean | object
    description: 'Description',   // Prompt untuk Firecrawl AI extraction
    formField: 'newFieldState'    // Nama state di ProductCreatePage (null jika tidak di-autofill)
  },
];
```

### Step 2: Update Edge Function

Edit `supabase/functions/firecrawl-product-extract/index.ts`:

Tambahkan field baru di `PRODUCT_EXTRACTION_SCHEMA.properties`:

```typescript
const PRODUCT_EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    // ... existing fields
    new_field_name: {
      type: 'string',
      description: 'Description untuk AI extraction'
    }
  }
};
```

### Step 3: Update ProductExtractionContext

Edit `src/contexts/ProductExtractionContext.tsx`:

Tambahkan field di interface `ExtractedProductData`:

```typescript
export interface ExtractedProductData {
  // ... existing fields
  new_field_name?: string;
}
```

### Step 4: Update ProductCreatePage (jika perlu auto-fill)

Edit `src/pages/products/ProductCreatePage.tsx`:

1. **Tambah state baru:**
```typescript
const [newFieldName, setNewFieldName] = useState('')
```

2. **Tambah auto-fill di useEffect:**
```typescript
useEffect(() => {
  if (extractedData) {
    // ... existing auto-fills
    if (extractedData.new_field_name) setNewFieldName(extractedData.new_field_name)
  }
}, [extractedData])
```

3. **Tambah input field di form JSX**

---

## Quick Reference: Files yang Harus Di-update

| Action | File | Wajib? |
|--------|------|--------|
| Schema Definition | `src/schemas/productSchema.ts` | ✅ Ya |
| Edge Function | `supabase/functions/firecrawl-product-extract/index.ts` | ✅ Ya |
| Context Type | `src/contexts/ProductExtractionContext.tsx` | ✅ Ya |
| Form Page | `src/pages/products/ProductCreatePage.tsx` | Jika ada auto-fill |

---

## Current Fields

| Field Key | Type | Form Field | Description |
|-----------|------|------------|-------------|
| `name` | string | `name` | Product name |
| `sku` | string | `sku` | Stock Keeping Unit |
| `barcode` | string | `barcode` | Barcode/UPC/EAN |
| `description` | string | `description` | Product description |
| `selling_price` | number | `sellingPrice` | Selling price |
| `purchase_price` | number | `purchasePrice` | Purchase/cost price |
| `wholesale_price` | number | - | Wholesale price |
| `stock_quantity` | number | `stock` | Available stock |
| `category` | string | - | Category name |
| `brand` | string | - | Brand name |
| `weight` | string | - | Weight with unit |
| `dimensions` | string | - | Dimensions |
| `image_url` | string | `imageUrl` | Main image URL |
| `specifications` | object | - | Additional specs |

---

## Testing

1. Deploy edge function (otomatis saat save)
2. Buka AI Chat widget di `/products/create`
3. Test dengan URL produk spesifik:
   - ✅ `https://tokopedia.com/[toko]/[nama-produk]`
   - ✅ `https://shopee.co.id/[product-name]-i.[shop_id].[item_id]`
   - ❌ `https://tokopedia.com/find/[search]` (listing page - tidak valid)
4. Verifikasi field baru ter-extract
5. Klik "Use in Add Product" dan verifikasi auto-fill

---

## Catatan Penting

⚠️ **URL Validation:**
- Selalu gunakan URL halaman produk spesifik
- Bukan halaman listing, search, atau category

⚠️ **Form Field Mapping:**
- `formField` di schema menentukan mapping ke state form
- Jika `formField: null`, field tetap di-extract tapi tidak di-auto-fill

⚠️ **Type Consistency:**
- Pastikan type di schema sesuai dengan type di form state
- Number fields harus di-parse ke number saat auto-fill

---

## Troubleshooting

### Field tidak ter-extract
1. Cek description di schema - harus cukup jelas untuk AI
2. Pastikan field ada di edge function schema
3. Test dengan product page yang memiliki informasi tersebut

### Auto-fill tidak bekerja
1. Cek `formField` mapping di `productSchema.ts`
2. Pastikan useEffect di ProductCreatePage handle field tersebut
3. Cek console untuk error

### Build error
Pastikan `package.json` memiliki script:
```json
"build:dev": "vite build --mode development"
```
