-- ================================================
-- URASI RLS POLICIES & TRIGGERS
-- Migration: 002_rls_and_triggers
-- ================================================

-- ================================================
-- 11. ROW LEVEL SECURITY POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE medias ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE units_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxes_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_unit_quantities ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_history_combined ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_sub_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers_account_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_system ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_system_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons_customers_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE registers_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_instalments ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_product_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurements_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_balance_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_balance_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_months ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- RLS Policies for system tables (read all, admin write)
CREATE POLICY "roles_select" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "roles_all" ON roles FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "permissions_select" ON permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "permissions_all" ON permissions FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "role_permissions_select" ON role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_roles_select" ON users_roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "options_select" ON options FOR SELECT TO authenticated USING (true);
CREATE POLICY "options_all" ON options FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'urasi.store.administrator'))
);

-- RLS for medias
CREATE POLICY "medias_select" ON medias FOR SELECT TO authenticated USING (true);
CREATE POLICY "medias_insert" ON medias FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "medias_update" ON medias FOR UPDATE TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "medias_delete" ON medias FOR DELETE TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS for notifications
CREATE POLICY "notifications_own" ON notifications FOR ALL TO authenticated USING (user_id = auth.uid());

-- RLS for units & taxes (read all, staff write)
CREATE POLICY "units_groups_all" ON units_groups FOR ALL TO authenticated USING (true);
CREATE POLICY "units_all" ON units FOR ALL TO authenticated USING (true);
CREATE POLICY "taxes_groups_all" ON taxes_groups FOR ALL TO authenticated USING (true);
CREATE POLICY "taxes_all" ON taxes FOR ALL TO authenticated USING (true);

-- RLS for products
CREATE POLICY "product_categories_all" ON product_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "products_all" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "product_unit_quantities_all" ON product_unit_quantities FOR ALL TO authenticated USING (true);
CREATE POLICY "products_gallery_all" ON products_gallery FOR ALL TO authenticated USING (true);
CREATE POLICY "products_history_all" ON products_history FOR ALL TO authenticated USING (true);
CREATE POLICY "products_history_combined_all" ON products_history_combined FOR ALL TO authenticated USING (true);
CREATE POLICY "products_taxes_all" ON products_taxes FOR ALL TO authenticated USING (true);
CREATE POLICY "products_sub_items_all" ON products_sub_items FOR ALL TO authenticated USING (true);
CREATE POLICY "products_metas_all" ON products_metas FOR ALL TO authenticated USING (true);

-- RLS for customers
CREATE POLICY "customers_groups_all" ON customers_groups FOR ALL TO authenticated USING (true);
CREATE POLICY "customers_all" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "customers_addresses_all" ON customers_addresses FOR ALL TO authenticated USING (true);
CREATE POLICY "customers_account_history_all" ON customers_account_history FOR ALL TO authenticated USING (true);

-- RLS for coupons & rewards
CREATE POLICY "rewards_system_all" ON rewards_system FOR ALL TO authenticated USING (true);
CREATE POLICY "rewards_system_rules_all" ON rewards_system_rules FOR ALL TO authenticated USING (true);
CREATE POLICY "coupons_all" ON coupons FOR ALL TO authenticated USING (true);
CREATE POLICY "coupons_categories_all" ON coupons_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "coupons_products_all" ON coupons_products FOR ALL TO authenticated USING (true);
CREATE POLICY "coupons_customers_groups_all" ON coupons_customers_groups FOR ALL TO authenticated USING (true);
CREATE POLICY "customers_coupons_all" ON customers_coupons FOR ALL TO authenticated USING (true);
CREATE POLICY "customers_rewards_all" ON customers_rewards FOR ALL TO authenticated USING (true);

-- RLS for payments & registers
CREATE POLICY "payment_types_all" ON payment_types FOR ALL TO authenticated USING (true);
CREATE POLICY "registers_all" ON registers FOR ALL TO authenticated USING (true);
CREATE POLICY "registers_history_all" ON registers_history FOR ALL TO authenticated USING (true);

-- RLS for orders
CREATE POLICY "orders_all" ON orders FOR ALL TO authenticated USING (true);
CREATE POLICY "orders_products_all" ON orders_products FOR ALL TO authenticated USING (true);
CREATE POLICY "orders_payments_all" ON orders_payments FOR ALL TO authenticated USING (true);
CREATE POLICY "orders_taxes_all" ON orders_taxes FOR ALL TO authenticated USING (true);
CREATE POLICY "orders_coupons_all" ON orders_coupons FOR ALL TO authenticated USING (true);
CREATE POLICY "orders_instalments_all" ON orders_instalments FOR ALL TO authenticated USING (true);
CREATE POLICY "orders_refunds_all" ON orders_refunds FOR ALL TO authenticated USING (true);
CREATE POLICY "orders_product_refunds_all" ON orders_product_refunds FOR ALL TO authenticated USING (true);
CREATE POLICY "orders_addresses_all" ON orders_addresses FOR ALL TO authenticated USING (true);
CREATE POLICY "orders_storage_all" ON orders_storage FOR ALL TO authenticated USING (true);
CREATE POLICY "orders_settings_all" ON orders_settings FOR ALL TO authenticated USING (true);

-- RLS for procurement
CREATE POLICY "providers_all" ON providers FOR ALL TO authenticated USING (true);
CREATE POLICY "procurements_all" ON procurements FOR ALL TO authenticated USING (true);
CREATE POLICY "procurements_products_all" ON procurements_products FOR ALL TO authenticated USING (true);

