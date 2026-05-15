import Dexie, { type Table } from 'dexie'

export interface OfflineJobSheet {
  id?: number
  localId: string
  jobOrderId: string
  technicianId: string
  workPerformed: string
  timeSpentMinutes: number
  notes?: string
  attachmentPaths?: string[]
  createdAt: string
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed'
}

class JobSyncOfflineDB extends Dexie {
  jobSheets!: Table<OfflineJobSheet>

  constructor() {
    super('jobsync-offline')
    this.version(1).stores({
      jobSheets: '++id, localId, jobOrderId, syncStatus',
    })
  }
}

export const offlineDb = new JobSyncOfflineDB()
