import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

interface UserWithRole extends User {
  role?: string;
}

export function useUser() {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          setUser({ ...session.user, role: profile?.role })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    // Initial fetch
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        setUser({ ...session.user, role: profile?.role })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}