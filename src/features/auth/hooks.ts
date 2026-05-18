import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { queryClient } from '../../lib/queryClient'
import { useAuthStore } from '../../store/authStore'
import type { Profile } from '../../types'

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

function getDeviceInfo(): string {
  const ua = navigator.userAgent
  let browser = 'Unknown browser'
  if (ua.includes('Edg'))                                         browser = 'Edge'
  else if (ua.includes('Chrome') && !ua.includes('Edg'))          browser = 'Chrome'
  else if (ua.includes('Firefox'))                                browser = 'Firefox'
  else if (ua.includes('Safari') && !ua.includes('Chrome'))       browser = 'Safari'

  let os = 'Unknown OS'
  if (ua.includes('Windows'))                                     os = 'Windows'
  else if (ua.includes('Mac') && !ua.includes('iPhone') && !ua.includes('iPad')) os = 'macOS'
  else if (ua.includes('iPhone') || ua.includes('iPad'))          os = 'iOS'
  else if (ua.includes('Android'))                                os = 'Android'
  else if (ua.includes('Linux'))                                  os = 'Linux'

  return `${browser} on ${os}`
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
        const { data: newDevice } = await (supabase.rpc as Function)('record_sign_in', {
          p_device_info: getDeviceInfo(),
        })
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
    // Clear all local state immediately — do NOT wait for the network call.
    // If the connection is dropped, awaiting signOut() blocks forever and the
    // user stays "logged in" locally. Clearing first guarantees the UI signs
    // out regardless of network health.
    clearSession()
    localStorage.removeItem('jobsync_active_org')
    queryClient.clear()  // wipe all cached queries so the next user starts fresh

    // Fire-and-forget: tell the server to invalidate the token.
    // We don't await this — failure just means the JWT stays valid on the server
    // until it naturally expires, which is acceptable.
    void supabase.auth.signOut()

    navigate('/login', { replace: true })
  }
}
