import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = 'https://higfoctduijxbszgqhuc.supabase.co'
const supabaseAnonKey = 'sb_publishable_8755edjLg2ePkQ4GSgVgHg_6_JrziI-'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
})

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
