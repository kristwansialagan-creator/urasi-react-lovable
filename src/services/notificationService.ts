import { supabase } from "@/integrations/supabase/client";

export const NotificationTypes = {
  // Stock & Inventory
  LOW_STOCK: 'warning',
  OUT_OF_STOCK: 'error',
  EXPIRING_SOON: 'warning',
  EXPIRED: 'error',
  
  // Orders & Payments
  INSTALLMENT_DUE: 'warning',
  INSTALLMENT_OVERDUE: 'error',
  NEW_ORDER: 'success',
  ORDER_REFUND: 'info',
  
  // Register & Cash
  REGISTER_OPENED: 'info',
  REGISTER_CLOSED: 'info',
  CASH_ALERT: 'warning',
  
  // Security & Auth
  LOGIN_SUCCESS: 'info',
  LOGIN_NEW_DEVICE: 'warning',
  PASSWORD_CHANGED: 'info',
  
  // System
  SYSTEM_ALERT: 'warning',
  BACKUP_REMINDER: 'info'
} as const;

export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes];

interface CreateNotificationParams {
  userId: string;
  title: string;
  description?: string;
  type?: string;
  url?: string;
  source?: string;
  entityType?: string;
  entityId?: string;
  identifier?: string;  // For deduplication
}

export async function createSystemNotification(params: CreateNotificationParams) {
  try {
    // Check for duplicate (prevent spam) - use identifier for deduplication
    if (params.identifier) {
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', params.userId)
        .eq('identifier', params.identifier)
        .maybeSingle();
      
      if (existing) {
        return existing;
      }
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        title: params.title,
        description: params.description,
        type: params.type || 'info',
        url: params.url,
        source: params.source || 'system',
        entity_type: params.entityType,
        entity_id: params.entityId,
        identifier: params.identifier,
        read: false
      } as any)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }
      
    return data;
  } catch (err) {
    console.error('Error in createSystemNotification:', err);
    return null;
  }
}

// Helper to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Helper to get browser info
export function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  let browser = 'Unknown Browser';
  
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
  } else if (ua.includes('Opera') || ua.includes('OPR')) {
    browser = 'Opera';
  }
  
  return browser;
}

// Batch create notifications for multiple users
export async function createBulkNotifications(notifications: CreateNotificationParams[]) {
  const results = await Promise.all(
    notifications.map(n => createSystemNotification(n))
  );
  return results.filter(Boolean);
}
