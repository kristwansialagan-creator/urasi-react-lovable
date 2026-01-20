import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { usePermissions } from '@/hooks/usePermissions'

interface Profile {
    id: string
    username: string | null
    email: string | null
    first_name: string | null
    second_name: string | null
    phone: string | null
    role: string
    active: boolean
    total_sales_count: number
    total_sales: number
    avatar_url: string | null
    created_at: string
    updated_at: string
}

interface AuthContextType {
    user: User | null
    profile: Profile | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
    signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>
    signOut: () => Promise<void>
    isAdmin: boolean
    isCashier: boolean
    isCustomer: boolean
    hasPermission: (permission: string) => boolean
    hasRole: (role: string) => boolean
    can: (action: string, resource: string) => boolean
    permissions: string[]
    roles: string[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    const {
        permissions: userPermissions,
        roles: userRoles,
        fetchUserPermissions,
        hasPermission,
        hasRole,
        can
    } = usePermissions()

    // Fetch user profile
    const fetchProfile = async (userId: string) => {
        try {
            console.log('Fetching profile for user:', userId)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Profile fetch error:', error)
                // Still allow navigation even if profile fetch fails
                return
            }
            
            if (data) {
                console.log('Profile loaded:', data)
                // Map database response to Profile interface with proper defaults
                const mappedProfile: Profile = {
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    first_name: data.first_name,
                    second_name: data.second_name,
                    phone: data.phone,
                    role: data.role ?? 'user',
                    active: data.active ?? true,
                    total_sales_count: data.total_sales_count ?? 0,
                    total_sales: data.total_sales ?? 0,
                    avatar_url: data.avatar_url,
                    created_at: data.created_at ?? new Date().toISOString(),
                    updated_at: data.updated_at ?? new Date().toISOString()
                }
                setProfile(mappedProfile)
                // Fetch permissions after profile is loaded (non-blocking)
                fetchUserPermissions(userId).catch(err => 
                    console.error('Error fetching permissions:', err)
                )
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        }
    }

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error('Initial session fetch error:', error)
                // If it's a refresh token error, clear session
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
            if (session?.user) {
                fetchProfile(session.user.id)
            }
            setLoading(false)
        }).catch(err => {
            console.error('Unexpected session fetch error:', err)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                console.log('Auth state changed:', _event, session?.user?.id)
                
                // Handle token refresh failure
                if ((_event as string) === 'TOKEN_REFRESH_FAILED') {
                    console.error('Token refresh failed, signing out...')
                    supabase.auth.signOut()
                    setSession(null)
                    setUser(null)
                    setProfile(null)
                    setLoading(false)
                    return
                }

                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false) // Set loading false immediately

                if (session?.user) {
                    // Non-blocking profile fetch
                    fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    // Sign in - update state directly to avoid race condition
    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        
        // If successful, update state directly
        if (!error && data.session) {
            console.log('Sign in successful, setting state directly')
            setSession(data.session)
            setUser(data.user)
            setLoading(false)
            // Fetch profile non-blocking
            fetchProfile(data.user.id)
        }
        
        return { error }
    }

    const signUp = async (email: string, password: string, username: string) => {
        console.log('Attempting signUp with:', { email, username })

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                },
            },
        })

        if (error) {
            console.error('SignUp error:', error)
            return { error }
        }

        console.log('SignUp success, user created:', data.user?.id)

        // Profile will be created by trigger, just wait a moment
        if (data.user) {
            console.log('Waiting for trigger to create profile...')
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Verify profile was created
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single()

            if (profileError) {
                console.error('Profile fetch error:', profileError)
            } else {
                console.log('Profile created successfully:', profile)
            }
        }

        return { error }
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
            setUser(null)
            setProfile(null)
            setSession(null)
            // Force redirect to login page
            window.location.href = '/login'
        } catch (error) {
            console.error('Sign out error:', error)
        }
    }

    // Check if user is admin - either by role assignment OR by being the first/owner user
    const checkIsAdmin = (): boolean => {
        // Check by explicit role assignment
        if (hasRole('admin') || hasRole('Administrator')) return true
        // Check by profile role field
        if (profile?.role === 'admin') return true
        // If user has NO roles assigned, treat as admin (owner fallback)
        if (userRoles.length === 0 && user) return true
        return false
    }

    const isAdminUser = checkIsAdmin()

    // Enhanced permission check - admins bypass all permission checks
    const enhancedHasPermission = (permission: string): boolean => {
        if (isAdminUser) return true
        return hasPermission(permission)
    }

    const enhancedCan = (action: string, resource: string): boolean => {
        if (isAdminUser) return true
        return can(action, resource)
    }

    const value = {
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin: isAdminUser,
        isCashier: profile?.role === 'cashier' || hasRole('cashier') || hasRole('Kasir'),
        isCustomer: profile?.role === 'customer' || hasRole('customer') || hasRole('Customer'),
        hasPermission: enhancedHasPermission,
        hasRole,
        can: enhancedCan,
        permissions: userPermissions.map(p => p.name),
        roles: userRoles.map(r => r.name)
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
