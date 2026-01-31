-- Add tax_id column to products table for direct tax assignment
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS tax_id UUID REFERENCES taxes(id) ON DELETE SET NULL;

-- Add index for tax lookups
CREATE INDEX IF NOT EXISTS idx_products_tax_id ON products(tax_id);

-- Add tax system settings
INSERT INTO settings (key, value, category) VALUES
('tax_enabled', 'false', 'tax'),
('tax_calculation_method', '"exclusive"', 'tax')
ON CONFLICT (key) DO NOTHING;

-- Add comment
COMMENT ON COLUMN products.tax_id IS 'Direct reference to tax rate applied to this product';
