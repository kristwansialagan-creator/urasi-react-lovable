// Database Types for Supabase
// This file defines TypeScript types for the database schema

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    email: string | null
                    role: string
                    active: boolean
                    created_at: string
                }
                Insert: {
                    id: string
                    username?: string | null
                    email?: string | null
                    role?: string
                    active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    username?: string | null
                    email?: string | null
                    role?: string
                    active?: boolean
                    created_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    name: string
                    sku: string | null
                    barcode: string | null
                    type: string
                    description: string | null
                    category_id: string | null
                    unit_group_id: string | null
                    tax_group_id: string | null
                    stock_management: boolean
                    selling_price: number
                    purchase_price: number
                    image_url: string | null
                    status: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    sku?: string | null
                    barcode?: string | null
                    type?: string
                    description?: string | null
                    category_id?: string | null
                    unit_group_id?: string | null
                    tax_group_id?: string | null
                    stock_management?: boolean
                    selling_price?: number
                    purchase_price?: number
                    image_url?: string | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    sku?: string | null
                    barcode?: string | null
                    type?: string
                    description?: string | null
                    category_id?: string | null
                    unit_group_id?: string | null
                    tax_group_id?: string | null
                    stock_management?: boolean
                    selling_price?: number
                    purchase_price?: number
                    image_url?: string | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            product_categories: {
                Row: {
                    id: string
                    name: string
                    parent_id: string | null
                    description: string | null
                    total_items: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    parent_id?: string | null
                    description?: string | null
                    total_items?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    parent_id?: string | null
                    description?: string | null
                    total_items?: number
                    created_at?: string
                }
            }
            product_unit_quantities: {
                Row: {
                    id: string
                    product_id: string
                    unit_id: string | null
                    quantity: number
                    sale_price: number
                    wholesale_price: number
                    low_quantity: number
                    stock_alert_enabled: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    product_id: string
                    unit_id?: string | null
                    quantity?: number
                    sale_price?: number
                    wholesale_price?: number
                    low_quantity?: number
                    stock_alert_enabled?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    product_id?: string
                    unit_id?: string | null
                    quantity?: number
                    sale_price?: number
                    wholesale_price?: number
                    low_quantity?: number
                    stock_alert_enabled?: boolean
                    created_at?: string
                }
            }
            units: {
                Row: {
                    id: string
                    name: string
                    identifier: string
                    description: string | null
                    group_id: string | null
                    value: number
                    base_unit: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    identifier: string
                    description?: string | null
                    group_id?: string | null
                    value?: number
                    base_unit?: boolean
                }
                Update: {
                    id?: string
                    name?: string
                    identifier?: string
                    description?: string | null
                    group_id?: string | null
                    value?: number
                    base_unit?: boolean
                }
            }
            unit_groups: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                }
            }
            taxes: {
                Row: {
                    id: string
                    name: string
                    rate: number
                    type: string
                    description: string | null
                    tax_group_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    rate: number
                    type?: string
                    description?: string | null
                    tax_group_id?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    rate?: number
                    type?: string
                    description?: string | null
                    tax_group_id?: string | null
                }
            }
            tax_groups: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                }
            }
            customers: {
                Row: {
                    id: string
                    first_name: string | null
                    last_name: string | null
                    email: string | null
                    phone: string | null
                    group_id: string | null
                    account_amount: number
                    credit_limit: number
                    purchases_amount: number
                    owed_amount: number
                    reward_points: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    first_name?: string | null
                    last_name?: string | null
                    email?: string | null
                    phone?: string | null
                    group_id?: string | null
                    account_amount?: number
                    credit_limit?: number
                    purchases_amount?: number
                    owed_amount?: number
                    reward_points?: number
                }
                Update: {
                    id?: string
                    first_name?: string | null
                    last_name?: string | null
                    email?: string | null
                    phone?: string | null
                    group_id?: string | null
                    account_amount?: number
                    credit_limit?: number
                    purchases_amount?: number
                    owed_amount?: number
                    reward_points?: number
                }
            }
            customer_groups: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    reward_system_id: string | null
                    minimal_credit_payment: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    reward_system_id?: string | null
                    minimal_credit_payment?: number
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    reward_system_id?: string | null
                    minimal_credit_payment?: number
                }
            }
            customer_addresses: {
                Row: {
                    id: string
                    customer_id: string
                    type: string
                    name: string | null
                    address: string | null
                    city: string | null
                    phone: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    customer_id: string
                    type: string
                    name?: string | null
                    address?: string | null
                    city?: string | null
                    phone?: string | null
                }
                Update: {
                    id?: string
                    customer_id?: string
                    type?: string
                    name?: string | null
                    address?: string | null
                    city?: string | null
                    phone?: string | null
                }
            }
            orders: {
                Row: {
                    id: string
                    code: string
                    type: string
                    customer_id: string | null
                    payment_status: string
                    process_status: string
                    delivery_status: string
                    subtotal: number
                    discount: number
                    discount_type: string
                    discount_percentage: number
                    tax_value: number
                    shipping: number
                    shipping_type: string
                    total: number
                    tendered: number
                    change: number
                    note: string | null
                    register_id: string | null
                    author: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    code: string
                    type?: string
                    customer_id?: string | null
                    payment_status?: string
                    process_status?: string
                    delivery_status?: string
                    subtotal?: number
                    discount?: number
                    discount_type?: string
                    discount_percentage?: number
                    tax_value?: number
                    shipping?: number
                    shipping_type?: string
                    total?: number
                    tendered?: number
                    change?: number
                    note?: string | null
                    register_id?: string | null
                    author?: string | null
                }
                Update: {
                    id?: string
                    code?: string
                    type?: string
                    customer_id?: string | null
                    payment_status?: string
                    process_status?: string
                    delivery_status?: string
                    subtotal?: number
                    discount?: number
                    discount_type?: string
                    discount_percentage?: number
                    tax_value?: number
                    shipping?: number
                    shipping_type?: string
                    total?: number
                    tendered?: number
                    change?: number
                    note?: string | null
                    register_id?: string | null
                    author?: string | null
                }
            }
            order_products: {
                Row: {
                    id: string
                    order_id: string
                    product_id: string | null
                    unit_id: string | null
                    name: string
                    quantity: number
                    unit_price: number
                    discount: number
                    discount_type: string
                    tax_value: number
                    total_price: number
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    product_id?: string | null
                    unit_id?: string | null
                    name: string
                    quantity?: number
                    unit_price?: number
                    discount?: number
                    discount_type?: string
                    tax_value?: number
                    total_price?: number
                    status?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    product_id?: string | null
                    unit_id?: string | null
                    name?: string
                    quantity?: number
                    unit_price?: number
                    discount?: number
                    discount_type?: string
                    tax_value?: number
                    total_price?: number
                    status?: string
                }
            }
            order_payments: {
                Row: {
                    id: string
                    order_id: string
                    payment_type_id: string | null
                    identifier: string
                    amount: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    payment_type_id?: string | null
                    identifier: string
                    amount?: number
                }
                Update: {
                    id?: string
                    order_id?: string
                    payment_type_id?: string | null
                    identifier?: string
                    amount?: number
                }
            }
            order_taxes: {
                Row: {
                    id: string
                    order_id: string
                    tax_id: string | null
                    tax_name: string
                    rate: number
                    tax_value: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    tax_id?: string | null
                    tax_name: string
                    rate?: number
                    tax_value?: number
                }
                Update: {
                    id?: string
                    order_id?: string
                    tax_id?: string | null
                    tax_name?: string
                    rate?: number
                    tax_value?: number
                }
            }
            order_refunds: {
                Row: {
                    id: string
                    order_id: string
                    total: number
                    shipping: number
                    author: string | null
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    total?: number
                    shipping?: number
                    author?: string | null
                    description?: string | null
                }
                Update: {
                    id?: string
                    order_id?: string
                    total?: number
                    shipping?: number
                    author?: string | null
                    description?: string | null
                }
            }
            order_product_refunds: {
                Row: {
                    id: string
                    order_refund_id: string
                    order_product_id: string
                    unit_price: number
                    quantity: number
                    total_price: number
                    condition: string
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_refund_id: string
                    order_product_id: string
                    unit_price?: number
                    quantity?: number
                    total_price?: number
                    condition?: string
                    description?: string | null
                }
                Update: {
                    id?: string
                    order_refund_id?: string
                    order_product_id?: string
                    unit_price?: number
                    quantity?: number
                    total_price?: number
                    condition?: string
                    description?: string | null
                }
            }
            payment_types: {
                Row: {
                    id: string
                    label: string
                    identifier: string
                    description: string | null
                    active: boolean
                    readonly: boolean
                    priority: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    label: string
                    identifier: string
                    description?: string | null
                    active?: boolean
                    readonly?: boolean
                    priority?: number
                }
                Update: {
                    id?: string
                    label?: string
                    identifier?: string
                    description?: string | null
                    active?: boolean
                    readonly?: boolean
                    priority?: number
                }
            }
            registers: {
                Row: {
                    id: string
                    name: string
                    status: string
                    balance: number
                    description: string | null
                    used_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    status?: string
                    balance?: number
                    description?: string | null
                    used_by?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    status?: string
                    balance?: number
                    description?: string | null
                    used_by?: string | null
                }
            }
            register_history: {
                Row: {
                    id: string
                    register_id: string
                    action: string
                    value: number
                    balance_before: number
                    balance_after: number
                    description: string | null
                    order_id: string | null
                    author: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    register_id: string
                    action: string
                    value?: number
                    balance_before?: number
                    balance_after?: number
                    description?: string | null
                    order_id?: string | null
                    author?: string | null
                }
                Update: {
                    id?: string
                    register_id?: string
                    action?: string
                    value?: number
                    balance_before?: number
                    balance_after?: number
                    description?: string | null
                    order_id?: string | null
                    author?: string | null
                }
            }
            providers: {
                Row: {
                    id: string
                    name: string
                    email: string | null
                    phone: string | null
                    address: string | null
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    email?: string | null
                    phone?: string | null
                    address?: string | null
                    description?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string | null
                    phone?: string | null
                    address?: string | null
                    description?: string | null
                }
            }
            procurements: {
                Row: {
                    id: string
                    code: string
                    provider_id: string | null
                    status: string
                    delivery_status: string
                    payment_status: string
                    total_items: number
                    value: number
                    tax_value: number
                    cost: number
                    description: string | null
                    author: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    code: string
                    provider_id?: string | null
                    status?: string
                    delivery_status?: string
                    payment_status?: string
                    total_items?: number
                    value?: number
                    tax_value?: number
                    cost?: number
                    description?: string | null
                    author?: string | null
                }
                Update: {
                    id?: string
                    code?: string
                    provider_id?: string | null
                    status?: string
                    delivery_status?: string
                    payment_status?: string
                    total_items?: number
                    value?: number
                    tax_value?: number
                    cost?: number
                    description?: string | null
                    author?: string | null
                }
            }
            procurement_products: {
                Row: {
                    id: string
                    procurement_id: string
                    product_id: string | null
                    unit_id: string | null
                    name: string
                    quantity: number
                    purchase_price: number
                    tax_value: number
                    total_price: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    procurement_id: string
                    product_id?: string | null
                    unit_id?: string | null
                    name: string
                    quantity?: number
                    purchase_price?: number
                    tax_value?: number
                    total_price?: number
                }
                Update: {
                    id?: string
                    procurement_id?: string
                    product_id?: string | null
                    unit_id?: string | null
                    name?: string
                    quantity?: number
                    purchase_price?: number
                    tax_value?: number
                    total_price?: number
                }
            }
            transactions: {
                Row: {
                    id: string
                    name: string
                    type: string
                    status: string
                    account_id: string | null
                    value: number
                    description: string | null
                    recurring: boolean
                    occurrence: string | null
                    scheduled: boolean
                    scheduled_date: string | null
                    order_id: string | null
                    procurement_id: string | null
                    author: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    type: string
                    status?: string
                    account_id?: string | null
                    value?: number
                    description?: string | null
                    recurring?: boolean
                    occurrence?: string | null
                    scheduled?: boolean
                    scheduled_date?: string | null
                    order_id?: string | null
                    procurement_id?: string | null
                    author?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    type?: string
                    status?: string
                    account_id?: string | null
                    value?: number
                    description?: string | null
                    recurring?: boolean
                    occurrence?: string | null
                    scheduled?: boolean
                    scheduled_date?: string | null
                    order_id?: string | null
                    procurement_id?: string | null
                    author?: string | null
                }
            }
            transaction_accounts: {
                Row: {
                    id: string
                    name: string
                    operation: string
                    account: string
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    operation: string
                    account: string
                    description?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    operation?: string
                    account?: string
                    description?: string | null
                }
            }
            coupons: {
                Row: {
                    id: string
                    name: string
                    code: string
                    type: string
                    discount_value: number
                    discount_type: string
                    valid_from: string | null
                    valid_until: string | null
                    minimum_cart_value: number
                    maximum_usage: number
                    usage_count: number
                    active: boolean
                    limit_usage: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    code: string
                    type?: string
                    discount_value?: number
                    discount_type?: string
                    valid_from?: string | null
                    valid_until?: string | null
                    minimum_cart_value?: number
                    maximum_usage?: number
                    usage_count?: number
                    active?: boolean
                    limit_usage?: boolean
                }
                Update: {
                    id?: string
                    name?: string
                    code?: string
                    type?: string
                    discount_value?: number
                    discount_type?: string
                    valid_from?: string | null
                    valid_until?: string | null
                    minimum_cart_value?: number
                    maximum_usage?: number
                    usage_count?: number
                    active?: boolean
                    limit_usage?: boolean
                }
            }
            reward_systems: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    target: number
                    coupon_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    target?: number
                    coupon_id?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    target?: number
                    coupon_id?: string | null
                }
            }
            dashboard_days: {
                Row: {
                    id: string
                    day_of_year: number
                    date: string
                    total_income: number
                    total_orders: number
                    total_paid_orders: number
                    total_unpaid_orders: number
                    total_partially_paid_orders: number
                    total_discount: number
                    total_taxes: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    day_of_year: number
                    date: string
                    total_income?: number
                    total_orders?: number
                    total_paid_orders?: number
                    total_unpaid_orders?: number
                    total_partially_paid_orders?: number
                    total_discount?: number
                    total_taxes?: number
                }
                Update: {
                    id?: string
                    day_of_year?: number
                    date?: string
                    total_income?: number
                    total_orders?: number
                    total_paid_orders?: number
                    total_unpaid_orders?: number
                    total_partially_paid_orders?: number
                    total_discount?: number
                    total_taxes?: number
                }
            }
            dashboard_months: {
                Row: {
                    id: string
                    month: number
                    year: number
                    total_income: number
                    total_orders: number
                    total_paid_orders: number
                    total_unpaid_orders: number
                    total_partially_paid_orders: number
                    total_discount: number
                    total_taxes: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    month: number
                    year: number
                    total_income?: number
                    total_orders?: number
                    total_paid_orders?: number
                    total_unpaid_orders?: number
                    total_partially_paid_orders?: number
                    total_discount?: number
                    total_taxes?: number
                }
                Update: {
                    id?: string
                    month?: number
                    year?: number
                    total_income?: number
                    total_orders?: number
                    total_paid_orders?: number
                    total_unpaid_orders?: number
                    total_partially_paid_orders?: number
                    total_discount?: number
                    total_taxes?: number
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
