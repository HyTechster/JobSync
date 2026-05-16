import Dexie, { type Table } from 'dexie'

export interface OfflineJobSheet {
  id?: number
  localId: string
  jobOrderId: string
  technicianId: string
  workPerformed: string
  timeSpentMinutes: number
  notes?: string
  createdAt: string
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed'
}

export interface OfflineAttachment {
  id?: number
  sheetLocalId: string
  fileName: string
  mimeType: string
  size: number
  data: Blob
}

class JobSyncOfflineDB extends Dexie {
  jobSheets!: Table<OfflineJobSheet>
  attachments!: Table<OfflineAttachment>

  constructor() {
    super('jobsync-offline')
    this.version(1).stores({
      jobSheets: '++id, localId, jobOrderId, syncStatus',
    })
    this.version(2).stores({
      jobSheets: '++id, localId, jobOrderId, syncStatus',
      attachments: '++id, sheetLocalId',
    })
  }
}

export const offlineDb = new JobSyncOfflineDB()
