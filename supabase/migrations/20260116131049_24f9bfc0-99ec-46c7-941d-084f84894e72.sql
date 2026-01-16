-- Fix RLS policies for all existing tables - Batch 1 (Core)

-- Coupons
DROP POLICY IF EXISTS "coupons_all" ON coupons;
CREATE POLICY "coupons_authenticated_access" ON coupons
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Coupons Categories
DROP POLICY IF EXISTS "coupons_categories_all" ON coupons_categories;
CREATE POLICY "coupons_categories_authenticated_access" ON coupons_categories
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Coupons Products
DROP POLICY IF EXISTS "coupons_products_all" ON coupons_products;
CREATE POLICY "coupons_products_authenticated_access" ON coupons_products
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Coupons Customers Groups
DROP POLICY IF EXISTS "coupons_customers_groups_all" ON coupons_customers_groups;
CREATE POLICY "coupons_customers_groups_authenticated_access" ON coupons_customers_groups
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Customer Groups
DROP POLICY IF EXISTS "Allow authenticated users to delete customer groups" ON customer_groups;
DROP POLICY IF EXISTS "Allow authenticated users to insert customer groups" ON customer_groups;
DROP POLICY IF EXISTS "Allow authenticated users to update customer groups" ON customer_groups;
DROP POLICY IF EXISTS "Allow authenticated users to view customer groups" ON customer_groups;
CREATE POLICY "customer_groups_authenticated_access" ON customer_groups
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Customers
DROP POLICY IF EXISTS "customers_all" ON customers;
CREATE POLICY "customers_authenticated_access" ON customers
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Customers Account History
DROP POLICY IF EXISTS "customers_account_history_all" ON customers_account_history;
CREATE POLICY "customers_account_history_authenticated_access" ON customers_account_history
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Customers Addresses
DROP POLICY IF EXISTS "customers_addresses_all" ON customers_addresses;
CREATE POLICY "customers_addresses_authenticated_access" ON customers_addresses
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Customers Coupons
DROP POLICY IF EXISTS "customers_coupons_all" ON customers_coupons;
CREATE POLICY "customers_coupons_authenticated_access" ON customers_coupons
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Customers Groups
DROP POLICY IF EXISTS "customers_groups_all" ON customers_groups;
CREATE POLICY "customers_groups_authenticated_access" ON customers_groups
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Customers Rewards
DROP POLICY IF EXISTS "customers_rewards_all" ON customers_rewards;
CREATE POLICY "customers_rewards_authenticated_access" ON customers_rewards
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Dashboard Days
DROP POLICY IF EXISTS "dashboard_days_all" ON dashboard_days;
CREATE POLICY "dashboard_days_authenticated_access" ON dashboard_days
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Dashboard Months
DROP POLICY IF EXISTS "dashboard_months_all" ON dashboard_months;
CREATE POLICY "dashboard_months_authenticated_access" ON dashboard_months
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Label Templates
DROP POLICY IF EXISTS "label_templates_all" ON label_templates;
CREATE POLICY "label_templates_authenticated_access" ON label_templates
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Medias
DROP POLICY IF EXISTS "medias_all" ON medias;
CREATE POLICY "medias_authenticated_access" ON medias
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Modules
DROP POLICY IF EXISTS "modules_all" ON modules;
CREATE POLICY "modules_authenticated_access" ON modules
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Notifications (user-specific)
DROP POLICY IF EXISTS "notifications_all" ON notifications;
CREATE POLICY "notifications_authenticated_access" ON notifications
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Options
DROP POLICY IF EXISTS "options_all" ON options;
CREATE POLICY "options_authenticated_access" ON options
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Orders
DROP POLICY IF EXISTS "orders_all" ON orders;
CREATE POLICY "orders_authenticated_access" ON orders
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Order Payments
DROP POLICY IF EXISTS "order_payments_all" ON order_payments;
CREATE POLICY "order_payments_authenticated_access" ON order_payments
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Order Products
DROP POLICY IF EXISTS "order_products_all" ON order_products;
CREATE POLICY "order_products_authenticated_access" ON order_products
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Order Refunds
DROP POLICY IF EXISTS "order_refunds_all" ON order_refunds;
CREATE POLICY "order_refunds_authenticated_access" ON order_refunds
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Orders Addresses
DROP POLICY IF EXISTS "orders_addresses_all" ON orders_addresses;
CREATE POLICY "orders_addresses_authenticated_access" ON orders_addresses
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Orders Coupons
DROP POLICY IF EXISTS "orders_coupons_all" ON orders_coupons;
CREATE POLICY "orders_coupons_authenticated_access" ON orders_coupons
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Orders Instalments
DROP POLICY IF EXISTS "orders_instalments_all" ON orders_instalments;
CREATE POLICY "orders_instalments_authenticated_access" ON orders_instalments
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Orders Payments
DROP POLICY IF EXISTS "orders_payments_all" ON orders_payments;
CREATE POLICY "orders_payments_authenticated_access" ON orders_payments
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Orders Product Refunds
DROP POLICY IF EXISTS "orders_product_refunds_all" ON orders_product_refunds;
CREATE POLICY "orders_product_refunds_authenticated_access" ON orders_product_refunds
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Orders Products
DROP POLICY IF EXISTS "orders_products_all" ON orders_products;
CREATE POLICY "orders_products_authenticated_access" ON orders_products
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Orders Refunds
DROP POLICY IF EXISTS "orders_refunds_all" ON orders_refunds;
CREATE POLICY "orders_refunds_authenticated_access" ON orders_refunds
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Orders Settings
DROP POLICY IF EXISTS "orders_settings_all" ON orders_settings;
CREATE POLICY "orders_settings_authenticated_access" ON orders_settings
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Orders Storage
DROP POLICY IF EXISTS "orders_storage_all" ON orders_storage;
CREATE POLICY "orders_storage_authenticated_access" ON orders_storage
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Orders Taxes
DROP POLICY IF EXISTS "orders_taxes_all" ON orders_taxes;
CREATE POLICY "orders_taxes_authenticated_access" ON orders_taxes
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Payment Types
DROP POLICY IF EXISTS "payment_types_all" ON payment_types;
CREATE POLICY "payment_types_authenticated_access" ON payment_types
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Permissions
DROP POLICY IF EXISTS "permissions_all" ON permissions;
CREATE POLICY "permissions_authenticated_access" ON permissions
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Procurements
DROP POLICY IF EXISTS "procurements_all" ON procurements;
CREATE POLICY "procurements_authenticated_access" ON procurements
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Procurements Products
DROP POLICY IF EXISTS "procurements_products_all" ON procurements_products;
CREATE POLICY "procurements_products_authenticated_access" ON procurements_products
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Product Categories
DROP POLICY IF EXISTS "product_categories_all" ON product_categories;
CREATE POLICY "product_categories_authenticated_access" ON product_categories
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Product Group Items
DROP POLICY IF EXISTS "product_group_items_all" ON product_group_items;
CREATE POLICY "product_group_items_authenticated_access" ON product_group_items
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Product Groups
DROP POLICY IF EXISTS "product_groups_all" ON product_groups;
CREATE POLICY "product_groups_authenticated_access" ON product_groups
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Product Unit Quantities
DROP POLICY IF EXISTS "product_unit_quantities_all" ON product_unit_quantities;
CREATE POLICY "product_unit_quantities_authenticated_access" ON product_unit_quantities
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Products
DROP POLICY IF EXISTS "products_all" ON products;
CREATE POLICY "products_authenticated_access" ON products
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Products Gallery
DROP POLICY IF EXISTS "products_gallery_all" ON products_gallery;
CREATE POLICY "products_gallery_authenticated_access" ON products_gallery
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Products History
DROP POLICY IF EXISTS "products_history_all" ON products_history;
CREATE POLICY "products_history_authenticated_access" ON products_history
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Products History Combined
DROP POLICY IF EXISTS "products_history_combined_all" ON products_history_combined;
CREATE POLICY "products_history_combined_authenticated_access" ON products_history_combined
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Products Metas
DROP POLICY IF EXISTS "products_metas_all" ON products_metas;
CREATE POLICY "products_metas_authenticated_access" ON products_metas
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Products Sub Items
DROP POLICY IF EXISTS "products_sub_items_all" ON products_sub_items;
CREATE POLICY "products_sub_items_authenticated_access" ON products_sub_items
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Products Taxes
DROP POLICY IF EXISTS "products_taxes_all" ON products_taxes;
CREATE POLICY "products_taxes_authenticated_access" ON products_taxes
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Profiles
DROP POLICY IF EXISTS "profiles_all" ON profiles;
CREATE POLICY "profiles_authenticated_access" ON profiles
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Providers
DROP POLICY IF EXISTS "providers_all" ON providers;
CREATE POLICY "providers_authenticated_access" ON providers
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Registers
DROP POLICY IF EXISTS "registers_all" ON registers;
CREATE POLICY "registers_authenticated_access" ON registers
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Registers History
DROP POLICY IF EXISTS "registers_history_all" ON registers_history;
CREATE POLICY "registers_history_authenticated_access" ON registers_history
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Rewards System
DROP POLICY IF EXISTS "rewards_system_all" ON rewards_system;
CREATE POLICY "rewards_system_authenticated_access" ON rewards_system
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Rewards System Rules
DROP POLICY IF EXISTS "rewards_system_rules_all" ON rewards_system_rules;
CREATE POLICY "rewards_system_rules_authenticated_access" ON rewards_system_rules
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Role Permissions
DROP POLICY IF EXISTS "role_permissions_all" ON role_permissions;
CREATE POLICY "role_permissions_authenticated_access" ON role_permissions
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Roles
DROP POLICY IF EXISTS "roles_all" ON roles;
CREATE POLICY "roles_authenticated_access" ON roles
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Settings
DROP POLICY IF EXISTS "settings_all" ON settings;
CREATE POLICY "settings_authenticated_access" ON settings
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Settings Storage
DROP POLICY IF EXISTS "settings_storage_all" ON settings_storage;
CREATE POLICY "settings_storage_authenticated_access" ON settings_storage
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Taxes
DROP POLICY IF EXISTS "taxes_all" ON taxes;
CREATE POLICY "taxes_authenticated_access" ON taxes
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Taxes Groups
DROP POLICY IF EXISTS "taxes_groups_all" ON taxes_groups;
CREATE POLICY "taxes_groups_authenticated_access" ON taxes_groups
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Transaction Accounts
DROP POLICY IF EXISTS "transaction_accounts_all" ON transaction_accounts;
CREATE POLICY "transaction_accounts_authenticated_access" ON transaction_accounts
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Transaction Balance Days
DROP POLICY IF EXISTS "transaction_balance_days_all" ON transaction_balance_days;
CREATE POLICY "transaction_balance_days_authenticated_access" ON transaction_balance_days
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Transaction Balance Months
DROP POLICY IF EXISTS "transaction_balance_months_all" ON transaction_balance_months;
CREATE POLICY "transaction_balance_months_authenticated_access" ON transaction_balance_months
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Transactions
DROP POLICY IF EXISTS "transactions_all" ON transactions;
CREATE POLICY "transactions_authenticated_access" ON transactions
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Transactions Accounts
DROP POLICY IF EXISTS "transactions_accounts_all" ON transactions_accounts;
CREATE POLICY "transactions_accounts_authenticated_access" ON transactions_accounts
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Transactions History
DROP POLICY IF EXISTS "transactions_history_all" ON transactions_history;
CREATE POLICY "transactions_history_authenticated_access" ON transactions_history
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Units
DROP POLICY IF EXISTS "units_all" ON units;
CREATE POLICY "units_authenticated_access" ON units
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Units Groups (correct table name)
DROP POLICY IF EXISTS "units_groups_all" ON units_groups;
CREATE POLICY "units_groups_authenticated_access" ON units_groups
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Users Roles (correct table name)
DROP POLICY IF EXISTS "users_roles_all" ON users_roles;
CREATE POLICY "users_roles_authenticated_access" ON users_roles
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);