import { offlineDb } from './db'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { computeTimeSpent } from '../features/job-sheets/fullSheetSchema'
import type { FullSheetFormData } from '../features/job-sheets/fullSheetSchema'

export async function syncPendingJobSheets(): Promise<void> {
  const pending = await offlineDb.jobSheets
    .where('syncStatus')
    .equals('pending')
    .toArray()

  for (const sheet of pending) {
    await offlineDb.jobSheets.update(sheet.id!, { syncStatus: 'syncing' })

    try {
      const { data: inserted, error: se } = await supabase
        .from('job_sheets')
        .insert({
          job_order_id: sheet.jobOrderId,
          technician_id: sheet.technicianId,
          work_performed: sheet.workPerformed,
          time_spent_minutes: sheet.timeSpentMinutes,
          notes: sheet.notes ?? null,
        })
        .select()
        .single()
      if (se) throw se

      const offlineAttachments = await offlineDb.attachments
        .where('sheetLocalId')
        .equals(sheet.localId)
        .toArray()

      for (const att of offlineAttachments) {
        const ext = att.fileName.split('.').pop() ?? 'jpg'
        const uniqueName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
        const path = `${sheet.jobOrderId}/${inserted.id}/${uniqueName}`

        const { error: ue } = await supabase.storage
          .from('job-attachments')
          .upload(path, att.data, { contentType: att.mimeType })
        if (ue) throw ue

        const { error: ae } = await supabase.from('attachments').insert({
          job_sheet_id: inserted.id,
          storage_path: path,
          file_name: att.fileName,
          file_size: att.size,
          mime_type: att.mimeType,
        })
        if (ae) throw ae
      }

      await offlineDb.jobSheets.update(sheet.id!, { syncStatus: 'synced' })
      await offlineDb.attachments.where('sheetLocalId').equals(sheet.localId).delete()
    } catch {
      await offlineDb.jobSheets.update(sheet.id!, { syncStatus: 'failed' })
    }
  }
}

// ── Helpers shared with the full-sheet sync ───────────────────────────────────

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

async function uploadBlob(blob: Blob, folder: string, sheetId: string): Promise<void> {
  const ext = blob.type.split('/')[1] ?? 'jpg'
  const uniqueName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
  const path = `${folder}/${uniqueName}`
  const { error: ue } = await supabase.storage
    .from('job-attachments')
    .upload(path, blob, { contentType: blob.type })
  if (ue) throw ue
  const { error: ae } = await supabase.from('attachments').insert({
    job_sheet_id: sheetId,
    storage_path: path,
    file_name: uniqueName,
    file_size: blob.size,
    mime_type: blob.type,
  })
  if (ae) throw ae
}

// ── Sync full sheets queued while offline ─────────────────────────────────────

export async function syncPendingFullSheets(): Promise<void> {
  const userId = useAuthStore.getState().session?.user.id
  if (!userId) return

  const pending = await offlineDb.pendingFullSheets
    .where('syncStatus')
    .equals('pending')
    .toArray()

  for (const record of pending) {
    await offlineDb.pendingFullSheets.update(record.id!, { syncStatus: 'syncing' })
    try {
      const form = JSON.parse(record.formDataJson) as FullSheetFormData

      let sheetNumber: number | null = null
      if (record.orgId) {
        const { data, error } = await supabase.rpc('claim_sheet_number', { p_org_id: record.orgId })
        if (error) throw error
        sheetNumber = data as number
      }

      const timeSpent = computeTimeSpent(form.time_in, form.time_out)

      const { data: sheet, error: se } = await supabase
        .from('job_sheets')
        .insert({
          job_order_id:    record.jobOrderId,
          organization_id: record.orgId,
          technician_id:   userId,
          sheet_number:    sheetNumber,
          job_title:       form.job_title,
          customer_name:   form.customer_name,
          customer_phone:  form.customer_phone ?? null,
          customer_email:  form.customer_email || null,
          job_location:    form.job_location ?? null,
          job_description: form.job_description ?? null,
          job_type:        form.job_type ?? null,
          job_date:        form.job_date || null,
          time_in:         form.time_in || null,
          time_out:        form.time_out || null,
          work_performed:  form.work_performed,
          service_description: form.service_description ?? null,
          total_amount:    form.total_amount ? parseFloat(form.total_amount) : null,
          additional_technician_names: record.additionalTechnicianNames.length > 0
            ? record.additionalTechnicianNames
            : null,
          time_spent_minutes: timeSpent,
          notes: null,
        } as never)
        .select()
        .single()
      if (se) throw se

      const prefix = record.jobOrderId ?? 'standalone'

      const [custSigUrl, techSigUrl] = await Promise.all([
        record.customerSigDataUrl
          ? uploadSignature(prefix, sheet.id, 'customer', record.customerSigDataUrl)
          : Promise.resolve(null),
        record.technicianSigDataUrl
          ? uploadSignature(prefix, sheet.id, 'technician', record.technicianSigDataUrl)
          : Promise.resolve(null),
      ])

      await Promise.all([
        ...(custSigUrl || techSigUrl
          ? [supabase
              .from('job_sheets')
              .update({
                customer_signature_url:   custSigUrl,
                technician_signature_url: techSigUrl,
              } as never)
              .eq('id', sheet.id)
              .then(({ error }) => { if (error) throw error })]
          : []),
        ...record.jobPhotos.map((b) =>
          uploadBlob(b, `${prefix}/${sheet.id}/photos`, sheet.id)
        ),
        ...record.paymentPhotos.map((b) =>
          uploadBlob(b, `${prefix}/${sheet.id}/payment`, sheet.id)
        ),
      ])

      if (record.jobOrderId) {
        const { error: ce } = await supabase
          .from('job_orders')
          .update({ status: 'completed' })
          .eq('id', record.jobOrderId)
        if (ce) throw ce
      }

      await offlineDb.pendingFullSheets.delete(record.id!)
    } catch {
      await offlineDb.pendingFullSheets.update(record.id!, { syncStatus: 'failed' })
    }
  }
}
