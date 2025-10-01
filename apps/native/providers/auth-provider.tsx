import { supabase } from '@/lib/utils/supabase/client'
import type { Session } from '@supabase/supabase-js'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import { AuthContext } from '@/hooks/use-auth-context'

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        
        if (isMounted) {
          setSession(session)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      if (isMounted) {
        setSession(session)
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Hide splash screen once auth state is determined
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch((error) => {
        console.warn('Error hiding splash screen:', error)
      })
    }
  }, [isLoading])

  const value = {
    session,
    profile: session?.user || null,
    isLoading,
    isLoggedIn: !!session,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
