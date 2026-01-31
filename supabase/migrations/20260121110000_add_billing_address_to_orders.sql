-- Add billing address column to orders table
-- This allows invoices to display customer billing address
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS billing_address JSONB DEFAULT NULL;

-- Add index for querying billing address data
CREATE INDEX IF NOT EXISTS idx_orders_billing_address 
ON orders USING GIN (billing_address);

-- Add comment
COMMENT ON COLUMN orders.billing_address IS 'Customer billing address stored as JSON with fields: address_1, address_2, city, state, country, pobox';
