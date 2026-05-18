import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import type { JobSheetFormData } from './jobSheetSchema'
import type { FullSheetFormData } from './fullSheetSchema'
import { computeTimeSpent } from './fullSheetSchema'

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

// ── Full sheet submission ────────────────────────────────────────────────────

export interface SubmitFullSheetParams {
  orgId: string | null
  jobOrderId: string | null
  form: FullSheetFormData
  additionalTechnicianNames: string[]
  jobPhotos: File[]
  paymentPhotos: File[]
  customerSignatureDataUrl: string | null
  technicianSignatureDataUrl: string | null
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, encoded] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png'
  const binary = atob(encoded)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

async function uploadSignature(
  prefix: string,
  sheetId: string,
  type: 'customer' | 'technician',
  dataUrl: string,
): Promise<string> {
  const blob = dataUrlToBlob(dataUrl)
  const path = `signatures/${prefix}/${sheetId}/${type}.png`
  const { error } = await supabase.storage
    .from('job-attachments')
    .upload(path, blob, { contentType: 'image/png', upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('job-attachments').getPublicUrl(path)
  return data.publicUrl
}

async function uploadAttachment(file: File, folder: string, sheetId: string): Promise<void> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const uniqueName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
  const path = `${folder}/${uniqueName}`
  const { error: ue } = await supabase.storage
    .from('job-attachments')
    .upload(path, file, { contentType: file.type })
  if (ue) throw ue
  const { error: ae } = await supabase.from('attachments').insert({
    job_sheet_id: sheetId,
    storage_path: path,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
  })
  if (ae) throw ae
}

export function useSubmitFullSheet() {
  const qc = useQueryClient()
  const userId = useAuthStore((s) => s.session?.user.id)

  return useMutation({
    mutationFn: async (params: SubmitFullSheetParams) => {
      if (!userId) throw new Error('Not authenticated')
      const {
        orgId, jobOrderId, form, additionalTechnicianNames,
        jobPhotos, paymentPhotos, customerSignatureDataUrl, technicianSignatureDataUrl,
      } = params

      // 1. Claim sheet number if org is set
      let sheetNumber: number | null = null
      if (orgId) {
        const { data, error } = await supabase.rpc('claim_sheet_number', { p_org_id: orgId })
        if (error) throw error
        sheetNumber = data as number
      }

      // 2. Insert sheet row
      const timeSpent = computeTimeSpent(form.time_in, form.time_out)
      const { data: sheet, error: se } = await supabase
        .from('job_sheets')
        .insert({
          job_order_id:     jobOrderId,
          organization_id:  orgId,
          technician_id:    userId,
          sheet_number:     sheetNumber,
          job_title:        form.job_title,
          customer_name:    form.customer_name,
          customer_phone:   form.customer_phone ?? null,
          customer_email:   form.customer_email || null,
          job_location:     form.job_location ?? null,
          job_description:  form.job_description ?? null,
          job_type:         form.job_type ?? null,
          job_date:         form.job_date || null,
          time_in:          form.time_in || null,
          time_out:         form.time_out || null,
          work_performed:   form.work_performed,
          service_description: form.service_description ?? null,
          total_amount:     form.total_amount ? parseFloat(form.total_amount) : null,
          additional_technician_names: additionalTechnicianNames.filter(Boolean).length > 0
            ? additionalTechnicianNames.filter(Boolean)
            : null,
          time_spent_minutes: timeSpent,
          notes: null,
        } as never)
        .select()
        .single()
      if (se) throw se

      const prefix = jobOrderId ?? 'standalone'

      // 3. Upload signatures and photos concurrently
      const [custSigUrl, techSigUrl] = await Promise.all([
        customerSignatureDataUrl
          ? uploadSignature(prefix, sheet.id, 'customer', customerSignatureDataUrl)
          : Promise.resolve(null),
        technicianSignatureDataUrl
          ? uploadSignature(prefix, sheet.id, 'technician', technicianSignatureDataUrl)
          : Promise.resolve(null),
      ])

      const photoUploads = [
        ...jobPhotos.map((f) => uploadAttachment(f, `${prefix}/${sheet.id}/photos`, sheet.id)),
        ...paymentPhotos.map((f) => uploadAttachment(f, `${prefix}/${sheet.id}/payment`, sheet.id)),
      ]

      await Promise.all([
        ...(custSigUrl || techSigUrl
          ? [supabase
              .from('job_sheets')
              .update({
                customer_signature_url:    custSigUrl,
                technician_signature_url:  techSigUrl,
              })
              .eq('id', sheet.id)
              .then(({ error }) => { if (error) throw error }),
            ]
          : []),
        ...photoUploads,
      ])

      return sheet
    },
    onSuccess: (_data, vars) => {
      if (vars.orgId) void qc.invalidateQueries({ queryKey: ['job-sheets', 'mine', vars.orgId] })
      void qc.invalidateQueries({ queryKey: ['job-sheets'] })
      void qc.invalidateQueries({ queryKey: ['my-jobs'] })
      if (vars.jobOrderId) void qc.invalidateQueries({ queryKey: ['job', vars.jobOrderId] })
      if (vars.orgId) void qc.invalidateQueries({ queryKey: ['next-sheet-id', vars.orgId] })
    },
  })
}
