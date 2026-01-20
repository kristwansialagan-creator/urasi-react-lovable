import { useEffect } from 'react'
import { useProducts } from './useProducts'

/**
 * Hook for accessing product categories with auto-fetching on mount.
 * This is a convenience wrapper around useProducts that focuses on categories.
 */
export function useCategories() {
    const {
        categories,
        loading,
        error,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory
    } = useProducts()

    // Auto-fetch categories on mount
    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    return {
        categories,
        loading,
        error,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory
    }
}
