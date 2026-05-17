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

export interface DraftJobSheet {
  id?: number
  localId: string
  organizationId: string
  technicianId: string
  jobTitle: string
  workPerformed?: string
  timeSpentMinutes?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

class JobSyncOfflineDB extends Dexie {
  jobSheets!: Table<OfflineJobSheet>
  attachments!: Table<OfflineAttachment>
  draftSheets!: Table<DraftJobSheet>

  constructor() {
    super('jobsync-offline')
    this.version(1).stores({
      jobSheets: '++id, localId, jobOrderId, syncStatus',
    })
    this.version(2).stores({
      jobSheets: '++id, localId, jobOrderId, syncStatus',
      attachments: '++id, sheetLocalId',
    })
    this.version(3).stores({
      jobSheets: '++id, localId, jobOrderId, syncStatus',
      attachments: '++id, sheetLocalId',
      draftSheets: '++id, localId, organizationId, technicianId',
    })
  }
}

export const offlineDb = new JobSyncOfflineDB()
