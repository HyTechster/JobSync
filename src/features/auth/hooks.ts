import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
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

export function useLogin() {
  const { setSession } = useAuthStore()
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

      return { session: authData.session, profile, memberships: memberships ?? [] }
    },

    onSuccess: ({ session, profile, memberships }) => {
      setSession(session, profile)
      navigate(memberships.length === 0 ? '/dashboard/welcome' : '/dashboard/select-organization')
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
        options: { data: { full_name: fullName } },
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
      navigate('/dashboard/welcome')
    },
  })
}

export function useLogout() {
  const { clearSession } = useAuthStore()
  const navigate = useNavigate()

  return async () => {
    await supabase.auth.signOut()
    clearSession()
    navigate('/login')
  }
}
