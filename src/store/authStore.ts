import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import type { Profile, UserRole } from '../types'

interface AuthState {
  session: Session | null
  profile: Profile | null
  role: UserRole | null
  setSession: (session: Session | null, profile: Profile | null) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  role: null,
  setSession: (session, profile) =>
    set({ session, profile, role: profile?.role ?? null }),
  clearSession: () => set({ session: null, profile: null, role: null }),
}))
