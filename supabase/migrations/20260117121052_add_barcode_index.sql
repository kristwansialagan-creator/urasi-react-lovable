-- Add index for faster barcode lookups
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);

-- Ensure Realtime is enabled for broadcasting
BEGIN;
  -- Check if publication exists, otherwise create it (Supabase usually has supabase_realtime)
  -- We just need to ensure we can broadcast messages. 
  -- In Supabase, client-to-client broadcast is enabled by default for 'public' topics.
  -- This migration just adds the performance index.
COMMIT;
