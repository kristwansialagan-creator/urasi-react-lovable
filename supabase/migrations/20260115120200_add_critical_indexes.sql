-- ============================================================================
-- Migration: Add Critical Foreign Key Indexes
-- ============================================================================
-- Issue: 100+ foreign keys without covering indexes causing slow queries
-- Fix: Add indexes for most frequently queried foreign keys
-- Priority: Focus on orders, customers, products (high-traffic tables)
-- ============================================================================

-- ============================================================================
-- ORDERS & ORDER-RELATED TABLES (Highest Priority)
-- ============================================================================

-- Orders table - Critical for lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_register_id ON public.orders(register_id);
CREATE INDEX IF NOT EXISTS idx_orders_author ON public.orders(author);

-- Order products - Essential for order details
CREATE INDEX IF NOT EXISTS idx_order_products_order_id ON public.order_products(order_id);
CREATE INDEX IF NOT EXISTS idx_order_products_product_id ON public.order_products(product_id);
CREATE INDEX IF NOT EXISTS idx_order_products_unit_id ON public.order_products(unit_id);

-- Order payments - Critical for payment tracking
CREATE INDEX IF NOT EXISTS idx_order_payments_order_id ON public.order_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_payments_payment_type ON public.order_payments(payment_type);

-- Order refunds - Important for refund processing
CREATE INDEX IF NOT EXISTS idx_order_refunds_order_id ON public.order_refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_order_refunds_order_product_id ON public.order_refunds(order_product_id);

-- Orders products (different table)
CREATE INDEX IF NOT EXISTS idx_orders_products_order_id ON public.orders_products(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_products_product_id ON public.orders_products(product_id);

-- Orders payments (different table)
CREATE INDEX IF NOT EXISTS idx_orders_payments_order_id ON public.orders_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_payments_payment_type_id ON public.orders_payments(payment_type_id);

-- ============================================================================
-- CUSTOMERS (High Priority)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_customers_group_id ON public.customers(group_id);
CREATE INDEX IF NOT EXISTS idx_customers_author ON public.customers(author);
CREATE INDEX IF NOT EXISTS idx_customers_addresses_customer_id ON public.customers_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_coupons_customer_id ON public.customers_coupons(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_coupons_coupon_id ON public.customers_coupons(coupon_id);

-- ============================================================================
-- PRODUCTS (High Priority)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_parent_id ON public.products(parent_id);
CREATE INDEX IF NOT EXISTS idx_products_author ON public.products(author);
CREATE INDEX IF NOT EXISTS idx_products_tax_group_id ON public.products(tax_group_id);
CREATE INDEX IF NOT EXISTS idx_products_thumbnail_id ON public.products(thumbnail_id);

-- Product categories
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON public.product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_author ON public.product_categories(author);

-- Product gallery
CREATE INDEX IF NOT EXISTS idx_products_gallery_product_id ON public.products_gallery(product_id);
CREATE INDEX IF NOT EXISTS idx_products_gallery_media_id ON public.products_gallery(media_id);

-- Product history
CREATE INDEX IF NOT EXISTS idx_products_history_product_id ON public.products_history(product_id);
CREATE INDEX IF NOT EXISTS idx_products_history_author ON public.products_history(author);

-- ============================================================================
-- PROCUREMENT (Medium Priority)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_procurements_provider_id ON public.procurements(provider_id);
CREATE INDEX IF NOT EXISTS idx_procurements_products_procurement_id ON public.procurements_products(procurement_id);
CREATE INDEX IF NOT EXISTS idx_procurements_products_product_id ON public.procurements_products(product_id);

-- Product groups (new tables)
CREATE INDEX IF NOT EXISTS idx_product_group_items_group_id ON public.product_group_items(group_id);
CREATE INDEX IF NOT EXISTS idx_product_group_items_product_id ON public.product_group_items(product_id);

-- ============================================================================
-- COUPONS (Medium Priority)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_coupons_author ON public.coupons(author);
CREATE INDEX IF NOT EXISTS idx_coupons_categories_coupon_id ON public.coupons_categories(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupons_products_coupon_id ON public.coupons_products(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupons_products_product_id ON public.coupons_products(product_id);

-- ============================================================================
-- MEDIA & NOTIFICATIONS (Lower Priority)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_medias_user_id ON public.medias(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================================================
-- Performance Note
-- ============================================================================
COMMENT ON INDEX idx_orders_customer_id IS 'Critical: Improves customer order history queries';
COMMENT ON INDEX idx_order_products_order_id IS 'Critical: Improves order details page performance';
COMMENT ON INDEX idx_products_category_id IS 'Critical: Improves category filtering performance';
