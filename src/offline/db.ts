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
  customerName?: string
  workPerformed?: string
  timeSpentMinutes?: number
  notes?: string
  formDataJson?: string
  createdAt: string
  updatedAt: string
}

/** A full job sheet queued while the device was offline, waiting to sync. */
export interface PendingFullSheet {
  id?: number
  localId: string
  orgId: string
  jobOrderId: string | null
  technicianId: string
  formDataJson: string
  additionalTechnicianNames: string[]
  jobPhotos: Blob[]
  paymentPhotos: Blob[]
  customerSigDataUrl: string | null
  technicianSigDataUrl: string | null
  createdAt: string
  syncStatus: 'pending' | 'syncing' | 'failed'
}

class JobSyncOfflineDB extends Dexie {
  jobSheets!: Table<OfflineJobSheet>
  attachments!: Table<OfflineAttachment>
  draftSheets!: Table<DraftJobSheet>
  pendingFullSheets!: Table<PendingFullSheet>

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
    this.version(4).stores({
      jobSheets: '++id, localId, jobOrderId, syncStatus',
      attachments: '++id, sheetLocalId',
      draftSheets: '++id, localId, organizationId, technicianId',
      pendingFullSheets: '++id, localId, orgId, syncStatus',
    })
  }
}

export const offlineDb = new JobSyncOfflineDB()
