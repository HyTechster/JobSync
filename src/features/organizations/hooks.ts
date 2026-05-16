import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export function useCreateOrganization() {
  const qc = useQueryClient()
  const userId = useAuthStore((s) => s.profile?.id)

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!userId) throw new Error('Not authenticated.')

      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: name.trim(), owner_id: userId })
        .select()
        .single()
      if (orgError) throw orgError

      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: userId,
          role: 'admin',
          added_by: userId,
        })
      if (memberError) throw memberError

      return org
    },

    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org-memberships'] })
    },
  })
}
