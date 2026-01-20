import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Format currency (Indonesian Rupiah)
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

// Format number with thousand separators
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('id-ID').format(num)
}

// Format date
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }
    return new Intl.DateTimeFormat('id-ID', options || defaultOptions).format(new Date(date))
}

// Format datetime
export function formatDateTime(date: string | Date): string {
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date))
}

// Generate unique ID
export function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Generate order code
export function generateOrderCode(): string {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `ORD-${year}${month}${day}-${random}`
}

// Calculate discount
export function calculateDiscount(
    subtotal: number,
    discountValue: number,
    discountType: 'flat' | 'percentage'
): number {
    if (discountType === 'percentage') {
        return (subtotal * discountValue) / 100
    }
    return discountValue
}

// Calculate tax
export function calculateTax(
    amount: number,
    taxRate: number,
    taxType: 'inclusive' | 'exclusive'
): { taxAmount: number; netAmount: number } {
    if (taxType === 'inclusive') {
        const netAmount = amount / (1 + taxRate / 100)
        const taxAmount = amount - netAmount
        return { taxAmount, netAmount }
    }
    const taxAmount = (amount * taxRate) / 100
    return { taxAmount, netAmount: amount }
}

// Truncate text
export function truncate(str: string, length: number): string {
    if (str.length <= length) return str
    return str.slice(0, length) + '...'
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>
    return (...args: Parameters<T>) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

// Get initials from name
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

// Check if value is empty
export function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
}

// Supabase Storage Configuration
const SUPABASE_PROJECT_ID = 'higfoctduijxbszgqhuc'
const STORAGE_BASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public`
const DEFAULT_BUCKET = 'product-images'
const KNOWN_BUCKETS = ['product-images', 'media', 'uploads']

// Build storage URL from slug
export function getStorageUrl(slug: string | null | undefined): string | null {
    if (!slug) return null
    
    const parts = slug.split('/')
    const firstPart = parts[0]
    
    if (KNOWN_BUCKETS.includes(firstPart)) {
        // Slug already contains bucket name
        return `${STORAGE_BASE_URL}/${slug}`
    } else {
        // Slug is just the file path, prepend default bucket
        // Log warning for potential debugging if something goes wrong
        if (process.env.NODE_ENV === 'development' && parts.length === 1) {
            console.warn(`[Storage] Slug "${slug}" has unusual format - using default bucket "${DEFAULT_BUCKET}"`)
        }
        return `${STORAGE_BASE_URL}/${DEFAULT_BUCKET}/${slug}`
    }
}

// Parse slug to get bucket and file path
export function parseStorageSlug(slug: string): { bucket: string; filePath: string } {
    const parts = slug.split('/')
    const firstPart = parts[0]
    
    if (KNOWN_BUCKETS.includes(firstPart)) {
        return {
            bucket: firstPart,
            filePath: parts.slice(1).join('/')
        }
    } else {
        return {
            bucket: DEFAULT_BUCKET,
            filePath: slug
        }
    }
}
