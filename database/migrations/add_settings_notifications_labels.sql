-- Settings Table
-- Generic key-value storage for application settings
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies: Only authenticated users can read/write settings
CREATE POLICY "Allow authenticated users to read settings"
    ON settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert settings"
    ON settings FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update settings"
    ON settings FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to delete settings"
    ON settings FOR DELETE
    TO authenticated
    USING (true);

-- Index for faster lookups
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category);

-- ================================================================
-- Notifications Table
-- User notifications with real-time updates
-- ================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON notifications FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ================================================================
-- Label Templates Table
-- Barcode/label printing templates
-- ================================================================

CREATE TABLE IF NOT EXISTS label_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    width NUMERIC(10, 2),
    height NUMERIC(10, 2),
    template TEXT, -- HTML template with variables
    is_default BOOLEAN DEFAULT false,
    paper_size TEXT DEFAULT '80mm', -- 58mm, 80mm, A4, etc.
    author UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE label_templates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated users to read label templates"
    ON label_templates FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to create label templates"
    ON label_templates FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author);

CREATE POLICY "Allow users to update their own label templates"
    ON label_templates FOR UPDATE
    TO authenticated
    USING (auth.uid() = author);

CREATE POLICY "Allow users to delete their own label templates"
    ON label_templates FOR DELETE
    TO authenticated
    USING (auth.uid() = author);

-- Indexes
CREATE INDEX idx_label_templates_is_default ON label_templates(is_default);
CREATE INDEX idx_label_templates_author ON label_templates(author);

-- ================================================================
-- Insert Default Settings
-- ================================================================

INSERT INTO settings (key, value, category) VALUES
    -- General Settings
    ('store_name', '"NexoPOS Store"', 'general'),
    ('store_address', '""', 'general'),
    ('store_phone', '""', 'general'),
    ('store_email', '""', 'general'),
    ('currency_symbol', '"$"', 'general'),
    ('currency_position', '"before"', 'general'),
    ('currency_decimal_places', '2', 'general'),
    ('date_format', '"Y-m-d"', 'general'),
    ('time_format', '"H:i"', 'general'),
    ('timezone', '"UTC"', 'general'),
    ('language', '"en"', 'general'),
    
    -- POS Settings
    ('pos_quick_product', 'true', 'pos'),
    ('pos_print_receipt', 'true', 'pos'),
    ('pos_open_cash_drawer', 'false', 'pos'),
    ('pos_sound_notifications', 'true', 'pos'),
    ('pos_default_customer_id', 'null', 'pos'),
    
    -- Order Settings
    ('order_code_prefix', '"ORD-"', 'orders'),
    ('allow_partial_payments', 'true', 'orders'),
    ('quotation_expiry_days', '7', 'orders'),
    
    -- Invoice Settings
    ('invoice_template', '"default"', 'invoice'),
    ('invoice_company_logo', '""', 'invoice'),
    ('invoice_footer_text', '""', 'invoice'),
    ('invoice_show_barcode', 'true', 'invoice'),
    
    -- Customer Settings
    ('customer_registration_required', 'false', 'customers'),
    ('customer_default_group_id', 'null', 'customers'),
    ('rewards_system_enabled', 'true', 'customers')
ON CONFLICT (key) DO NOTHING;

-- ================================================================
-- Insert Default Label Template
-- ================================================================

INSERT INTO label_templates (name, width, height, template, is_default, paper_size) VALUES
    ('Default Barcode Label', 50, 30, 
    '<div style="width: 50mm; height: 30mm; padding: 5mm; text-align: center; font-family: Arial;">
        <div style="font-size: 14px; font-weight: bold;">{{product.name}}</div>
        <div style="margin: 5mm 0;">
            <svg id="barcode-{{product.id}}"></svg>
        </div>
        <div style="font-size: 12px;">{{product.sku}}</div>
        <div style="font-size: 16px; font-weight: bold;">{{product.price}}</div>
    </div>', 
    true, '80mm')
ON CONFLICT DO NOTHING;

-- ================================================================
-- Comments
-- ================================================================

COMMENT ON TABLE settings IS 'Application-wide settings stored as key-value pairs';
COMMENT ON TABLE notifications IS 'User notifications with real-time updates via Supabase Realtime';
COMMENT ON TABLE label_templates IS 'Customizable templates for product labels and barcodes';
