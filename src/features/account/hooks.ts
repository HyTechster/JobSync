import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import type { Profile } from '../../types'

export interface UserPreferences {
  date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  notify_new_signin: boolean
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  date_format: 'DD/MM/YYYY',
  notify_new_signin: true,
}

export function parsePreferences(raw: unknown): UserPreferences {
  const p = (raw ?? {}) as Partial<UserPreferences>
  return {
    date_format: p.date_format ?? DEFAULT_PREFERENCES.date_format,
    notify_new_signin: p.notify_new_signin ?? DEFAULT_PREFERENCES.notify_new_signin,
  }
}

export function useUpdateProfile() {
  const session = useAuthStore((s) => s.session)
  const setProfile = useAuthStore((s) => s.setProfile)

  return useMutation({
    mutationFn: async (data: Partial<Pick<Profile, 'full_name' | 'display_name' | 'gender' | 'country' | 'phone'>>) => {
      if (!session?.user.id) throw new Error('Not authenticated')
      const { data: updated, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', session.user.id)
        .select()
        .single()
      if (error) throw error
      return updated as Profile
    },
    onSuccess: (updated) => setProfile(updated),
  })
}

export function useUpdatePreferences() {
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const setProfile = useAuthStore((s) => s.setProfile)

  return useMutation({
    mutationFn: async (prefs: Partial<UserPreferences>) => {
      if (!session?.user.id) throw new Error('Not authenticated')
      const current = parsePreferences(profile?.preferences)
      const merged = { ...current, ...prefs }
      const { data: updated, error } = await supabase
        .from('profiles')
        .update({ preferences: merged })
        .eq('id', session.user.id)
        .select()
        .single()
      if (error) throw error
      return updated as Profile
    },
    onSuccess: (updated) => setProfile(updated),
  })
}

export function useChangePassword() {
  const session = useAuthStore((s) => s.session)

  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: session!.user.email!,
        password: currentPassword,
      })
      if (reAuthError) throw new Error('Current password is incorrect')
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
    },
  })
}

export function useLinkedEmails() {
  const session = useAuthStore((s) => s.session)
  return useQuery({
    queryKey: ['linked-emails', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('linked_emails')
        .select('*')
        .eq('user_id', session!.user.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!session?.user.id,
  })
}

export function useAddLinkedEmail() {
  const queryClient = useQueryClient()
  const session = useAuthStore((s) => s.session)

  return useMutation({
    mutationFn: async ({ email, label }: { email: string; label?: string }) => {
      const { error } = await supabase
        .from('linked_emails')
        .insert({ user_id: session!.user.id, email, label: label || null })
      if (error) {
        if (error.code === '23505') throw new Error('This email is already linked to your account')
        throw error
      }
    },
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['linked-emails'] }) },
  })
}

export function useRemoveLinkedEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('linked_emails').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['linked-emails'] }) },
  })
}
