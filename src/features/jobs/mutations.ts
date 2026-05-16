import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import type { JobOrderFormData } from './jobSchema'

function invalidateDashboard(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: ['jobs'] })
  void qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
  void qc.invalidateQueries({ queryKey: ['recent-jobs'] })
}

export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (form: JobOrderFormData) => {
      const { technician_ids, ...jobData } = form
      const createdBy = useAuthStore.getState().profile?.id
      if (!createdBy) throw new Error('Not authenticated')

      const { data: job, error } = await supabase
        .from('job_orders')
        .insert({ ...jobData, created_by: createdBy })
        .select()
        .single()
      if (error) throw error

      if (technician_ids.length > 0) {
        const { error: ae } = await supabase.from('job_assignments').insert(
          technician_ids.map((tid) => ({ job_order_id: job.id, technician_id: tid }))
        )
        if (ae) throw ae
      }
      return job
    },
    onSuccess: () => invalidateDashboard(qc),
  })
}

export function useUpdateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, form }: { id: string; form: JobOrderFormData }) => {
      const { technician_ids, ...jobData } = form

      const { error } = await supabase.from('job_orders').update(jobData).eq('id', id)
      if (error) throw error

      const { error: de } = await supabase
        .from('job_assignments')
        .delete()
        .eq('job_order_id', id)
      if (de) throw de

      if (technician_ids.length > 0) {
        const { error: ae } = await supabase.from('job_assignments').insert(
          technician_ids.map((tid) => ({ job_order_id: id, technician_id: tid }))
        )
        if (ae) throw ae
      }
    },
    onSuccess: () => invalidateDashboard(qc),
  })
}

export function useDeleteJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('job_orders').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateDashboard(qc),
  })
}
