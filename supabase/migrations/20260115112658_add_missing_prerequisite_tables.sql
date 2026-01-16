-- Migration: Add Order Management and Procurement Tables
-- This migration adds all missing tables needed for the new features

-- ============================================================================
-- STEP 1: Create order_products table (prerequisite for order_refunds)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.order_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    unit_id UUID REFERENCES public.units(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_products_order_id ON public.order_products(order_id);
CREATE INDEX IF NOT EXISTS idx_order_products_product_id ON public.order_products(product_id);

ALTER TABLE public.order_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view order products"
ON public.order_products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert order products"
ON public.order_products FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update order products"
ON public.order_products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete order products"
ON public.order_products FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- STEP 2: Create order_refunds table (depends on order_products)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.order_refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    order_product_id UUID NOT NULL REFERENCES public.order_products(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    condition VARCHAR(50) NOT NULL DEFAULT 'unspoiled', -- 'damaged' or 'unspoiled'
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit_id UUID REFERENCES public.units(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_refunds_order_id ON public.order_refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_order_refunds_order_product_id ON public.order_refunds(order_product_id);

ALTER TABLE public.order_refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view order refunds"
ON public.order_refunds FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert order refunds"
ON public.order_refunds FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update order refunds"
ON public.order_refunds FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete order refunds"
ON public.order_refunds FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- STEP 3: Create order_payments table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.order_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    payment_type UUID REFERENCES public.payment_types(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_payments_order_id ON public.order_payments(order_id);

ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view order payments"
ON public.order_payments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert order payments"
ON public.order_payments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update order payments"
ON public.order_payments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete order payments"
ON public.order_payments FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- STEP 4: Create product_groups table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.product_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.product_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view product groups"
ON public.product_groups FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert product groups"
ON public.product_groups FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update product groups"
ON public.product_groups FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete product groups"
ON public.product_groups FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- STEP 5: Create product_group_items table (depends on product_groups)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.product_group_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.product_groups(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_group_items_group_id ON public.product_group_items(group_id);
CREATE INDEX IF NOT EXISTS idx_product_group_items_product_id ON public.product_group_items(product_id);

ALTER TABLE public.product_group_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view product group items"
ON public.product_group_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert product group items"
ON public.product_group_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update product group items"
ON public.product_group_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete product group items"
ON public.product_group_items FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- STEP 6: Add triggers for updated_at columns
-- ============================================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to all new tables
CREATE TRIGGER update_order_products_updated_at
    BEFORE UPDATE ON public.order_products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_refunds_updated_at
    BEFORE UPDATE ON public.order_refunds
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_payments_updated_at
    BEFORE UPDATE ON public.order_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_groups_updated_at
    BEFORE UPDATE ON public.product_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_group_items_updated_at
    BEFORE UPDATE ON public.product_group_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
