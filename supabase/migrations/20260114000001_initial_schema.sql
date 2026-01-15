-- ================================================
-- NEXOPOS FULL DATABASE SCHEMA FOR SUPABASE
-- Migration: 001_initial_schema
-- ================================================

-- ================================================
-- 1. CORE SYSTEM TABLES
-- ================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    email TEXT,
    first_name TEXT,
    second_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user',
    active BOOLEAN DEFAULT true,
    total_sales_count INTEGER DEFAULT 0,
    total_sales DECIMAL(18,5) DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    namespace TEXT NOT NULL UNIQUE,
    description TEXT,
    locked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    namespace TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Role-Permission Relations
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);

-- User-Role Relations
CREATE TABLE IF NOT EXISTS users_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE(user_id, role_id)
);

-- System Options (key-value config)
CREATE TABLE IF NOT EXISTS options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    is_array BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Medias (file storage)
CREATE TABLE IF NOT EXISTS medias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    extension TEXT,
    slug TEXT,
    user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    identifier TEXT,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    source TEXT DEFAULT 'system',
    dismissable BOOLEAN DEFAULT true,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- 2. UNITS & TAXES
-- ================================================

-- Unit Groups
CREATE TABLE IF NOT EXISTS units_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Units
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    identifier TEXT NOT NULL,
    description TEXT,
    value DECIMAL(18,5) DEFAULT 0,
    base_unit BOOLEAN DEFAULT false,
    group_id UUID REFERENCES units_groups(id) ON DELETE SET NULL,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tax Groups
CREATE TABLE IF NOT EXISTS taxes_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Taxes
CREATE TABLE IF NOT EXISTS taxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    rate DECIMAL(18,5) DEFAULT 0,
    tax_group_id UUID REFERENCES taxes_groups(id) ON DELETE SET NULL,
    type TEXT DEFAULT 'percentage',
    description TEXT,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- 3. PRODUCTS & INVENTORY
-- ================================================

-- Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    media_id UUID REFERENCES medias(id) ON DELETE SET NULL,
    description TEXT,
    total_items INTEGER DEFAULT 0,
    displays_on_pos BOOLEAN DEFAULT true,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    barcode TEXT,
    type TEXT DEFAULT 'dematerialized',
    accurate_tracking BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'available',
    stock_management BOOLEAN DEFAULT true,
    description TEXT,
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES products(id) ON DELETE SET NULL,
    unit_group_id UUID REFERENCES units_groups(id) ON DELETE SET NULL,
    tax_group_id UUID REFERENCES taxes_groups(id) ON DELETE SET NULL,
    tax_type TEXT DEFAULT 'inclusive',
    thumbnail_id UUID REFERENCES medias(id) ON DELETE SET NULL,
    selling_price DECIMAL(18,5) DEFAULT 0,
    purchase_price DECIMAL(18,5) DEFAULT 0,
    gross_sale_price DECIMAL(18,5) DEFAULT 0,
    net_sale_price DECIMAL(18,5) DEFAULT 0,
    wholesale_price DECIMAL(18,5) DEFAULT 0,
    sale_price_edit BOOLEAN DEFAULT false,
    on_expiration TEXT DEFAULT 'prevent_sales',
    expires BOOLEAN DEFAULT false,
    searchable BOOLEAN DEFAULT true,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product Unit Quantities (stock per unit)
CREATE TABLE IF NOT EXISTS product_unit_quantities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    quantity DECIMAL(18,5) DEFAULT 0,
    low_quantity INTEGER DEFAULT 0,
    stock_alert_enabled BOOLEAN DEFAULT false,
    sale_price DECIMAL(18,5) DEFAULT 0,
    sale_price_edit BOOLEAN DEFAULT false,
    excl_tax_sale_price DECIMAL(18,5) DEFAULT 0,
    incl_tax_sale_price DECIMAL(18,5) DEFAULT 0,
    wholesale_price DECIMAL(18,5) DEFAULT 0,
    excl_tax_wholesale_price DECIMAL(18,5) DEFAULT 0,
    incl_tax_wholesale_price DECIMAL(18,5) DEFAULT 0,
    purchase_price DECIMAL(18,5) DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Products Gallery
