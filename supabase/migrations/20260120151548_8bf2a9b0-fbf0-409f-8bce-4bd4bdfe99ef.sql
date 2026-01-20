-- Create stock_batches table for batch/expiry tracking
CREATE TABLE public.stock_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES public.units(id) NOT NULL,
  batch_number TEXT NOT NULL,
  expiry_date DATE,
  quantity NUMERIC DEFAULT 0,
  initial_quantity NUMERIC DEFAULT 0,
  purchase_price NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  author UUID REFERENCES public.profiles(id)
);

-- Indexes for FEFO query performance
CREATE INDEX idx_stock_batches_product ON public.stock_batches(product_id);
CREATE INDEX idx_stock_batches_expiry ON public.stock_batches(expiry_date ASC NULLS LAST);
CREATE INDEX idx_stock_batches_product_unit ON public.stock_batches(product_id, unit_id);

-- Enable RLS
ALTER TABLE public.stock_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view stock_batches" ON public.stock_batches FOR SELECT USING (true);
CREATE POLICY "Users can insert stock_batches" ON public.stock_batches FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update stock_batches" ON public.stock_batches FOR UPDATE USING (true);
CREATE POLICY "Users can delete stock_batches" ON public.stock_batches FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_stock_batches_updated_at
  BEFORE UPDATE ON public.stock_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add batch tracking columns to orders_products
ALTER TABLE public.orders_products ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.stock_batches(id);
ALTER TABLE public.orders_products ADD COLUMN IF NOT EXISTS batch_number TEXT;
ALTER TABLE public.orders_products ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Add batch tracking columns to products_history
ALTER TABLE public.products_history ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.stock_batches(id);
ALTER TABLE public.products_history ADD COLUMN IF NOT EXISTS batch_number TEXT;
ALTER TABLE public.products_history ADD COLUMN IF NOT EXISTS expiry_date DATE;