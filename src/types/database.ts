// Database Types for Supabase - Auto-generated from schema
// This file defines TypeScript types for the database schema

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    email: string | null
                    first_name: string | null
                    second_name: string | null
                    phone: string | null
                    role: string
                    active: boolean
                    total_sales_count: number
                    total_sales: number
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username?: string | null
                    email?: string | null
                    first_name?: string | null
                    second_name?: string | null
                    phone?: string | null
                    role?: string
                    active?: boolean
                    total_sales_count?: number
                    total_sales?: number
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string | null
                    email?: string | null
                    first_name?: string | null
                    second_name?: string | null
                    phone?: string | null
                    role?: string
                    active?: boolean
                    total_sales_count?: number
                    total_sales?: number
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            roles: {
                Row: {
                    id: string
                    name: string
                    namespace: string
                    description: string | null
                    locked: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    namespace: string
                    description?: string | null
                    locked?: boolean
                }
                Update: {
                    name?: string
                    namespace?: string
                    description?: string | null
                    locked?: boolean
                }
            }
            products: {
                Row: {
                    id: string
                    name: string
                    sku: string | null
                    barcode: string | null
                    type: string
                    accurate_tracking: boolean
                    status: string
                    stock_management: boolean
                    description: string | null
                    category_id: string | null
                    parent_id: string | null
                    unit_group_id: string | null
                    tax_group_id: string | null
                    tax_type: string
                    thumbnail_id: string | null
                    selling_price: number
                    purchase_price: number
                    gross_sale_price: number
                    net_sale_price: number
                    wholesale_price: number
                    sale_price_edit: boolean
                    on_expiration: string
                    expires: boolean
                    searchable: boolean
                    author: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    sku?: string | null
                    barcode?: string | null
                    type?: string
                    accurate_tracking?: boolean
                    status?: string
                    stock_management?: boolean
                    description?: string | null
                    category_id?: string | null
                    parent_id?: string | null
                    unit_group_id?: string | null
                    tax_group_id?: string | null
                    tax_type?: string
                    thumbnail_id?: string | null
                    selling_price?: number
                    purchase_price?: number
                    gross_sale_price?: number
                    net_sale_price?: number
                    wholesale_price?: number
                    sale_price_edit?: boolean
                    on_expiration?: string
                    expires?: boolean
                    searchable?: boolean
                    author?: string | null
                }
                Update: {
                    name?: string
                    sku?: string | null
                    barcode?: string | null
                    type?: string
                    accurate_tracking?: boolean
                    status?: string
                    stock_management?: boolean
                    description?: string | null
                    category_id?: string | null
                    parent_id?: string | null
                    unit_group_id?: string | null
                    tax_group_id?: string | null
                    tax_type?: string
                    thumbnail_id?: string | null
                    selling_price?: number
                    purchase_price?: number
                    gross_sale_price?: number
                    net_sale_price?: number
                    wholesale_price?: number
                    sale_price_edit?: boolean
                    on_expiration?: string
                    expires?: boolean
                    searchable?: boolean
                    author?: string | null
                }
            }
            product_categories: {
                Row: {
                    id: string
                    name: string
                    parent_id: string | null
                    media_id: string | null
                    description: string | null
                    total_items: number
                    displays_on_pos: boolean
                    author: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    parent_id?: string | null
                    media_id?: string | null
                    description?: string | null
                    total_items?: number
                    displays_on_pos?: boolean
                    author?: string | null
                }
                Update: {
                    name?: string
                    parent_id?: string | null
                    media_id?: string | null
                    description?: string | null
                    total_items?: number
                    displays_on_pos?: boolean
                    author?: string | null
                }
            }
            product_unit_quantities: {
                Row: {
                    id: string
                    product_id: string | null
                    unit_id: string | null
                    quantity: number
                    low_quantity: number
                    stock_alert_enabled: boolean
                    sale_price: number
                    sale_price_edit: boolean
                    excl_tax_sale_price: number
                    incl_tax_sale_price: number
                    wholesale_price: number
                    excl_tax_wholesale_price: number
                    incl_tax_wholesale_price: number
                    purchase_price: number
                    visible: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    product_id?: string | null
                    unit_id?: string | null
                    quantity?: number
                    low_quantity?: number
                    stock_alert_enabled?: boolean
                    sale_price?: number
                    sale_price_edit?: boolean
                    excl_tax_sale_price?: number
                    incl_tax_sale_price?: number
                    wholesale_price?: number
                    excl_tax_wholesale_price?: number
                    incl_tax_wholesale_price?: number
                    purchase_price?: number
                    visible?: boolean
                }
                Update: {
                    product_id?: string | null
                    unit_id?: string | null
                    quantity?: number
                    low_quantity?: number
                    stock_alert_enabled?: boolean
                    sale_price?: number
                    sale_price_edit?: boolean
                    excl_tax_sale_price?: number
                    incl_tax_sale_price?: number
                    wholesale_price?: number
                    excl_tax_wholesale_price?: number
                    incl_tax_wholesale_price?: number
                    purchase_price?: number
                    visible?: boolean
                }
            }
            customers: {
                Row: {
                    id: string
                    first_name: string | null
                    last_name: string | null
                    email: string | null
                    phone: string | null
                    pobox: string | null
                    gender: string | null
                    birthdate: string | null
                    group_id: string | null
                    account_amount: number
                    credit_limit_amount: number
                    purchases_amount: number
                    owed_amount: number
                    reward_system_points: number
                    description: string | null
                    author: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    first_name?: string | null
                    last_name?: string | null
                    email?: string | null
                    phone?: string | null
                    pobox?: string | null
                    gender?: string | null
                    birthdate?: string | null
                    group_id?: string | null
                    account_amount?: number
                    credit_limit_amount?: number
                    purchases_amount?: number
                    owed_amount?: number
                    reward_system_points?: number
                    description?: string | null
                    author?: string | null
                }
                Update: {
                    first_name?: string | null
                    last_name?: string | null
                    email?: string | null
                    phone?: string | null
                    pobox?: string | null
                    gender?: string | null
                    birthdate?: string | null
                    group_id?: string | null
                    account_amount?: number
                    credit_limit_amount?: number
                    purchases_amount?: number
                    owed_amount?: number
                    reward_system_points?: number
                    description?: string | null
                    author?: string | null
                }
            }
            customers_groups: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    reward_system_id: string | null
                    minimal_credit_payment: number
                    author: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    reward_system_id?: string | null
                    minimal_credit_payment?: number
                    author?: string | null
                }
                Update: {
                    name?: string
                    description?: string | null
                    reward_system_id?: string | null
                    minimal_credit_payment?: number
                    author?: string | null
                }
            }
            orders: {
                Row: {
                    id: string
                    code: string
                    type: string
                    title: string | null
                    payment_status: string
                    process_status: string
                    delivery_status: string
                    customer_id: string | null
                    subtotal: number
                    products_total: number
                    products_total_cost_price: number
                    shipping: number
                    shipping_rate: number
                    shipping_type: string
                    discount: number
                    discount_rate: number
                    discount_type: string
                    discount_percentage: number
                    products_discount: number
                    total_without_discount: number
                    tax_value: number
                    total_coupons: number
                    total_instalments: number
                    total: number
                    gross_total: number
                    net_total: number
                    tendered: number
                    change: number
                    voidance_reason: string | null
                    note: string | null
                    register_id: string | null
                    author: string | null
                    expected_payment_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    code?: string
                    type?: string
                    title?: string | null
                    payment_status?: string
                    process_status?: string
                    delivery_status?: string
                    customer_id?: string | null
                    subtotal?: number
                    products_total?: number
                    products_total_cost_price?: number
                    shipping?: number
                    shipping_rate?: number
                    shipping_type?: string
                    discount?: number
                    discount_rate?: number
                    discount_type?: string
                    discount_percentage?: number
                    products_discount?: number
                    total_without_discount?: number
                    tax_value?: number
                    total_coupons?: number
                    total_instalments?: number
                    total?: number
                    gross_total?: number
                    net_total?: number
                    tendered?: number
                    change?: number
                    voidance_reason?: string | null
                    note?: string | null
                    register_id?: string | null
                    author?: string | null
                    expected_payment_date?: string | null
                }
                Update: {
                    code?: string
                    type?: string
                    title?: string | null
                    payment_status?: string
                    process_status?: string
                    delivery_status?: string
                    customer_id?: string | null
                    subtotal?: number
                    products_total?: number
                    products_total_cost_price?: number
                    shipping?: number
                    shipping_rate?: number
                    shipping_type?: string
                    discount?: number
                    discount_rate?: number
                    discount_type?: string
                    discount_percentage?: number
                    products_discount?: number
                    total_without_discount?: number
                    tax_value?: number
                    total_coupons?: number
                    total_instalments?: number
                    total?: number
                    gross_total?: number
                    net_total?: number
                    tendered?: number
                    change?: number
                    voidance_reason?: string | null
                    note?: string | null
                    register_id?: string | null
                    author?: string | null
                    expected_payment_date?: string | null
                }
            }
            orders_products: {
                Row: {
                    id: string
                    order_id: string | null
                    product_id: string | null
                    product_category_id: string | null
                    procurement_product_id: string | null
                    unit_id: string | null
                    unit_quantity_id: string | null
                    name: string | null
                    mode: string
                    quantity: number
                    return_observations: string | null
                    return_condition: string | null
                    unit_price: number
                    net_price: number
                    gross_price: number
                    discount: number
                    discount_rate: number
                    discount_type: string
                    discount_percentage: number
                    tax_value: number
                    rate: number
                    tax_group_id: string | null
                    total_price: number
                    total_price_without_discount: number
                    total_price_with_discount: number
                    total_gross_price: number
                    total_net_price: number
                    total_purchase_price: number
                    status: string
                    author: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    order_id?: string | null
                    product_id?: string | null
                    product_category_id?: string | null
                    procurement_product_id?: string | null
                    unit_id?: string | null
                    unit_quantity_id?: string | null
                    name?: string | null
                    mode?: string
                    quantity?: number
                    return_observations?: string | null
                    return_condition?: string | null
                    unit_price?: number
                    net_price?: number
                    gross_price?: number
                    discount?: number
                    discount_rate?: number
                    discount_type?: string
                    discount_percentage?: number
                    tax_value?: number
                    rate?: number
                    tax_group_id?: string | null
                    total_price?: number
                    total_price_without_discount?: number
                    total_price_with_discount?: number
                    total_gross_price?: number
                    total_net_price?: number
                    total_purchase_price?: number
                    status?: string
                    author?: string | null
                }
                Update: {
                    order_id?: string | null
                    product_id?: string | null
                    product_category_id?: string | null
                    procurement_product_id?: string | null
                    unit_id?: string | null
                    unit_quantity_id?: string | null
                    name?: string | null
                    mode?: string
                    quantity?: number
                    return_observations?: string | null
                    return_condition?: string | null
                    unit_price?: number
                    net_price?: number
                    gross_price?: number
                    discount?: number
                    discount_rate?: number
                    discount_type?: string
                    discount_percentage?: number
                    tax_value?: number
                    rate?: number
                    tax_group_id?: string | null
                    total_price?: number
                    total_price_without_discount?: number
                    total_price_with_discount?: number
                    total_gross_price?: number
                    total_net_price?: number
                    total_purchase_price?: number
                    status?: string
                    author?: string | null
                }
            }
            orders_payments: {
                Row: {
                    id: string
                    order_id: string | null
                    payment_type_id: string | null
                    identifier: string | null
                    value: number
                    author: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id?: string | null
                    payment_type_id?: string | null
                    identifier?: string | null
                    value?: number
                    author?: string | null
                }
                Update: {
                    order_id?: string | null
                    payment_type_id?: string | null
                    identifier?: string | null
                    value?: number
                    author?: string | null
                }
            }
            payment_types: {
                Row: {
                    id: string
                    label: string
                    identifier: string
                    priority: number
                    description: string | null
                    readonly: boolean
                    active: boolean
                    author: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    label: string
                    identifier: string
                    priority?: number
                    description?: string | null
                    readonly?: boolean
                    active?: boolean
                    author?: string | null
                }
                Update: {
                    label?: string
                    identifier?: string
                    priority?: number
                    description?: string | null
                    readonly?: boolean
                    active?: boolean
                    author?: string | null
                }
            }
            registers: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    status: string
                    balance: number
                    used_by: string | null
                    author: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    status?: string
                    balance?: number
                    used_by?: string | null
                    author?: string | null
                }
                Update: {
                    name?: string
                    description?: string | null
                    status?: string
                    balance?: number
                    used_by?: string | null
                    author?: string | null
                }
            }
            units: {
                Row: {
                    id: string
                    name: string
                    identifier: string
                    description: string | null
                    value: number
                    base_unit: boolean
                    group_id: string | null
                    author: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    identifier: string
                    description?: string | null
                    value?: number
                    base_unit?: boolean
                    group_id?: string | null
                    author?: string | null
                }
                Update: {
                    name?: string
                    identifier?: string
                    description?: string | null
                    value?: number
                    base_unit?: boolean
                    group_id?: string | null
                    author?: string | null
                }
            }
            taxes: {
                Row: {
                    id: string
                    name: string
                    rate: number
                    tax_group_id: string | null
                    type: string
                    description: string | null
                    author: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    rate?: number
                    tax_group_id?: string | null
                    type?: string
                    description?: string | null
                    author?: string | null
                }
                Update: {
                    name?: string
                    rate?: number
                    tax_group_id?: string | null
                    type?: string
                    description?: string | null
                    author?: string | null
                }
            }
            dashboard_days: {
                Row: {
                    id: string
                    day_of_year: number
                    date: string
                    total_income: number
                    total_orders: number
                    total_paid_orders_count: number
                    total_paid_orders: number
                    total_unpaid_orders_count: number
                    total_unpaid_orders: number
                    total_partially_paid_orders_count: number
                    total_partially_paid_orders: number
                    wasted_products_count: number
                    total_wasted_products: number
                    total_discount: number
                    total_taxes: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    day_of_year: number
                    date: string
                    total_income?: number
                    total_orders?: number
                    total_paid_orders_count?: number
                    total_paid_orders?: number
                    total_unpaid_orders_count?: number
                    total_unpaid_orders?: number
                    total_partially_paid_orders_count?: number
                    total_partially_paid_orders?: number
                    wasted_products_count?: number
                    total_wasted_products?: number
                    total_discount?: number
                    total_taxes?: number
                }
                Update: {
                    day_of_year?: number
                    date?: string
                    total_income?: number
                    total_orders?: number
                    total_paid_orders_count?: number
                    total_paid_orders?: number
                    total_unpaid_orders_count?: number
                    total_unpaid_orders?: number
                    total_partially_paid_orders_count?: number
                    total_partially_paid_orders?: number
                    wasted_products_count?: number
                    total_wasted_products?: number
                    total_discount?: number
                    total_taxes?: number
                }
            }
        }
    }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience exports
export type Profile = Tables<'profiles'>
export type Role = Tables<'roles'>
export type Product = Tables<'products'>
export type ProductCategory = Tables<'product_categories'>
export type ProductUnitQuantity = Tables<'product_unit_quantities'>
export type Customer = Tables<'customers'>
export type CustomerGroup = Tables<'customers_groups'>
export type Order = Tables<'orders'>
export type OrderProduct = Tables<'orders_products'>
export type OrderPayment = Tables<'orders_payments'>
export type PaymentType = Tables<'payment_types'>
export type Register = Tables<'registers'>
export type Unit = Tables<'units'>
export type Tax = Tables<'taxes'>
export type DashboardDay = Tables<'dashboard_days'>
