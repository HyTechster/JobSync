import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '../types'
import { supabase } from '../lib/supabase'
import { queryClient } from '../lib/queryClient'

interface AuthState {
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  newDeviceAlert: boolean
  setSession: (session: Session | null, profile: Profile | null) => void
  setProfile: (profile: Profile | null) => void
  setNewDeviceAlert: (value: boolean) => void
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
  newDeviceAlert: false,

  setSession: (session, profile) => set({ session, profile }),

  setProfile: (profile) => set({ profile }),

  setNewDeviceAlert: (value) => set({ newDeviceAlert: value }),

  clearSession: () => set({ session: null, profile: null, isLoading: false, newDeviceAlert: false }),

  initAuth: () => {
    let forceSignoutChannel: ReturnType<typeof supabase.channel> | null = null

    function subscribeForceSignout(userId: string) {
      if (forceSignoutChannel) void supabase.removeChannel(forceSignoutChannel)
      forceSignoutChannel = supabase
        .channel(`forced-signout:${userId}`)
        .on('broadcast', { event: 'sign_out' }, () => {
          // Wipe local state and redirect — the server-side refresh token is
          // already revoked by the sender's signOut({ scope: 'others' }) call.
          get().clearSession()
          localStorage.removeItem('jobsync_active_org')
          queryClient.clear()
          window.location.replace('/login')
        })
        .subscribe()
    }

    // Resolve isLoading the instant we know the session — no network call needed.
    // getSession() reads from the in-memory/localStorage cache synchronously.
    // We do NOT wait for the profile fetch to unblock routing.
    void supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, isLoading: false })
      if (session) {
        subscribeForceSignout(session.user.id)
        void fetchProfile(session.user.id).then((profile) => {
          if (get().session?.user.id === session.user.id) set({ profile })
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
          subscribeForceSignout(session.user.id)
          void fetchProfile(session.user.id).then((profile) => {
            if (get().session?.user.id === session.user.id) set({ profile })
          })
        } else {
          if (forceSignoutChannel) {
            void supabase.removeChannel(forceSignoutChannel)
            forceSignoutChannel = null
          }
          set({ profile: null })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      if (forceSignoutChannel) void supabase.removeChannel(forceSignoutChannel)
    }
  },
}))

// Call initAuth at module load so it re-executes on every HMR cycle.
const unsubAuth = useAuthStore.getState().initAuth()
if (import.meta.hot) {
  import.meta.hot.dispose(unsubAuth)
}
