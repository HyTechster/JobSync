import type { Database } from './database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type JobOrder = Database['public']['Tables']['job_orders']['Row']
export type JobAssignment = Database['public']['Tables']['job_assignments']['Row']
export type JobSheet = Database['public']['Tables']['job_sheets']['Row']
export type Attachment = Database['public']['Tables']['attachments']['Row']
export type Alert = Database['public']['Tables']['alerts']['Row']
export type AlertRecipient = Database['public']['Tables']['alert_recipients']['Row']

export type JobStatus = JobOrder['status']
export type JobPriority = JobOrder['priority']
export type UserRole = Profile['role']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type JobOrderInsert = Database['public']['Tables']['job_orders']['Insert']
export type JobOrderUpdate = Database['public']['Tables']['job_orders']['Update']
export type JobSheetInsert = Database['public']['Tables']['job_sheets']['Insert']
export type AlertInsert = Database['public']['Tables']['alerts']['Insert']

export const JOB_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const JOB_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

export const USER_ROLE = {
  ADMIN: 'admin',
  TECHNICIAN: 'technician',
} as const
