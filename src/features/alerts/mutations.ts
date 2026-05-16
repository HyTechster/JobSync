import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import type { CreateAlertFormData } from './alertSchema'

function invalidateAlerts(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: ['alerts'] })
  void qc.invalidateQueries({ queryKey: ['unread-alert-counts'] })
  void qc.invalidateQueries({ queryKey: ['users'] })
}

export function useCreateAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateAlertFormData) => {
      const createdBy = useAuthStore.getState().profile?.id
      if (!createdBy) throw new Error('Not authenticated')

      const { data: alert, error } = await supabase
        .from('alerts')
        .insert({ title: data.title, message: data.message, created_by: createdBy })
        .select()
        .single()
      if (error) throw error

      const { error: re } = await supabase.from('alert_recipients').insert(
        data.recipient_ids.map((rid) => ({ alert_id: alert.id, recipient_id: rid }))
      )
      if (re) throw re
    },
    onSuccess: () => invalidateAlerts(qc),
  })
}

export function useDeleteAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('alerts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateAlerts(qc),
  })
}
