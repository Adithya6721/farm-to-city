'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User as AppUser } from '@/types'
import { handleSupabaseError } from '@/lib/error-handler'

interface AuthContextType {
  user: AppUser | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: Partial<AppUser>) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<AppUser>) => Promise<{ error: Error | null }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MAX_RETRIES = 3
const RETRY_DELAY = 1000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = useCallback(async (userId: string, retryCount = 0): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // If user profile doesn't exist, try to create it from auth user
        if (error.code === 'PGRST116' && retryCount === 0) {
          // User exists in auth but not in users table - create profile
          try {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
              // Create minimal profile
              const { error: createError } = await supabase
                .from('users')
                .insert({
                  id: authUser.id,
                  email: authUser.email || '',
                  name: authUser.email?.split('@')[0] || 'User',
                  role: 'trader', // Default role
                })
              
              if (!createError) {
                // Retry fetching profile
                return fetchUserProfile(userId, retryCount + 1)
              }
            }
          } catch (createErr) {
            console.error('Failed to create user profile:', createErr)
          }
          
          console.warn('User profile not found and could not be created')
          setLoading(false)
          return
        }

        // Retry on network errors
        if (retryCount < MAX_RETRIES && (error.message.includes('network') || error.message.includes('fetch'))) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))
          return fetchUserProfile(userId, retryCount + 1)
        }

        handleSupabaseError(error, {
          showToast: false, // Don't show toast for initial load errors
          logError: true
        })
        setLoading(false)
        return
      }

      if (data) {
        // Type assertion with validation
        const userData: AppUser = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as 'farmer' | 'trader' | 'shopkeeper',
          location: data.location || undefined,
          avatar_url: data.avatar_url || undefined,
          phone: data.phone || undefined,
          bio: data.bio || undefined,
          created_at: data.created_at
        }
        setUser(userData)
      }
    } catch (error) {
      handleSupabaseError(error as Error, {
        showToast: false,
        logError: true
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return

      if (error) {
        handleSupabaseError(error, { showToast: false, logError: true })
        setLoading(false)
        return
      }

      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      setSession(session)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  const refreshUser = useCallback(async () => {
    if (session?.user) {
      await fetchUserProfile(session.user.id)
    }
  }, [session, fetchUserProfile])

  const signUp = async (email: string, password: string, userData: Partial<AppUser>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            name: userData.name || '',
            role: userData.role || 'trader',
            location: userData.location || null,
            phone: userData.phone || null,
            bio: userData.bio || null,
          })

        if (profileError) {
          handleSupabaseError(profileError, {
            defaultMessage: 'Account created but failed to create profile. Please contact support.'
          })
          // Return a generic error since profileError is PostgrestError, not AuthError
          return { error: { message: profileError.message } as AuthError }
        }

        // Refresh user profile
        await fetchUserProfile(data.user.id)
      }

      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      handleSupabaseError(authError)
      return { error: authError }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        handleSupabaseError(error, {
          defaultMessage: 'Invalid email or password.'
        })
      }

      return { error }
    } catch (error) {
      const authError = error as AuthError
      handleSupabaseError(authError)
      return { error: authError }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        handleSupabaseError(error)
      } else {
        setUser(null)
        setSession(null)
      }
    } catch (error) {
      handleSupabaseError(error as Error)
    }
  }

  const updateProfile = async (updates: Partial<AppUser>) => {
    if (!user) {
      const error = new Error('No user logged in')
      handleSupabaseError(error)
      return { error }
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        handleSupabaseError(error)
        return { error }
      }

      // Update local state
      if (updates) {
        setUser({ ...user, ...updates })
      }

      return { error: null }
    } catch (error) {
      const err = error as Error
      handleSupabaseError(err)
      return { error: err }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}



