import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export function useLeaveOrganization() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ orgId, isOwner }: { orgId: string; isOwner: boolean }) => {
      if (isOwner) {
        throw new Error('Owners cannot leave. Close the organization instead.')
      }
      const userId = useAuthStore.getState().profile?.id
      if (!userId) throw new Error('Not authenticated.')

      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', orgId)
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org-memberships'] })
      void qc.invalidateQueries({ queryKey: ['org-members'] })
    },
  })
}

export function useDeleteOrganization() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ orgId }: { orgId: string }) => {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId)
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org-memberships'] })
      void qc.invalidateQueries({ queryKey: ['org-members'] })
      void qc.invalidateQueries({ queryKey: ['org-invitations'] })
    },
  })
}
