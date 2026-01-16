-- ============================================================================
-- Migration: Fix Function Security (Search Path)
-- ============================================================================
-- Issue: 6 functions lack search_path configuration, vulnerable to attacks
-- Fix: Add SECURITY DEFINER and set search_path to prevent manipulation
-- ============================================================================

-- 1. Fix update_updated_at_column function
ALTER FUNCTION public.update_updated_at_column() 
    SECURITY DEFINER 
    SET search_path = public, pg_temp;

-- 2. Fix generate_order_code function
ALTER FUNCTION public.generate_order_code() 
    SECURITY DEFINER 
    SET search_path = public, pg_temp;

-- 3. Fix update_product_stock_on_order function
ALTER FUNCTION public.update_product_stock_on_order() 
    SECURITY DEFINER 
    SET search_path = public, pg_temp;

-- 4. Fix update_customer_on_order function
ALTER FUNCTION public.update_customer_on_order() 
    SECURITY DEFINER 
    SET search_path = public, pg_temp;

-- 5. Fix update_register_on_payment function
ALTER FUNCTION public.update_register_on_payment() 
    SECURITY DEFINER 
    SET search_path = public, pg_temp;

-- 6. Fix update_category_item_count function
ALTER FUNCTION public.update_category_item_count() 
    SECURITY DEFINER 
    SET search_path = public, pg_temp;

-- Verification query
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    CASE 
        WHEN prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security,
    proconfig as config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN (
        'update_updated_at_column',
        'generate_order_code',
        'update_product_stock_on_order',
        'update_customer_on_order',
        'update_register_on_payment',
        'update_category_item_count'
    )
ORDER BY p.proname;
