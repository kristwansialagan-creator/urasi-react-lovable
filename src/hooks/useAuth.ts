import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error('Initial session fetch error:', error)
                if (error.message.includes('Refresh Token Not Found')) {
                    supabase.auth.signOut()
                    setSession(null)
                    setUser(null)
                    setLoading(false)
                    return
                }
            }
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        }).catch(err => {
            console.error('Unexpected session fetch error:', err)
            setLoading(false)
        })

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if ((_event as string) === 'TOKEN_REFRESH_FAILED') {
                supabase.auth.signOut()
                setSession(null)
                setUser(null)
                setLoading(false)
                return
            }
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signOut = () => supabase.auth.signOut()

    return { user, session, loading, signOut }
}
