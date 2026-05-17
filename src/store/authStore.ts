import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '../types'
import { supabase } from '../lib/supabase'

interface AuthState {
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  setSession: (session: Session | null, profile: Profile | null) => void
  setProfile: (profile: Profile | null) => void
  clearSession: () => void
  initAuth: () => () => void
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data ?? null
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  isLoading: true,

  setSession: (session, profile) => set({ session, profile }),

  setProfile: (profile) => set({ profile }),

  clearSession: () => set({ session: null, profile: null, isLoading: false }),

  initAuth: () => {
    // Resolve isLoading the instant we know the session — no network call needed.
    // getSession() reads from the in-memory/localStorage cache synchronously.
    // We do NOT wait for the profile fetch to unblock routing.
    void supabase.auth.getSession().then(({ data: { session } }) => {
      // Unblock the loading gate immediately
      set({ session, isLoading: false })

      // Then load the profile in the background without blocking
      if (session) {
        void fetchProfile(session.user.id).then((profile) => {
          // Only update if the session hasn't changed while we were fetching
          if (get().session?.user.id === session.user.id) {
            set({ profile })
          }
        })
      }
    })

    // Listen for ongoing auth events (sign-in, sign-out, token refresh).
    // Skip INITIAL_SESSION — the getSession() call above handles that.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'INITIAL_SESSION') return
        set({ session, isLoading: false })

        if (session) {
          void fetchProfile(session.user.id).then((profile) => {
            if (get().session?.user.id === session.user.id) {
              set({ profile })
            }
          })
        } else {
          set({ profile: null })
        }
      }
    )

    return () => subscription.unsubscribe()
  },
}))

// Call initAuth at module load so it re-executes on every HMR cycle.
const unsubAuth = useAuthStore.getState().initAuth()
if (import.meta.hot) {
  import.meta.hot.dispose(unsubAuth)
}
