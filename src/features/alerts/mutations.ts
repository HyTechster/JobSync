import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import type { CreateAlertFormData } from './alertSchema'

function invalidateAlerts(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: ['alerts'] })
  void qc.invalidateQueries({ queryKey: ['unread-alert-counts'] })
  void qc.invalidateQueries({ queryKey: ['my-alerts'] })
  void qc.invalidateQueries({ queryKey: ['users'] })
}

export function useCreateAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ form, orgId }: { form: CreateAlertFormData; orgId: string }) => {
      const createdBy = useAuthStore.getState().profile?.id
      if (!createdBy) throw new Error('Not authenticated')

      const { data: alert, error } = await supabase
        .from('alerts')
        .insert({ title: form.title, message: form.message, created_by: createdBy, organization_id: orgId } as never)
        .select()
        .single()
      if (error) throw error

      const { error: re } = await supabase.from('alert_recipients').insert(
        form.recipient_ids.map((rid) => ({ alert_id: alert.id, recipient_id: rid }))
      )
      if (re) throw re

      if (form.job_order_ids.length > 0) {
        const { error: je } = await supabase.from('alert_jobs' as never).insert(
          form.job_order_ids.map((jid) => ({ alert_id: alert.id, job_order_id: jid })) as never
        )
        if (je) throw je
      }
    },
    onSuccess: () => invalidateAlerts(qc),
  })
}

export function useMarkAlertRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('alert_recipients')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['my-alerts'] })
      void qc.invalidateQueries({ queryKey: ['unread-alert-counts'] })
    },
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
