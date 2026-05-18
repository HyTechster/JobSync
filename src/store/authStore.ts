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
  broadcastForcedSignout: (deviceInfo: string) => Promise<void>
  initAuth: () => () => void
}

// Module-level refs so broadcastForcedSignout can reuse the already-subscribed
// channel without creating a duplicate that stalls.
let _forceSignoutChannel: ReturnType<typeof supabase.channel> | null = null
let _channelReady = false

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

  broadcastForcedSignout: async (deviceInfo: string) => {
    const ch = _forceSignoutChannel
    if (!ch) return

    // Wait up to 4 s for the channel to reach SUBSCRIBED state before sending.
    if (!_channelReady) {
      await new Promise<void>((resolve) => {
        const deadline = setTimeout(resolve, 4000)
        const poll = setInterval(() => {
          if (_channelReady) { clearInterval(poll); clearTimeout(deadline); resolve() }
        }, 100)
      })
    }

    await ch.send({ type: 'broadcast', event: 'sign_out', payload: { device_info: deviceInfo } })
  },

  initAuth: () => {
    function subscribeForceSignout(userId: string) {
      if (_forceSignoutChannel) void supabase.removeChannel(_forceSignoutChannel)
      _channelReady = false
      _forceSignoutChannel = supabase
        .channel(`forced-signout:${userId}`)
        .on('broadcast', { event: 'sign_out' }, () => {
          // Must be async so we can await signOut({ scope:'local' }).
          // That call stops the autoRefreshToken timer BEFORE clearing storage —
          // preventing the timer from writing a fresh token back after we wipe it.
          void (async () => {
            await supabase.auth.signOut({ scope: 'local' })
            localStorage.removeItem('jobsync_active_org')
            queryClient.clear()
            window.location.replace('/login')
          })()
        })
        .subscribe((status) => {
          _channelReady = status === 'SUBSCRIBED'
        })
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
          if (_forceSignoutChannel) {
            void supabase.removeChannel(_forceSignoutChannel)
            _forceSignoutChannel = null
            _channelReady = false
          }
          set({ profile: null })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      if (_forceSignoutChannel) void supabase.removeChannel(_forceSignoutChannel)
      _channelReady = false
    }
  },
}))

// Call initAuth at module load so it re-executes on every HMR cycle.
const unsubAuth = useAuthStore.getState().initAuth()
if (import.meta.hot) {
  import.meta.hot.dispose(unsubAuth)
}
