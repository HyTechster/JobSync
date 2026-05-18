import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export type AttachmentRow = {
  id: string
  storage_path: string
  file_name: string
  file_size: number | null
  mime_type: string | null
}

export type JobSheetWithDetail = {
  id: string
  job_order_id: string | null
  job_title: string | null
  organization_id: string | null
  sheet_number: number | null
  technician_id: string
  work_performed: string
  time_spent_minutes: number
  notes: string | null
  submitted_at: string
  job_orders: { id: string; title: string; status: string; customer_name: string } | null
  profiles: { full_name: string; display_name: string | null; avatar_url: string | null } | null
  attachments: AttachmentRow[]
}

const SHEET_SELECT =
  '*, job_orders:job_order_id(id, title, status, customer_name), profiles:technician_id(full_name, display_name, avatar_url), attachments(id, storage_path, file_name, file_size, mime_type)'

/** Admin view — all sheets sorted by sheet_number desc, nulls last for legacy rows */
export function useJobSheets() {
  return useQuery<JobSheetWithDetail[]>({
    queryKey: ['job-sheets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_sheets')
        .select(SHEET_SELECT)
        .order('sheet_number', { ascending: false, nullsFirst: false })
        .order('submitted_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as JobSheetWithDetail[]
    },
  })
}

/** Technician view — own sheets for the active org */
export function useMyJobSheets(orgId: string | null) {
  const userId = useAuthStore((s) => s.session?.user.id)
  return useQuery<JobSheetWithDetail[]>({
    queryKey: ['job-sheets', 'mine', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_sheets')
        .select(SHEET_SELECT)
        .eq('technician_id', userId!)
        .eq('organization_id', orgId!)
        .order('submitted_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as JobSheetWithDetail[]
    },
    enabled: !!userId && !!orgId,
  })
}

/** Peek at the next sheet number that will be issued (polls every 5 s for live display) */
export function useNextSheetId(orgId: string | null) {
  return useQuery<number>({
    queryKey: ['next-sheet-id', orgId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('peek_next_sheet_number', {
        p_org_id: orgId!,
      })
      if (error) throw error
      return data as number
    },
    enabled: !!orgId,
    refetchInterval: 5000,
    staleTime: 0,
  })
}

export interface SubmitSheetPayload {
  orgId: string
  jobTitle: string
  workPerformed: string
  timeSpentMinutes: number
  notes?: string
}

/** Submit a standalone job sheet — atomically claims a sheet number then inserts the row */
export function useSubmitStandaloneSheet() {
  const qc = useQueryClient()
  const userId = useAuthStore((s) => s.session?.user.id)

  return useMutation({
    mutationFn: async (payload: SubmitSheetPayload) => {
      const { data: claimed, error: claimErr } = await supabase.rpc('claim_sheet_number', {
        p_org_id: payload.orgId,
      })
      if (claimErr) throw claimErr

      const { data: inserted, error: insertErr } = await supabase
        .from('job_sheets')
        .insert({
          organization_id: payload.orgId,
          technician_id: userId!,
          job_order_id: null,
          job_title: payload.jobTitle,
          sheet_number: claimed as number,
          work_performed: payload.workPerformed,
          time_spent_minutes: payload.timeSpentMinutes,
          notes: payload.notes ?? null,
        })
        .select()
        .single()
      if (insertErr) throw insertErr
      return inserted
    },
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['job-sheets', 'mine', vars.orgId] })
      void qc.invalidateQueries({ queryKey: ['next-sheet-id', vars.orgId] })
    },
  })
}
