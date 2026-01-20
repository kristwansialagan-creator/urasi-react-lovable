import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface PermissionGuardProps {
    children: ReactNode
    /** Permission string to check (e.g., "products.delete") */
    permission?: string
    /** Role to check (e.g., "admin") */
    role?: string
    /** Require admin access */
    requireAdmin?: boolean
    /** Fallback content when permission is denied (default: null/hidden) */
    fallback?: ReactNode
}

/**
 * Component-level permission guard for hiding UI elements based on permissions.
 * Use this to wrap buttons, actions, or sections that require specific permissions.
 * 
 * @example
 * // Hide delete button if user doesn't have permission
 * <PermissionGuard permission="products.delete">
 *   <Button onClick={handleDelete}>Delete</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Show disabled button instead of hiding
 * <PermissionGuard 
 *   permission="products.delete" 
 *   fallback={<Button disabled>Delete</Button>}
 * >
 *   <Button onClick={handleDelete}>Delete</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Admin-only section
 * <PermissionGuard requireAdmin>
 *   <AdminSettings />
 * </PermissionGuard>
 */
export function PermissionGuard({
    children,
    permission,
    role,
    requireAdmin = false,
    fallback = null
}: PermissionGuardProps) {
    const { isAdmin, hasPermission, hasRole } = useAuth()

    // Admin has access to everything
    if (isAdmin) {
        return <>{children}</>
    }

    // Check admin requirement
    if (requireAdmin) {
        return <>{fallback}</>
    }

    // Check role requirement
    if (role && !hasRole(role)) {
        return <>{fallback}</>
    }

    // Check permission requirement
    if (permission && !hasPermission(permission)) {
        return <>{fallback}</>
    }

    return <>{children}</>
}

/**
 * Hook version for programmatic permission checks
 * 
 * @example
 * const { canDelete, canEdit } = usePermissionCheck({
 *   canDelete: 'products.delete',
 *   canEdit: 'products.update'
 * })
 */
export function usePermissionCheck<T extends Record<string, string>>(
    permissions: T
): Record<keyof T, boolean> {
    const { isAdmin, hasPermission } = useAuth()

    const result = {} as Record<keyof T, boolean>

    for (const key in permissions) {
        result[key] = isAdmin || hasPermission(permissions[key])
    }

    return result
}