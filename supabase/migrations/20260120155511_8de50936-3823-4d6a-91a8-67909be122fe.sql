-- Add type column for categorization
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';

-- Add reference to related entity
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_id UUID;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_id, type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_identifier ON notifications(identifier);