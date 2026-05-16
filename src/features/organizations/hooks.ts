import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Organization } from '../../types'

export function useCreateOrganization() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const { data, error } = await supabase.rpc('create_organization', {
        org_name: name.trim(),
      })
      if (error) throw new Error(error.message)
      return data as unknown as Organization
    },

    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org-memberships'] })
    },
  })
}
