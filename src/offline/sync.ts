import { offlineDb } from './db'
import { supabase } from '../lib/supabase'

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
