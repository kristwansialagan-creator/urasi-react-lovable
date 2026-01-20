-- Migration: 20260117130000_add_category_fields_and_audit
-- Description: Add status, icon, thumbnail to product_categories, ensure unique names, and setup audit logging.

-- 1. Add new columns to product_categories
ALTER TABLE product_categories 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS thumbnail TEXT;

-- 2. Add Unique Constraint on Name (Case Insensitive preferably, but standard unique for now)
-- First, handle potential duplicates if any exist (optional, but safer to assume clean or let it fail if duplicates exist)
-- For now, we apply the constraint. If it fails, user must clean data.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'product_categories_name_key'
    ) THEN
        ALTER TABLE product_categories ADD CONSTRAINT product_categories_name_key UNIQUE (name);
    END IF;
END $$;

-- 3. Create Audit Log System
CREATE TABLE IF NOT EXISTS system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert logs (via trigger) and read logs
CREATE POLICY "audit_logs_read" ON system_audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "audit_logs_insert" ON system_audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Create Generic Audit Trigger Function
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO system_audit_logs (table_name, record_id, action, new_values, author_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO system_audit_logs (table_name, record_id, action, old_values, new_values, author_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO system_audit_logs (table_name, record_id, action, old_values, author_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Apply Trigger to product_categories
DROP TRIGGER IF EXISTS audit_product_categories ON product_categories;
CREATE TRIGGER audit_product_categories
AFTER INSERT OR UPDATE OR DELETE ON product_categories
FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
