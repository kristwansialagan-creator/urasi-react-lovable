-- ================================================
-- NEXOPOS DEFAULT DATA
-- Migration: 003_default_data
-- ================================================

-- Insert default roles
INSERT INTO roles (name, namespace, description, locked) VALUES
('Administrator', 'admin', 'Full system access with all permissions', true),
('Store Administrator', 'nexopos.store.administrator', 'Store management access with limited admin capabilities', false),
('Cashier', 'nexopos.store.cashier', 'Sales and POS operations access', false),
('Customer', 'nexopos.store.customer', 'Customer portal access for viewing orders and account', false),
('Driver', 'nexopos.driver', 'Delivery management and order fulfillment', false),
('User', 'user', 'Basic user access with minimal permissions', true)
ON CONFLICT (namespace) DO NOTHING;

-- Insert default payment types
INSERT INTO payment_types (label, identifier, priority, readonly, active, description) VALUES
('Cash Payment', 'cash-payment', 0, true, true, 'Direct cash payment at point of sale'),
('Bank Payment', 'bank-payment', 1, false, true, 'Bank transfer or check payment'),
('Account Payment', 'account-payment', 2, true, true, 'Payment using customer account balance'),
('Credit Card', 'credit-card-payment', 3, false, true, 'Credit or debit card payment'),
('QRIS', 'qris-payment', 4, false, true, 'QR code payment (QRIS Indonesia)')
ON CONFLICT (identifier) DO NOTHING;

-- Insert default transaction accounts
INSERT INTO transactions_accounts (name, account, operation, description) VALUES
('Sales Revenue', 'sales', 'credit', 'Income from product sales'),
('Procurement Expenses', 'procurements', 'debit', 'Expenses for purchasing inventory'),
('Refunds', 'refunds', 'debit', 'Money returned to customers'),
('Cash Register Deposits', 'register-cash-in', 'credit', 'Cash deposited into registers'),
('Cash Register Withdrawals', 'register-cash-out', 'debit', 'Cash withdrawn from registers'),
('Customer Account Payments', 'customer-account-payments', 'credit', 'Payments received from customer accounts'),
('Customer Account Deposits', 'customer-account-deposits', 'credit', 'Deposits added to customer accounts'),
('Shipping Income', 'shipping-income', 'credit', 'Income from shipping charges'),
('Discount Expenses', 'discounts', 'debit', 'Discounts given to customers'),
('Tax Collected', 'tax-collected', 'credit', 'Taxes collected from sales')
ON CONFLICT (account) DO NOTHING;

-- Insert default unit groups
INSERT INTO units_groups (id, name, description) VALUES
('00000000-0000-0000-0000-000000000001', 'Quantity', 'Standard quantity units'),
('00000000-0000-0000-0000-000000000002', 'Weight', 'Weight measurement units'),
('00000000-0000-0000-0000-000000000003', 'Volume', 'Volume/liquid measurement units'),
('00000000-0000-0000-0000-000000000004', 'Length', 'Length measurement units')
ON CONFLICT (id) DO NOTHING;

