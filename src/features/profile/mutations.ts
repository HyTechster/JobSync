import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import type { Profile } from '../../types'

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ full_name, phone }: { full_name: string; phone: string | null }) => {
      const userId = useAuthStore.getState().profile?.id
      if (!userId) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('profiles')
        .update({ full_name, phone })
        .eq('id', userId)
        .select()
        .single()
      if (error) throw error
      return data as Profile
    },
    onSuccess: (updated) => {
      const { session, setSession } = useAuthStore.getState()
      if (session) setSession(session, updated)
      void qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
