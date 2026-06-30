import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { queryClient } from '../../lib/queryClient'
import { useAuthStore } from '../../store/authStore'
import type { Profile } from '../../types'
import { getDeviceInfo } from './deviceInfo'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const signUpSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof signUpSchema>

type SignUpResult =
  | { needsEmailConfirmation: true }
  | { needsEmailConfirmation: false; session: Session; profile: Profile }

export function useAuth() {
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const isLoading = useAuthStore((s) => s.isLoading)
  return { session, profile, isLoading }
}

export function useGoogleLogin() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    },
  })
}

export function useLogin() {
  const { setSession, setNewDeviceAlert } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ email, password }: LoginFormData) => {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) throw authError

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      if (profileError) throw profileError

      if (!profile.is_active) {
        await supabase.auth.signOut()
        throw new Error('Your account has been deactivated. Contact your administrator.')
      }

      const { data: memberships } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', authData.user.id)
        .order('joined_at', { ascending: true })

      // Record sign-in and detect new device (best-effort — don't block login on failure)
      let isNewDevice = false
      try {
        type RpcFn = (fn: string, args: Record<string, string>) => Promise<{ data: boolean | null }>
        const { data: newDevice } = await (supabase.rpc as unknown as RpcFn)(
          'record_sign_in', { p_device_info: getDeviceInfo() }
        )
        isNewDevice = newDevice === true
      } catch { /* ignore — login still succeeds */ }

      return { session: authData.session, profile, memberships: memberships ?? [], isNewDevice }
    },

    onSuccess: ({ session, profile, isNewDevice }) => {
      setSession(session, profile)
      if (isNewDevice) setNewDeviceAlert(true)
      navigate('/dashboard/select-organization')
    },
  })
}

export function useSignUp() {
  const { setSession } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({
      fullName,
      email,
      password,
    }: SignUpFormData): Promise<SignUpResult> => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (authError) throw authError

      if (!authData.session || !authData.user) {
        return { needsEmailConfirmation: true }
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      if (profileError) throw profileError

      return { needsEmailConfirmation: false, session: authData.session, profile }
    },

    onSuccess: (result) => {
      if (result.needsEmailConfirmation) return
      setSession(result.session, result.profile)
      navigate('/dashboard/additional-info')
    },
  })
}

export function useLogout() {
  const { clearSession } = useAuthStore()
  const navigate = useNavigate()

  return () => {
    // Capture before clearing state
    const userId = useAuthStore.getState().session?.user.id
    const deviceInfo = getDeviceInfo()

    // Clear local state and navigate immediately — don't block on network
    clearSession()
    localStorage.removeItem('jobsync_active_org')
    queryClient.clear()
    navigate('/login', { replace: true })

    // Mark this device inactive FIRST (still has valid JWT), then sign out.
    // Sequential inside a void IIFE so the update wins the race against signOut.
    void (async () => {
      if (userId) {
        await supabase
          .from('login_history' as never)
          .update({ is_active: false } as never)
          .eq('user_id' as never, userId)
          .eq('device_info' as never, deviceInfo)
      }
      await supabase.auth.signOut()
    })()
  }
}

export function useLogoutAll() {
  const { clearSession } = useAuthStore()
  const navigate = useNavigate()

  return async () => {
    const userId = useAuthStore.getState().session?.user.id

    // Mark ALL sessions inactive before signOut so the JWT is still valid
    if (userId) {
      await supabase
        .from('login_history' as never)
        .update({ is_active: false } as never)
        .eq('user_id' as never, userId)
    }

    clearSession()
    localStorage.removeItem('jobsync_active_org')
    queryClient.clear()
    void supabase.auth.signOut({ scope: 'global' })
    navigate('/login', { replace: true })
  }
}
