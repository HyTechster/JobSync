import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import type { Profile, UserRole } from '../types'
import { supabase } from '../lib/supabase'

interface AuthState {
  session: Session | null
  profile: Profile | null
  role: UserRole | null
  isLoading: boolean
  setSession: (session: Session | null, profile: Profile | null) => void
  clearSession: () => void
  initAuth: () => () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  role: null,
  isLoading: true,

  setSession: (session, profile) =>
    set({ session, profile, role: profile?.role ?? null }),

  clearSession: () =>
    set({ session: null, profile: null, role: null, isLoading: false }),

  initAuth: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session) {
          set({ session: null, profile: null, role: null, isLoading: false })
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({
          session,
          profile: profile ?? null,
          role: profile?.role ?? null,
          isLoading: false,
        })
      }
    )

    return () => subscription.unsubscribe()
  },
}))
