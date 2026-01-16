// Re-export from the auto-generated client for consistency
// This maintains backward compatibility while using the correct credentials
export { supabase } from '@/integrations/supabase/client'
export type { Database } from '@/integrations/supabase/types'

import { supabase } from '@/integrations/supabase/client'

// Helper to get current user
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

// Helper to get session
export const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
}
