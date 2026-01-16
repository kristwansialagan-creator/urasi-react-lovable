-- Create label_templates table
CREATE TABLE IF NOT EXISTS label_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    width NUMERIC DEFAULT 50,
    height NUMERIC DEFAULT 30,
    template_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create settings_storage table
CREATE TABLE IF NOT EXISTS settings_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB DEFAULT '{}'::jsonb,
    module TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add sale_price column to products table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'sale_price'
    ) THEN
        ALTER TABLE products ADD COLUMN sale_price NUMERIC DEFAULT 0;
    END IF;
END $$;

-- Add RLS policies for label_templates
ALTER TABLE label_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON label_templates
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON label_templates
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON label_templates
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Enable delete for authenticated users" ON label_templates
    FOR DELETE
    TO authenticated
    USING (true);

-- Add RLS policies for settings_storage
ALTER TABLE settings_storage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON settings_storage
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON settings_storage
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON settings_storage
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Enable delete for authenticated users" ON settings_storage
    FOR DELETE
    TO authenticated
    USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_label_templates_name ON label_templates(name);
CREATE INDEX IF NOT EXISTS idx_settings_storage_key ON settings_storage(key);
CREATE INDEX IF NOT EXISTS idx_settings_storage_module ON settings_storage(module);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_label_templates_updated_at BEFORE UPDATE ON label_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_storage_updated_at BEFORE UPDATE ON settings_storage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE label_templates IS 'Stores product label template configurations';
COMMENT ON TABLE settings_storage IS 'Stores module and application settings';
COMMENT ON COLUMN products.sale_price IS 'Retail/sale price for the product';
