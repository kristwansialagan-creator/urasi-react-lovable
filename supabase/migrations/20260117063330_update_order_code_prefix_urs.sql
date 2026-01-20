-- Migration: Update order code prefix from ORD to URS
-- Created: 2026-01-17
-- Purpose: Change order code format from ORD-YY-NNNNNN to URS-YY-NNNNNN

-- Drop and recreate the generate_order_code function with new prefix
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT := 'URS';  -- Changed from 'ORD' to 'URS'
    year_part TEXT := to_char(now(), 'YY');
    sequence_num INTEGER;
    new_code TEXT;
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 8) AS INTEGER)), 0) + 1
        INTO sequence_num
        FROM orders
        WHERE code LIKE prefix || '-' || year_part || '-%';
        
        new_code := prefix || '-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
        NEW.code := new_code;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger remains the same, just the function is updated
-- No need to recreate trigger as it references the function name