CREATE TABLE IF NOT EXISTS products_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    media_id UUID REFERENCES medias(id) ON DELETE CASCADE,
    featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Product History (stock movements)
CREATE TABLE IF NOT EXISTS products_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    procurement_id UUID,
    procurement_product_id UUID,
    order_id UUID,
    order_product_id UUID,
    operation_type TEXT NOT NULL,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    before_quantity DECIMAL(18,5) DEFAULT 0,
    quantity DECIMAL(18,5) DEFAULT 0,
    after_quantity DECIMAL(18,5) DEFAULT 0,
    unit_price DECIMAL(18,5) DEFAULT 0,
    total_price DECIMAL(18,5) DEFAULT 0,
    description TEXT,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Products History Combined (aggregated)
CREATE TABLE IF NOT EXISTS products_history_combined (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    procurement_product_id UUID,
    initial_quantity DECIMAL(18,5) DEFAULT 0,
    sold_quantity DECIMAL(18,5) DEFAULT 0,
    defective_quantity DECIMAL(18,5) DEFAULT 0,
    final_quantity DECIMAL(18,5) DEFAULT 0,
    unit_price DECIMAL(18,5) DEFAULT 0,
    total_price DECIMAL(18,5) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product Taxes
CREATE TABLE IF NOT EXISTS products_taxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    tax_id UUID REFERENCES taxes(id) ON DELETE CASCADE,
    rate DECIMAL(18,5) DEFAULT 0,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Product Sub Items (for grouped products)
CREATE TABLE IF NOT EXISTS products_sub_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES products(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    quantity DECIMAL(18,5) DEFAULT 1,
    sale_price DECIMAL(18,5) DEFAULT 0,
    total_price DECIMAL(18,5) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Product Metas (extended attributes)
CREATE TABLE IF NOT EXISTS products_metas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT,
    type TEXT DEFAULT 'string',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- 4. CUSTOMERS
-- ================================================

-- Customer Groups
CREATE TABLE IF NOT EXISTS customers_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    reward_system_id UUID,
    minimal_credit_payment DECIMAL(18,5) DEFAULT 0,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    pobox TEXT,
    gender TEXT,
    birthdate DATE,
    group_id UUID REFERENCES customers_groups(id) ON DELETE SET NULL,
    account_amount DECIMAL(18,5) DEFAULT 0,
    credit_limit_amount DECIMAL(18,5) DEFAULT 0,
    purchases_amount DECIMAL(18,5) DEFAULT 0,
    owed_amount DECIMAL(18,5) DEFAULT 0,
    reward_system_points INTEGER DEFAULT 0,
    description TEXT,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customer Addresses
CREATE TABLE IF NOT EXISTS customers_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'billing',
    first_name TEXT,
    last_name TEXT,
    company TEXT,
    address_1 TEXT,
    address_2 TEXT,
    city TEXT,
    pobox TEXT,
    country TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customer Account History
CREATE TABLE IF NOT EXISTS customers_account_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    order_id UUID,
    operation TEXT NOT NULL,
    previous_amount DECIMAL(18,5) DEFAULT 0,
    amount DECIMAL(18,5) DEFAULT 0,
    next_amount DECIMAL(18,5) DEFAULT 0,
    description TEXT,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- 5. COUPONS & REWARDS
-- ================================================

-- Reward Systems
CREATE TABLE IF NOT EXISTS rewards_system (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    target DECIMAL(18,5) DEFAULT 0,
    coupon_id UUID,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reward System Rules
CREATE TABLE IF NOT EXISTS rewards_system_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reward_id UUID REFERENCES rewards_system(id) ON DELETE CASCADE,
    from_amount DECIMAL(18,5) DEFAULT 0,
    to_amount DECIMAL(18,5) DEFAULT 0,
    reward DECIMAL(18,5) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'percentage_discount',
    discount_type TEXT DEFAULT 'percentage',
    discount_value DECIMAL(18,5) DEFAULT 0,
    valid_until TIMESTAMPTZ,
    minimum_cart_value DECIMAL(18,5) DEFAULT 0,
    maximum_usage INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    limit_usage BOOLEAN DEFAULT false,
    description TEXT,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Coupon Categories (restrictions)
CREATE TABLE IF NOT EXISTS coupons_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    category_id UUID REFERENCES product_categories(id) ON DELETE CASCADE
);

-- Coupon Products (restrictions)
CREATE TABLE IF NOT EXISTS coupons_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE
);

-- Coupon Customer Groups (restrictions)
CREATE TABLE IF NOT EXISTS coupons_customers_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    group_id UUID REFERENCES customers_groups(id) ON DELETE CASCADE
);

