import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export function useAuth() {
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const role = useAuthStore((s) => s.role)
  const isLoading = useAuthStore((s) => s.isLoading)
  return { session, profile, role, isLoading }
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

      return { session: authData.session, profile }
    },

    onSuccess: ({ session, profile }) => {
      setSession(session, profile)
      navigate(profile.role === 'admin' ? '/admin/dashboard' : '/technician/jobs')
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
