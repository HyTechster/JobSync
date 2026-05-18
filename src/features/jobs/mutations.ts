import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import type { JobOrderFormData } from './jobSchema'
import type { JobStatus } from '../../types'

function invalidateDashboard(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: ['jobs'] })
  void qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
  void qc.invalidateQueries({ queryKey: ['recent-jobs'] })
}

function buildJobPayload(form: JobOrderFormData) {
  const {
    technician_ids,
    scheduled_date_flexible,
    scheduled_time_flexible,
    due_date_flexible,
    billing_same_as_location,
    location_street,
    location_city,
    location_state,
    location_postcode,
    customer_email,
    job_type_other,
    billing_address,
    scheduled_date,
    scheduled_time,
    due_date,
    ...rest
  } = form

  const locationParts = [location_street, location_city, location_state, location_postcode].filter(Boolean)
  const assembledLocation = locationParts.join(', ')

  return {
    ...rest,
    location: assembledLocation,
    location_street,
    location_city:    location_city    || null,
    location_state:   location_state   || null,
    location_postcode: location_postcode || null,
    customer_email:   customer_email   || null,
    job_type_other:   form.job_type === 'other' ? (job_type_other || null) : null,
    scheduled_date:   scheduled_date_flexible ? null : (scheduled_date || null),
    scheduled_time:   scheduled_time_flexible ? null : (scheduled_time || null),
    due_date:         due_date_flexible ? null : (due_date || null),
    billing_address:  billing_same_as_location ? assembledLocation : (billing_address || null),
  }
}

export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (form: JobOrderFormData) => {
      const createdBy = useAuthStore.getState().profile?.id
      if (!createdBy) throw new Error('Not authenticated')

      const payload = buildJobPayload(form)

      const { data: job, error } = await supabase
        .from('job_orders')
        .insert({ ...payload, created_by: createdBy } as never)
        .select()
        .single()
      if (error) throw error

      const { technician_ids } = form
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
      const payload = buildJobPayload(form)

      const { error } = await supabase
        .from('job_orders')
        .update(payload as never)
        .eq('id', id)
      if (error) throw error

      const { error: de } = await supabase.from('job_assignments').delete().eq('job_order_id', id)
      if (de) throw de

      const { technician_ids } = form
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

export function useUpdateJobStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: JobStatus }) => {
      const { error } = await supabase.from('job_orders').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ['my-jobs'] })
      void qc.invalidateQueries({ queryKey: ['job', id] })
      invalidateDashboard(qc)
    },
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