-- Customer Coupons
CREATE TABLE IF NOT EXISTS customers_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    usage INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Customer Rewards
CREATE TABLE IF NOT EXISTS customers_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES rewards_system(id) ON DELETE SET NULL,
    reward_name TEXT,
    points DECIMAL(18,5) DEFAULT 0,
    target DECIMAL(18,5) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- 6. PAYMENT TYPES & REGISTERS
-- ================================================

-- Payment Types
CREATE TABLE IF NOT EXISTS payment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    identifier TEXT UNIQUE NOT NULL,
    priority INTEGER DEFAULT 0,
    description TEXT,
    readonly BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Registers
CREATE TABLE IF NOT EXISTS registers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'closed',
    balance DECIMAL(18,5) DEFAULT 0,
    used_by UUID REFERENCES profiles(id),
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Register History
CREATE TABLE IF NOT EXISTS registers_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_id UUID REFERENCES registers(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    transaction_type TEXT,
    value DECIMAL(18,5) DEFAULT 0,
    balance_before DECIMAL(18,5) DEFAULT 0,
    balance_after DECIMAL(18,5) DEFAULT 0,
    description TEXT,
    order_id UUID,
    payment_id UUID,
    payment_type_id UUID REFERENCES payment_types(id),
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- 7. ORDERS & SALES
-- ================================================

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'in-store',
    title TEXT,
    payment_status TEXT DEFAULT 'unpaid',
    process_status TEXT DEFAULT 'pending',
    delivery_status TEXT DEFAULT 'pending',
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    subtotal DECIMAL(18,5) DEFAULT 0,
    products_total DECIMAL(18,5) DEFAULT 0,
    products_total_cost_price DECIMAL(18,5) DEFAULT 0,
    shipping DECIMAL(18,5) DEFAULT 0,
    shipping_rate DECIMAL(18,5) DEFAULT 0,
    shipping_type TEXT DEFAULT 'flat',
    discount DECIMAL(18,5) DEFAULT 0,
    discount_rate DECIMAL(18,5) DEFAULT 0,
    discount_type TEXT DEFAULT 'flat',
    discount_percentage DECIMAL(18,5) DEFAULT 0,
    products_discount DECIMAL(18,5) DEFAULT 0,
    total_without_discount DECIMAL(18,5) DEFAULT 0,
    tax_value DECIMAL(18,5) DEFAULT 0,
    total_coupons DECIMAL(18,5) DEFAULT 0,
    total_instalments DECIMAL(18,5) DEFAULT 0,
    total DECIMAL(18,5) DEFAULT 0,
    gross_total DECIMAL(18,5) DEFAULT 0,
    net_total DECIMAL(18,5) DEFAULT 0,
    tendered DECIMAL(18,5) DEFAULT 0,
    change DECIMAL(18,5) DEFAULT 0,
    voidance_reason TEXT,
    note TEXT,
    register_id UUID REFERENCES registers(id) ON DELETE SET NULL,
    author UUID REFERENCES profiles(id),
    expected_payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order Products
CREATE TABLE IF NOT EXISTS orders_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    procurement_product_id UUID,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    unit_quantity_id UUID REFERENCES product_unit_quantities(id) ON DELETE SET NULL,
    name TEXT,
    mode TEXT DEFAULT 'normal',
    quantity DECIMAL(18,5) DEFAULT 0,
    return_observations TEXT,
    return_condition TEXT,
    unit_price DECIMAL(18,5) DEFAULT 0,
    net_price DECIMAL(18,5) DEFAULT 0,
    gross_price DECIMAL(18,5) DEFAULT 0,
    discount DECIMAL(18,5) DEFAULT 0,
    discount_rate DECIMAL(18,5) DEFAULT 0,
    discount_type TEXT DEFAULT 'flat',
    discount_percentage DECIMAL(18,5) DEFAULT 0,
    tax_value DECIMAL(18,5) DEFAULT 0,
    rate DECIMAL(18,5) DEFAULT 0,
    tax_group_id UUID REFERENCES taxes_groups(id) ON DELETE SET NULL,
    total_price DECIMAL(18,5) DEFAULT 0,
    total_price_without_discount DECIMAL(18,5) DEFAULT 0,
    total_price_with_discount DECIMAL(18,5) DEFAULT 0,
    total_gross_price DECIMAL(18,5) DEFAULT 0,
    total_net_price DECIMAL(18,5) DEFAULT 0,
    total_purchase_price DECIMAL(18,5) DEFAULT 0,
    status TEXT DEFAULT 'sold',
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order Payments
CREATE TABLE IF NOT EXISTS orders_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    payment_type_id UUID REFERENCES payment_types(id) ON DELETE SET NULL,
    identifier TEXT,
    value DECIMAL(18,5) DEFAULT 0,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Order Taxes
CREATE TABLE IF NOT EXISTS orders_taxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    tax_id UUID REFERENCES taxes(id) ON DELETE SET NULL,
    tax_name TEXT,
    rate DECIMAL(18,5) DEFAULT 0,
    tax_value DECIMAL(18,5) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Order Coupons
CREATE TABLE IF NOT EXISTS orders_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
    customer_coupon_id UUID REFERENCES customers_coupons(id) ON DELETE SET NULL,
    code TEXT,
    name TEXT,
    type TEXT,
    discount_type TEXT,
    discount_value DECIMAL(18,5) DEFAULT 0,
    value DECIMAL(18,5) DEFAULT 0,
    minimum_cart_value DECIMAL(18,5) DEFAULT 0,
    maximum_cart_value DECIMAL(18,5) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Order Instalments (payment scheduling)
CREATE TABLE IF NOT EXISTS orders_instalments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(18,5) DEFAULT 0,
    date TIMESTAMPTZ NOT NULL,
    paid BOOLEAN DEFAULT false,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order Refunds
CREATE TABLE IF NOT EXISTS orders_refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    total DECIMAL(18,5) DEFAULT 0,
    shipping DECIMAL(18,5) DEFAULT 0,
    product_refunds DECIMAL(18,5) DEFAULT 0,
    payment_method TEXT,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Order Product Refunds
CREATE TABLE IF NOT EXISTS orders_product_refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    order_refund_id UUID REFERENCES orders_refunds(id) ON DELETE CASCADE,
    order_product_id UUID REFERENCES orders_products(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    condition TEXT DEFAULT 'unspoiled',
    quantity DECIMAL(18,5) DEFAULT 0,
    unit_price DECIMAL(18,5) DEFAULT 0,
    total_price DECIMAL(18,5) DEFAULT 0,
    description TEXT,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Order Addresses
CREATE TABLE IF NOT EXISTS orders_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'billing',
    first_name TEXT,
    last_name TEXT,
    company TEXT,
    address_1 TEXT,
    address_2 TEXT,
    city TEXT,
    pobox TEXT,
    country TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Order Storage (temporary/draft orders)
CREATE TABLE IF NOT EXISTS orders_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_identifier TEXT,
    data JSONB,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order Settings
CREATE TABLE IF NOT EXISTS orders_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- 8. PROCUREMENT & SUPPLIERS
-- ================================================

-- Providers (Suppliers)
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address_1 TEXT,
    address_2 TEXT,
    description TEXT,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Procurements
CREATE TABLE IF NOT EXISTS procurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    invoice_reference TEXT,
    invoice_date DATE,
    cost DECIMAL(18,5) DEFAULT 0,
    tax_value DECIMAL(18,5) DEFAULT 0,
    value DECIMAL(18,5) DEFAULT 0,
    delivery_status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'unpaid',
    total_items INTEGER DEFAULT 0,
    description TEXT,
    automatic_approval BOOLEAN DEFAULT false,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Procurement Products
CREATE TABLE IF NOT EXISTS procurements_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    procurement_id UUID REFERENCES procurements(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    name TEXT,
    barcode TEXT,
    quantity DECIMAL(18,5) DEFAULT 0,
    purchase_price DECIMAL(18,5) DEFAULT 0,
    tax_value DECIMAL(18,5) DEFAULT 0,
    total_purchase_price DECIMAL(18,5) DEFAULT 0,
    expiration_date DATE,
    convert_unit_id UUID REFERENCES units(id),
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- 9. FINANCIAL & TRANSACTIONS
-- ================================================

-- Transaction Accounts (Chart of Accounts)
CREATE TABLE IF NOT EXISTS transactions_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    account TEXT NOT NULL UNIQUE,
    operation TEXT NOT NULL,
    description TEXT,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES transactions_accounts(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'direct',
    status TEXT DEFAULT 'active',
    recurring_type TEXT,
    recurring_on INTEGER,
    occurrence INTEGER DEFAULT 0,
    occurrence_count INTEGER DEFAULT 0,
    scheduled_date TIMESTAMPTZ,
    value DECIMAL(18,5) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    description TEXT,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    order_refund_id UUID REFERENCES orders_refunds(id) ON DELETE SET NULL,
    procurement_id UUID REFERENCES procurements(id) ON DELETE SET NULL,
    register_history_id UUID REFERENCES registers_history(id) ON DELETE SET NULL,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transaction History
CREATE TABLE IF NOT EXISTS transactions_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    operation TEXT NOT NULL,
    value DECIMAL(18,5) DEFAULT 0,
    name TEXT,
    status TEXT DEFAULT 'completed',
    trigger_date TIMESTAMPTZ,
    description TEXT,
    author UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Transaction Balance Days
CREATE TABLE IF NOT EXISTS transaction_balance_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_year INTEGER NOT NULL,
    date DATE NOT NULL UNIQUE,
    balance DECIMAL(18,5) DEFAULT 0,
    income DECIMAL(18,5) DEFAULT 0,
    expense DECIMAL(18,5) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transaction Balance Months
CREATE TABLE IF NOT EXISTS transaction_balance_months (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    balance DECIMAL(18,5) DEFAULT 0,
    income DECIMAL(18,5) DEFAULT 0,
    expense DECIMAL(18,5) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(month, year)
);

-- ================================================
-- 10. REPORTING
-- ================================================

-- Dashboard Days
CREATE TABLE IF NOT EXISTS dashboard_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_year INTEGER NOT NULL,
    date DATE NOT NULL UNIQUE,
    total_income DECIMAL(18,5) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_paid_orders_count INTEGER DEFAULT 0,
    total_paid_orders DECIMAL(18,5) DEFAULT 0,
    total_unpaid_orders_count INTEGER DEFAULT 0,
    total_unpaid_orders DECIMAL(18,5) DEFAULT 0,
    total_partially_paid_orders_count INTEGER DEFAULT 0,
    total_partially_paid_orders DECIMAL(18,5) DEFAULT 0,
    wasted_products_count INTEGER DEFAULT 0,
    total_wasted_products DECIMAL(18,5) DEFAULT 0,
    total_discount DECIMAL(18,5) DEFAULT 0,
    total_taxes DECIMAL(18,5) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dashboard Months
CREATE TABLE IF NOT EXISTS dashboard_months (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    total_income DECIMAL(18,5) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_paid_orders_count INTEGER DEFAULT 0,
    total_paid_orders DECIMAL(18,5) DEFAULT 0,
    total_unpaid_orders_count INTEGER DEFAULT 0,
    total_unpaid_orders DECIMAL(18,5) DEFAULT 0,
    total_partially_paid_orders_count INTEGER DEFAULT 0,
    total_partially_paid_orders DECIMAL(18,5) DEFAULT 0,
    wasted_products_count INTEGER DEFAULT 0,
    total_wasted_products DECIMAL(18,5) DEFAULT 0,
    total_discount DECIMAL(18,5) DEFAULT 0,
    total_taxes DECIMAL(18,5) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(month, year)
);


