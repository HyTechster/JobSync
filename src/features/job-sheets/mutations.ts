import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import type { JobSheetFormData } from './jobSheetSchema'

interface SubmitJobSheetParams {
  jobOrderId: string
  form: JobSheetFormData
  photos: File[]
}

export function useSubmitJobSheet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ jobOrderId, form, photos }: SubmitJobSheetParams) => {
      const technicianId = useAuthStore.getState().profile?.id
      if (!technicianId) throw new Error('Not authenticated')

      const { data: sheet, error: se } = await supabase
        .from('job_sheets')
        .insert({
          job_order_id: jobOrderId,
          technician_id: technicianId,
          work_performed: form.work_performed,
          time_spent_minutes: form.time_spent_minutes,
          notes: form.notes ?? null,
        })
        .select()
        .single()
      if (se) throw se

      if (photos.length > 0) {
        const uploads = photos.map(async (file) => {
          const ext = file.name.split('.').pop() ?? 'jpg'
          const uniqueName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
          const path = `${jobOrderId}/${sheet.id}/${uniqueName}`

          const { error: ue } = await supabase.storage
            .from('job-attachments')
            .upload(path, file, { contentType: file.type })
          if (ue) throw ue

          const { error: ae } = await supabase.from('attachments').insert({
            job_sheet_id: sheet.id,
            storage_path: path,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
          })
          if (ae) throw ae
        })
        await Promise.all(uploads)
      }

      return sheet
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['job-sheets'] })
      void qc.invalidateQueries({ queryKey: ['my-jobs'] })
    },
  })
}
