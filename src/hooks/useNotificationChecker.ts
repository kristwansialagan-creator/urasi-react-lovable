import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createSystemNotification, formatCurrency, NotificationTypes } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';

export function useNotificationChecker() {
  const { user } = useAuth();
  const hasCheckedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for overdue installments
  const checkOverdueInstallments = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: overdueList, error } = await supabase
        .from('orders_instalments')
        .select(`
          id,
          amount,
          date,
          order_id,
          author,
          orders!orders_instalments_order_id_fkey (
            code,
            customer_id,
            customers (
              first_name,
              last_name
            )
          )
        `)
        .eq('paid', false)
        .lt('date', today)
        .limit(50);
      
      if (error) {
        console.error('Error checking overdue installments:', error);
        return;
      }
      
      for (const installment of overdueList || []) {
        const order = installment.orders as any;
        const customer = order?.customers;
        const customerName = customer 
          ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() 
          : 'Unknown';
        
        await createSystemNotification({
          userId: user.id as string,
          title: 'Installment Overdue',
          description: `Order ${order?.code || 'N/A'} - ${formatCurrency(installment.amount || 0)} was due on ${new Date(installment.date).toLocaleDateString('id-ID')}. Customer: ${customerName}`,
          type: NotificationTypes.INSTALLMENT_OVERDUE,
          url: `/orders/${installment.order_id}`,
          source: 'installment',
          entityType: 'installment',
          entityId: installment.id,
          identifier: `installment_overdue_${installment.id}`
        });
      }
      
      // Check for upcoming installments (due in 3 days)
      const threeDaysLater = new Date();
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);
      const threeDaysLaterStr = threeDaysLater.toISOString().split('T')[0];
      
      const { data: upcomingList } = await supabase
        .from('orders_instalments')
        .select(`
          id,
          amount,
          date,
          order_id,
          orders!orders_instalments_order_id_fkey (
            code
          )
        `)
        .eq('paid', false)
        .gte('date', today)
        .lte('date', threeDaysLaterStr)
        .limit(50);
      
      for (const installment of upcomingList || []) {
        const order = installment.orders as any;
        const daysLeft = Math.ceil((new Date(installment.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        await createSystemNotification({
          userId: user.id as string,
          title: `Installment Due in ${daysLeft} days`,
          description: `Order ${order?.code || 'N/A'} - ${formatCurrency(installment.amount || 0)} due on ${new Date(installment.date).toLocaleDateString('id-ID')}`,
          type: NotificationTypes.INSTALLMENT_DUE,
          url: `/orders/${installment.order_id}`,
          source: 'installment',
          entityType: 'installment',
          entityId: installment.id,
          identifier: `installment_due_soon_${installment.id}`
        });
      }
    } catch (err) {
      console.error('Error in checkOverdueInstallments:', err);
    }
  }, [user?.id]);

  // Check for low stock products
  const checkLowStockProducts = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data: lowStockItems, error } = await supabase
        .from('product_unit_quantities')
        .select(`
          id,
          quantity,
          low_quantity,
          product_id,
          unit_id,
          products (
            id,
            name,
            sku
          ),
          units (
            identifier
          )
        `)
        .eq('stock_alert_enabled', true)
        .limit(100);
      
      if (error) {
        console.error('Error checking low stock:', error);
        return;
      }
      
      for (const item of lowStockItems || []) {
        // Skip if quantity is above low_quantity threshold
        if ((item.quantity || 0) > (item.low_quantity || 0)) continue;
        
        const product = item.products as any;
        const unit = item.units as any;
        const isOutOfStock = (item.quantity || 0) <= 0;
        
        await createSystemNotification({
          userId: user.id as string,
          title: isOutOfStock ? 'Product Out of Stock!' : 'Low Stock Warning',
          description: `${product?.name || 'Unknown'} (${unit?.identifier || 'pcs'}) - Only ${item.quantity || 0} left. Min: ${item.low_quantity || 0}`,
          type: isOutOfStock ? NotificationTypes.OUT_OF_STOCK : NotificationTypes.LOW_STOCK,
          url: `/products/stock-adjustment`,
          source: 'stock',
          entityType: 'product',
          entityId: item.product_id || undefined,
          identifier: `low_stock_${item.product_id}_${item.unit_id}`
        });
      }
    } catch (err) {
      console.error('Error in checkLowStockProducts:', err);
    }
  }, [user?.id]);

  // Check for expiring products
  const checkExpiringBatches = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      
      const { data: expiringBatches, error } = await supabase
        .from('stock_batches')
        .select(`
          id,
          batch_number,
          quantity,
          expiry_date,
          product_id,
          products (
            name,
            sku
          )
        `)
        .not('expiry_date', 'is', null)
        .lte('expiry_date', thirtyDaysLater.toISOString())
        .gt('quantity', 0)
        .limit(100);
      
      if (error) {
        console.error('Error checking expiring batches:', error);
        return;
      }
      
      for (const batch of expiringBatches || []) {
        const product = batch.products as any;
        const expiryDate = new Date(batch.expiry_date!);
        const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isExpired = daysLeft <= 0;
        
        await createSystemNotification({
          userId: user.id as string,
          title: isExpired ? 'Product Expired!' : `Product Expiring in ${daysLeft} days`,
          description: `${product?.name || 'Unknown'} - Batch ${batch.batch_number || 'N/A'} (${batch.quantity} units). Expires: ${expiryDate.toLocaleDateString('id-ID')}`,
          type: isExpired ? NotificationTypes.EXPIRED : NotificationTypes.EXPIRING_SOON,
          url: `/products/stock-adjustment`,
          source: 'expiry',
          entityType: 'batch',
          entityId: batch.id,
          identifier: `expiring_${batch.id}_${isExpired ? 'expired' : 'soon'}`
        });
      }
    } catch (err) {
      console.error('Error in checkExpiringBatches:', err);
    }
  }, [user?.id]);

  // Run all checks
  const runAllChecks = useCallback(async () => {
    if (!user?.id) return;
    
    console.log('Running notification checks...');
    
    await Promise.all([
      checkOverdueInstallments(),
      checkLowStockProducts(),
      checkExpiringBatches()
    ]);
    
    console.log('Notification checks completed');
  }, [user?.id, checkOverdueInstallments, checkLowStockProducts, checkExpiringBatches]);

  useEffect(() => {
    if (!user?.id) return;
    
    // Run checks on first mount (with a small delay to let the app load)
    if (!hasCheckedRef.current) {
      hasCheckedRef.current = true;
      setTimeout(() => {
        runAllChecks();
      }, 5000); // Wait 5 seconds after mount
    }
    
    // Run checks every 15 minutes
    intervalRef.current = setInterval(runAllChecks, 15 * 60 * 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user?.id, runAllChecks]);

  return { runAllChecks };
}
