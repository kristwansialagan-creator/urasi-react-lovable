-- Migration: Update label_templates to add individual columns
-- This migration adds the missing columns that the application code expects
-- while keeping template_data for backwards compatibility

-- Add missing columns to label_templates table
ALTER TABLE label_templates
    ADD COLUMN IF NOT EXISTS template TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS paper_size TEXT DEFAULT '80mm';

-- Migrate data from template_data JSONB to individual columns
UPDATE label_templates
SET
    template = COALESCE(template_data->>'template', ''),
    is_default = COALESCE((template_data->>'is_default')::boolean, false),
    paper_size = COALESCE(template_data->>'paper_size', '80mm')
WHERE template_data IS NOT NULL;

-- Create index on is_default for faster sorting
CREATE INDEX IF NOT EXISTS idx_label_templates_is_default ON label_templates(is_default DESC);

-- Update the RLS policies to work with new columns (existing policies continue to work)
-- No changes needed as they use (true) conditions

-- Add helpful comments
COMMENT ON COLUMN label_templates.template IS 'HTML template for label printing';
COMMENT ON COLUMN label_templates.is_default IS 'Whether this is the default template';
COMMENT ON COLUMN label_templates.paper_size IS 'Paper size for printing (58mm, 80mm, A4, etc)';
