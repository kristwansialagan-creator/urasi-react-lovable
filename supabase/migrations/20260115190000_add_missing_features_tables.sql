-- Migration: Add Missing Feature Tables
-- Adds tables for: Customer Groups, Providers, Transaction Accounts, Modules

-- ============================================================================
-- 1. Customer Groups
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.customer_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.customer_groups ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customer_groups' AND policyname = 'Allow authenticated users to view customer groups') THEN
        CREATE POLICY "Allow authenticated users to view customer groups" ON public.customer_groups FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customer_groups' AND policyname = 'Allow authenticated users to insert customer groups') THEN
        CREATE POLICY "Allow authenticated users to insert customer groups" ON public.customer_groups FOR INSERT TO authenticated WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customer_groups' AND policyname = 'Allow authenticated users to update customer groups') THEN
        CREATE POLICY "Allow authenticated users to update customer groups" ON public.customer_groups FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customer_groups' AND policyname = 'Allow authenticated users to delete customer groups') THEN
        CREATE POLICY "Allow authenticated users to delete customer groups" ON public.customer_groups FOR DELETE TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- 2. Providers (Suppliers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'providers' AND policyname = 'Allow authenticated users to view providers') THEN
        CREATE POLICY "Allow authenticated users to view providers" ON public.providers FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'providers' AND policyname = 'Allow authenticated users to insert providers') THEN
        CREATE POLICY "Allow authenticated users to insert providers" ON public.providers FOR INSERT TO authenticated WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'providers' AND policyname = 'Allow authenticated users to update providers') THEN
        CREATE POLICY "Allow authenticated users to update providers" ON public.providers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'providers' AND policyname = 'Allow authenticated users to delete providers') THEN
        CREATE POLICY "Allow authenticated users to delete providers" ON public.providers FOR DELETE TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- 3. Transaction Accounts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transaction_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    type VARCHAR(50) NOT NULL DEFAULT 'expense', -- asset, liability, equity, revenue, expense
    balance DECIMAL(15, 2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.transaction_accounts ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transaction_accounts' AND policyname = 'Allow authenticated users to view transaction accounts') THEN
        CREATE POLICY "Allow authenticated users to view transaction accounts" ON public.transaction_accounts FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transaction_accounts' AND policyname = 'Allow authenticated users to insert transaction accounts') THEN
        CREATE POLICY "Allow authenticated users to insert transaction accounts" ON public.transaction_accounts FOR INSERT TO authenticated WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transaction_accounts' AND policyname = 'Allow authenticated users to update transaction accounts') THEN
        CREATE POLICY "Allow authenticated users to update transaction accounts" ON public.transaction_accounts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transaction_accounts' AND policyname = 'Allow authenticated users to delete transaction accounts') THEN
        CREATE POLICY "Allow authenticated users to delete transaction accounts" ON public.transaction_accounts FOR DELETE TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- 4. Modules (System Plugins)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'disabled', -- enabled, disabled
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'modules' AND policyname = 'Allow authenticated users to view modules') THEN
        CREATE POLICY "Allow authenticated users to view modules" ON public.modules FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'modules' AND policyname = 'Allow authenticated users to insert modules') THEN
        CREATE POLICY "Allow authenticated users to insert modules" ON public.modules FOR INSERT TO authenticated WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'modules' AND policyname = 'Allow authenticated users to update modules') THEN
        CREATE POLICY "Allow authenticated users to update modules" ON public.modules FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'modules' AND policyname = 'Allow authenticated users to delete modules') THEN
        CREATE POLICY "Allow authenticated users to delete modules" ON public.modules FOR DELETE TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- 5. Triggers for updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS update_customer_groups_updated_at ON public.customer_groups;
CREATE TRIGGER update_customer_groups_updated_at
    BEFORE UPDATE ON public.customer_groups
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_providers_updated_at ON public.providers;
CREATE TRIGGER update_providers_updated_at
    BEFORE UPDATE ON public.providers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_transaction_accounts_updated_at ON public.transaction_accounts;
CREATE TRIGGER update_transaction_accounts_updated_at
    BEFORE UPDATE ON public.transaction_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_modules_updated_at ON public.modules;
CREATE TRIGGER update_modules_updated_at
    BEFORE UPDATE ON public.modules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