-- Insert default units
INSERT INTO units (name, identifier, description, value, base_unit, group_id) VALUES
('Piece', 'pcs', 'Single item/piece', 1, true, '00000000-0000-0000-0000-000000000001'),
('Box', 'box', 'Box containing multiple items', 12, false, '00000000-0000-0000-0000-000000000001'),
('Dozen', 'dozen', '12 pieces', 12, false, '00000000-0000-0000-0000-000000000001'),
('Pack', 'pack', 'Package of items', 6, false, '00000000-0000-0000-0000-000000000001'),
('Kilogram', 'kg', 'Weight in kilograms', 1, true, '00000000-0000-0000-0000-000000000002'),
('Gram', 'g', 'Weight in grams', 0.001, false, '00000000-0000-0000-0000-000000000002'),
('Ounce', 'oz', 'Weight in ounces', 0.02835, false, '00000000-0000-0000-0000-000000000002'),
('Liter', 'L', 'Volume in liters', 1, true, '00000000-0000-0000-0000-000000000003'),
('Milliliter', 'ml', 'Volume in milliliters', 0.001, false, '00000000-0000-0000-0000-000000000003'),
('Gallon', 'gal', 'Volume in gallons', 3.785, false, '00000000-0000-0000-0000-000000000003'),
('Meter', 'm', 'Length in meters', 1, true, '00000000-0000-0000-0000-000000000004'),
('Centimeter', 'cm', 'Length in centimeters', 0.01, false, '00000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- Insert default tax groups
INSERT INTO taxes_groups (id, name, description) VALUES
('00000000-0000-0000-0000-000000000010', 'No Tax', 'Products without tax'),
('00000000-0000-0000-0000-000000000011', 'PPN 11%', 'Indonesian VAT 11%'),
('00000000-0000-0000-0000-000000000012', 'PPN 12%', 'Indonesian VAT 12%')
ON CONFLICT (id) DO NOTHING;

-- Insert default taxes
INSERT INTO taxes (name, rate, tax_group_id, type, description) VALUES
('No Tax', 0, '00000000-0000-0000-0000-000000000010', 'percentage', 'Zero tax rate'),
('PPN 11%', 11, '00000000-0000-0000-0000-000000000011', 'percentage', 'Indonesian Value Added Tax 11%'),
('PPN 12%', 12, '00000000-0000-0000-0000-000000000012', 'percentage', 'Indonesian Value Added Tax 12%')
ON CONFLICT DO NOTHING;

-- Insert default customer groups
INSERT INTO customers_groups (id, name, description, minimal_credit_payment) VALUES
('00000000-0000-0000-0000-000000000020', 'Regular', 'Regular customers with standard pricing', 0),
('00000000-0000-0000-0000-000000000021', 'VIP', 'VIP customers with special discounts', 0),
('00000000-0000-0000-0000-000000000022', 'Wholesale', 'Wholesale customers with bulk pricing', 100000),
('00000000-0000-0000-0000-000000000023', 'Member', 'Registered members with loyalty benefits', 0)
ON CONFLICT (id) DO NOTHING;

-- Insert default product categories
INSERT INTO product_categories (id, name, description, displays_on_pos) VALUES
('00000000-0000-0000-0000-000000000030', 'Uncategorized', 'Products without a specific category', true),
('00000000-0000-0000-0000-000000000031', 'Food & Beverages', 'Food and drink products', true),
('00000000-0000-0000-0000-000000000032', 'Electronics', 'Electronic devices and accessories', true),
('00000000-0000-0000-0000-000000000033', 'Clothing', 'Apparel and fashion items', true),
('00000000-0000-0000-0000-000000000034', 'Home & Living', 'Home goods and furniture', true),
('00000000-0000-0000-0000-000000000035', 'Health & Beauty', 'Personal care and beauty products', true)
ON CONFLICT (id) DO NOTHING;

-- Insert default register
INSERT INTO registers (id, name, description, status, balance) VALUES
('00000000-0000-0000-0000-000000000040', 'Main Register', 'Primary cash register', 'closed', 0),
('00000000-0000-0000-0000-000000000041', 'Register 2', 'Secondary cash register', 'closed', 0)
ON CONFLICT (id) DO NOTHING;

-- Insert default system options
INSERT INTO options (key, value) VALUES
('store_name', 'URASI POS'),
('store_email', 'admin@urasi.com'),
('store_phone', '+62 812 3456 7890'),
('store_address', 'Jl. Contoh No. 123, Jakarta, Indonesia'),
('currency_symbol', 'Rp'),
('currency_position', 'before'),
('currency_thousand_separator', '.'),
('currency_decimal_separator', ','),
('currency_precision', '0'),
('pos_quick_product', 'true'),
('pos_auto_print_receipt', 'false'),
('pos_sound_effects', 'true'),
('default_tax_type', 'inclusive'),
('default_tax_group', '00000000-0000-0000-0000-000000000011'),
('low_stock_threshold', '10'),
('order_code_prefix', 'ORD'),
('allow_negative_stock', 'false')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Insert sample products (for testing)
INSERT INTO products (id, name, sku, barcode, type, status, stock_management, category_id, selling_price, purchase_price, description) VALUES
('00000000-0000-0000-0000-000000000050', 'Sample Product 1', 'SKU-001', '8901234567890', 'materialized', 'available', true, '00000000-0000-0000-0000-000000000031', 25000, 20000, 'This is a sample product for testing'),
('00000000-0000-0000-0000-000000000051', 'Sample Product 2', 'SKU-002', '8901234567891', 'materialized', 'available', true, '00000000-0000-0000-0000-000000000031', 50000, 40000, 'Another sample product'),
('00000000-0000-0000-0000-000000000052', 'Sample Product 3', 'SKU-003', '8901234567892', 'materialized', 'available', true, '00000000-0000-0000-0000-000000000032', 150000, 120000, 'Electronic sample product')
ON CONFLICT (id) DO NOTHING;

-- Insert sample product unit quantities (stock)
INSERT INTO product_unit_quantities (product_id, unit_id, quantity, low_quantity, stock_alert_enabled, sale_price, purchase_price) 
SELECT 
    p.id,
    u.id,
    100, -- initial stock
    10,  -- low stock threshold
    true,
    p.selling_price,
    p.purchase_price
FROM products p
CROSS JOIN units u
WHERE p.id IN ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000052')
AND u.identifier = 'pcs'
ON CONFLICT DO NOTHING;

-- Insert sample customers
INSERT INTO customers (id, first_name, last_name, email, phone, group_id, account_amount) VALUES
('00000000-0000-0000-0000-000000000060', 'John', 'Doe', 'john.doe@example.com', '+62 812 1111 1111', '00000000-0000-0000-0000-000000000020', 0),
('00000000-0000-0000-0000-000000000061', 'Jane', 'Smith', 'jane.smith@example.com', '+62 812 2222 2222', '00000000-0000-0000-0000-000000000021', 100000),
('00000000-0000-0000-0000-000000000062', 'Budi', 'Santoso', 'budi.santoso@example.com', '+62 812 3333 3333', '00000000-0000-0000-0000-000000000022', 500000)
ON CONFLICT (id) DO NOTHING;

-- Insert sample provider/supplier
INSERT INTO providers (id, name, email, phone, address_1, description) VALUES
('00000000-0000-0000-0000-000000000070', 'Default Supplier', 'supplier@example.com', '+62 812 4444 4444', 'Jl. Supplier No. 1, Jakarta', 'Default product supplier'),
('00000000-0000-0000-0000-000000000071', 'Electronics Supplier', 'electronics@example.com', '+62 812 5555 5555', 'Jl. Electronic No. 2, Bandung', 'Electronics and gadgets supplier')
ON CONFLICT (id) DO NOTHING;

-- Insert sample coupon
INSERT INTO coupons (id, name, code, type, discount_type, discount_value, active, description) VALUES
('00000000-0000-0000-0000-000000000080', 'Welcome Discount', 'WELCOME10', 'percentage_discount', 'percentage', 10, true, '10% discount for new customers'),
('00000000-0000-0000-0000-000000000081', 'Flat 50K Off', 'FLAT50K', 'flat_discount', 'flat', 50000, true, 'Rp 50.000 discount')
ON CONFLICT (id) DO NOTHING;
