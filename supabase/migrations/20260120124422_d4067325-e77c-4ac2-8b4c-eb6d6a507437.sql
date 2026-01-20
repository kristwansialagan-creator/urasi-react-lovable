-- Seed default permissions for RBAC system
-- These permissions map to the route guards in App.tsx

-- POS permissions
INSERT INTO permissions (namespace, name, description) VALUES
('pos', 'access', 'Access to POS system'),
('pos', 'void', 'Can void orders'),
('pos', 'discount', 'Can apply discounts')
ON CONFLICT DO NOTHING;

-- Products permissions
INSERT INTO permissions (namespace, name, description) VALUES
('products', 'read', 'View products'),
('products', 'create', 'Create new products'),
('products', 'update', 'Update existing products'),
('products', 'delete', 'Delete products')
ON CONFLICT DO NOTHING;

-- Categories permissions
INSERT INTO permissions (namespace, name, description) VALUES
('categories', 'read', 'View categories'),
('categories', 'create', 'Create categories'),
('categories', 'update', 'Update categories'),
('categories', 'delete', 'Delete categories')
ON CONFLICT DO NOTHING;

-- Orders permissions
INSERT INTO permissions (namespace, name, description) VALUES
('orders', 'read', 'View orders'),
('orders', 'create', 'Create orders'),
('orders', 'update', 'Update orders'),
('orders', 'delete', 'Delete orders'),
('orders', 'refund', 'Process refunds')
ON CONFLICT DO NOTHING;

-- Customers permissions
INSERT INTO permissions (namespace, name, description) VALUES
('customers', 'read', 'View customers'),
('customers', 'create', 'Create customers'),
('customers', 'update', 'Update customers'),
('customers', 'delete', 'Delete customers')
ON CONFLICT DO NOTHING;

-- Registers permissions
INSERT INTO permissions (namespace, name, description) VALUES
('registers', 'read', 'View registers'),
('registers', 'create', 'Create registers'),
('registers', 'update', 'Update registers'),
('registers', 'delete', 'Delete registers'),
('registers', 'open', 'Open register'),
('registers', 'close', 'Close register')
ON CONFLICT DO NOTHING;

-- Reports permissions
INSERT INTO permissions (namespace, name, description) VALUES
('reports', 'read', 'View reports'),
('reports', 'export', 'Export reports')
ON CONFLICT DO NOTHING;

-- Procurements permissions
INSERT INTO permissions (namespace, name, description) VALUES
('procurements', 'read', 'View procurements'),
('procurements', 'create', 'Create procurements'),
('procurements', 'update', 'Update procurements'),
('procurements', 'delete', 'Delete procurements')
ON CONFLICT DO NOTHING;

-- Coupons permissions
INSERT INTO permissions (namespace, name, description) VALUES
('coupons', 'read', 'View coupons'),
('coupons', 'create', 'Create coupons'),
('coupons', 'update', 'Update coupons'),
('coupons', 'delete', 'Delete coupons')
ON CONFLICT DO NOTHING;

-- Transactions permissions
INSERT INTO permissions (namespace, name, description) VALUES
('transactions', 'read', 'View transactions'),
('transactions', 'create', 'Create transactions'),
('transactions', 'update', 'Update transactions'),
('transactions', 'delete', 'Delete transactions')
ON CONFLICT DO NOTHING;

-- Accounting permissions
INSERT INTO permissions (namespace, name, description) VALUES
('accounting', 'read', 'View accounting/journal entries'),
('accounting', 'create', 'Create journal entries'),
('accounting', 'update', 'Update journal entries'),
('accounting', 'delete', 'Delete journal entries')
ON CONFLICT DO NOTHING;

-- Media permissions
INSERT INTO permissions (namespace, name, description) VALUES
('media', 'read', 'View media library'),
('media', 'create', 'Upload media'),
('media', 'update', 'Update media'),
('media', 'delete', 'Delete media')
ON CONFLICT DO NOTHING;

-- Rewards permissions
INSERT INTO permissions (namespace, name, description) VALUES
('rewards', 'read', 'View rewards'),
('rewards', 'create', 'Create rewards'),
('rewards', 'update', 'Update rewards'),
('rewards', 'delete', 'Delete rewards')
ON CONFLICT DO NOTHING;

-- Settings permissions (admin level)
INSERT INTO permissions (namespace, name, description) VALUES
('settings', 'read', 'View settings'),
('settings', 'update', 'Update settings')
ON CONFLICT DO NOTHING;

-- Users permissions (admin level)
INSERT INTO permissions (namespace, name, description) VALUES
('users', 'read', 'View users'),
('users', 'create', 'Create users'),
('users', 'update', 'Update users'),
('users', 'delete', 'Delete users')
ON CONFLICT DO NOTHING;

-- Roles permissions (admin level)
INSERT INTO permissions (namespace, name, description) VALUES
('roles', 'read', 'View roles'),
('roles', 'create', 'Create roles'),
('roles', 'update', 'Update roles'),
('roles', 'delete', 'Delete roles')
ON CONFLICT DO NOTHING;

-- Create default roles if not exist
INSERT INTO roles (namespace, name, description) VALUES
('admin', 'Admin', 'Full access to all features'),
('cashier', 'Kasir', 'POS and basic order access'),
('manager', 'Manager', 'Access to reports and inventory management'),
('inventory', 'Inventory Staff', 'Access to products and stock management')
ON CONFLICT DO NOTHING;