-- RLS for transactions
CREATE POLICY "transactions_accounts_all" ON transactions_accounts FOR ALL TO authenticated USING (true);
CREATE POLICY "transactions_all" ON transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "transactions_history_all" ON transactions_history FOR ALL TO authenticated USING (true);
CREATE POLICY "transaction_balance_days_all" ON transaction_balance_days FOR ALL TO authenticated USING (true);
CREATE POLICY "transaction_balance_months_all" ON transaction_balance_months FOR ALL TO authenticated USING (true);

-- RLS for dashboard
CREATE POLICY "dashboard_days_all" ON dashboard_days FOR ALL TO authenticated USING (true);
CREATE POLICY "dashboard_months_all" ON dashboard_months FOR ALL TO authenticated USING (true);

-- ================================================
-- 12. TRIGGERS & FUNCTIONS
-- ================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_options_updated_at BEFORE UPDATE ON options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medias_updated_at BEFORE UPDATE ON medias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_units_groups_updated_at BEFORE UPDATE ON units_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_taxes_groups_updated_at BEFORE UPDATE ON taxes_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_taxes_updated_at BEFORE UPDATE ON taxes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_unit_quantities_updated_at BEFORE UPDATE ON product_unit_quantities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_history_combined_updated_at BEFORE UPDATE ON products_history_combined FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_metas_updated_at BEFORE UPDATE ON products_metas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_groups_updated_at BEFORE UPDATE ON customers_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_addresses_updated_at BEFORE UPDATE ON customers_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rewards_system_updated_at BEFORE UPDATE ON rewards_system FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rewards_system_rules_updated_at BEFORE UPDATE ON rewards_system_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_types_updated_at BEFORE UPDATE ON payment_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registers_updated_at BEFORE UPDATE ON registers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_products_updated_at BEFORE UPDATE ON orders_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_instalments_updated_at BEFORE UPDATE ON orders_instalments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_storage_updated_at BEFORE UPDATE ON orders_storage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procurements_updated_at BEFORE UPDATE ON procurements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procurements_products_updated_at BEFORE UPDATE ON procurements_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_accounts_updated_at BEFORE UPDATE ON transactions_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transaction_balance_days_updated_at BEFORE UPDATE ON transaction_balance_days FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transaction_balance_months_updated_at BEFORE UPDATE ON transaction_balance_months FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_days_updated_at BEFORE UPDATE ON dashboard_days FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_months_updated_at BEFORE UPDATE ON dashboard_months FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, username, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), 
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function: Generate order code
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT := 'ORD';
    year_part TEXT := to_char(now(), 'YY');
    sequence_num INTEGER;
    new_code TEXT;
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 8) AS INTEGER)), 0) + 1
        INTO sequence_num
        FROM orders
        WHERE code LIKE prefix || '-' || year_part || '-%';
        
        new_code := prefix || '-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
        NEW.code := new_code;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate order code
CREATE TRIGGER generate_order_code_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_code();

-- Function: Update product stock on order
CREATE OR REPLACE FUNCTION update_product_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Decrease stock when order product is added
        UPDATE product_unit_quantities
        SET quantity = quantity - NEW.quantity
        WHERE product_id = NEW.product_id AND unit_id = NEW.unit_id;
        
        -- Record history
        INSERT INTO products_history (
            product_id, order_id, order_product_id, operation_type,
            unit_id, before_quantity, quantity, after_quantity,
            unit_price, total_price, author
        )
        SELECT 
            NEW.product_id, NEW.order_id, NEW.id, 'sale',
            NEW.unit_id, 
            puq.quantity + NEW.quantity,
            NEW.quantity,
            puq.quantity,
            NEW.unit_price, NEW.total_price, NEW.author
        FROM product_unit_quantities puq
        WHERE puq.product_id = NEW.product_id AND puq.unit_id = NEW.unit_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update stock on order product insert
CREATE TRIGGER update_stock_on_order_product
    AFTER INSERT ON orders_products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock_on_order();

-- Function: Update customer account on order
CREATE OR REPLACE FUNCTION update_customer_on_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_id IS NOT NULL THEN
        -- Update customer purchases amount
        UPDATE customers
        SET purchases_amount = purchases_amount + NEW.total
        WHERE id = NEW.customer_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update customer on order
CREATE TRIGGER update_customer_on_order_trigger
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_on_order();

-- Function: Update register balance on payment
CREATE OR REPLACE FUNCTION update_register_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_register_id UUID;
BEGIN
    -- Get register from order
    SELECT register_id INTO v_register_id FROM orders WHERE id = NEW.order_id;
    
    IF v_register_id IS NOT NULL THEN
        -- Update register balance
        UPDATE registers
        SET balance = balance + NEW.value
        WHERE id = v_register_id;
        
        -- Record register history
        INSERT INTO registers_history (
            register_id, action, transaction_type, value,
            balance_before, balance_after, order_id, payment_id,
            payment_type_id, author
        )
        SELECT 
            v_register_id, 'sale', 'positive', NEW.value,
            r.balance - NEW.value, r.balance, NEW.order_id, NEW.id,
            NEW.payment_type_id, NEW.author
        FROM registers r
        WHERE r.id = v_register_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update register on payment
CREATE TRIGGER update_register_on_payment_trigger
    AFTER INSERT ON orders_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_register_on_payment();

-- Function: Update category item count
CREATE OR REPLACE FUNCTION update_category_item_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE product_categories
        SET total_items = total_items + 1
        WHERE id = NEW.category_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE product_categories
        SET total_items = total_items - 1
        WHERE id = OLD.category_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.category_id IS DISTINCT FROM NEW.category_id THEN
        UPDATE product_categories
        SET total_items = total_items - 1
        WHERE id = OLD.category_id;
        UPDATE product_categories
        SET total_items = total_items + 1
        WHERE id = NEW.category_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update category count on product change
CREATE TRIGGER update_category_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_category_item_count();
