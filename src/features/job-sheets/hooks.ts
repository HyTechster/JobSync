import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export type AttachmentRow = {
  id: string
  storage_path: string
  file_name: string
  file_size: number | null
  mime_type: string | null
}

export type JobSheetWithDetail = {
  id: string
  job_order_id: string
  technician_id: string
  work_performed: string
  time_spent_minutes: number
  notes: string | null
  submitted_at: string
  job_orders: { id: string; title: string; status: string; customer_name: string } | null
  profiles: { full_name: string; avatar_url: string | null } | null
  attachments: AttachmentRow[]
}

export function useJobSheets() {
  return useQuery<JobSheetWithDetail[]>({
    queryKey: ['job-sheets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_sheets')
        .select(
          '*, job_orders:job_order_id(id, title, status, customer_name), profiles:technician_id(full_name, avatar_url), attachments(id, storage_path, file_name, file_size, mime_type)'
        )
        .order('submitted_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as JobSheetWithDetail[]
    },
  })
}
