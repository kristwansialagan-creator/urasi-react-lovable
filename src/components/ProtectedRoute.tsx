import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredPermission?: string
    requiredRole?: string
    requireAdmin?: boolean
}

export function ProtectedRoute({
    children,
    requiredPermission,
    requiredRole,
    requireAdmin
}: ProtectedRouteProps) {
    const { user, loading, hasPermission, hasRole, isAdmin } = useAuth()

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Check admin requirement
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/unauthorized" replace />
    }

    // Check role requirement
    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to="/unauthorized" replace />
    }

    // Check permission requirement
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Navigate to="/unauthorized" replace />
    }

    return <>{children}</>
}
