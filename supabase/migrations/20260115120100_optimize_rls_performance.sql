-- ============================================================================
-- Migration: Optimize RLS Performance
-- ============================================================================
-- Issue 1: Auth functions re-evaluated for each row (7 policies)
-- Issue 2: Multiple permissive policies on same table (3 tables)
-- Fix: Wrap auth calls in subquery, remove duplicate policies
-- ============================================================================

-- ============================================================================
-- PART 1: Fix Auth RLS InitPlan Issues (Performance)
-- ============================================================================
-- Replace auth.uid() with (select auth.uid()) to evaluate once per query

-- 1. Fix profiles.profiles_update policy
DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = (select auth.uid()))
    WITH CHECK (id = (select auth.uid()));

-- 2. Fix roles.roles_all policy
DROP POLICY IF EXISTS roles_all ON public.roles;
CREATE POLICY roles_all ON public.roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid())
        )
    );

-- 3. Fix permissions.permissions_all policy
DROP POLICY IF EXISTS permissions_all ON public.permissions;
CREATE POLICY permissions_all ON public.permissions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid())
        )
    );

-- 4. Fix options.options_all policy
DROP POLICY IF EXISTS options_all ON public.options;
CREATE POLICY options_all ON public.options
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid())
        )
    );

-- 5. Fix medias.medias_update policy
DROP POLICY IF EXISTS medias_update ON public.medias;
CREATE POLICY medias_update ON public.medias
    FOR UPDATE
    TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- 6. Fix medias.medias_delete policy
DROP POLICY IF EXISTS medias_delete ON public.medias;
CREATE POLICY medias_delete ON public.medias
    FOR DELETE
    TO authenticated
    USING (user_id = (select auth.uid()));

-- 7. Fix notifications.notifications_own policy
DROP POLICY IF EXISTS notifications_own ON public.notifications;
CREATE POLICY notifications_own ON public.notifications
    FOR ALL
    TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- PART 2: Remove Duplicate Permissive Policies
-- ============================================================================
-- Remove redundant SELECT policies when ALL policy already exists

-- 1. Remove options_select (options_all already covers SELECT)
DROP POLICY IF EXISTS options_select ON public.options;

-- 2. Remove permissions_select (permissions_all already covers SELECT)
DROP POLICY IF EXISTS permissions_select ON public.permissions;

-- 3. Remove roles_select (roles_all already covers SELECT)
DROP POLICY IF EXISTS roles_select ON public.roles;

-- ============================================================================
-- Verification
-- ============================================================================
COMMENT ON POLICY profiles_update ON public.profiles IS 
    'Optimized: Uses subquery for auth.uid() to prevent re-evaluation per row';

COMMENT ON POLICY roles_all ON public.roles IS 
    'Optimized: Single ALL policy, removed duplicate SELECT policy';

COMMENT ON POLICY permissions_all ON public.permissions IS 
    'Optimized: Single ALL policy, removed duplicate SELECT policy';

COMMENT ON POLICY options_all ON public.options IS 
    'Optimized: Single ALL policy, removed duplicate SELECT policy';
