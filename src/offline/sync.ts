import { offlineDb } from './db'
import { supabase } from '../lib/supabase'

export async function syncPendingJobSheets(): Promise<void> {
  const pending = await offlineDb.jobSheets
    .where('syncStatus')
    .equals('pending')
    .toArray()

  for (const sheet of pending) {
    await offlineDb.jobSheets.update(sheet.id!, { syncStatus: 'syncing' })

    const { error } = await supabase.from('job_sheets').insert({
      job_order_id: sheet.jobOrderId,
      technician_id: sheet.technicianId,
      work_performed: sheet.workPerformed,
      time_spent_minutes: sheet.timeSpentMinutes,
      notes: sheet.notes ?? null,
    })

    if (error) {
      await offlineDb.jobSheets.update(sheet.id!, { syncStatus: 'failed' })
    } else {
      await offlineDb.jobSheets.update(sheet.id!, { syncStatus: 'synced' })
    }
  }
}
