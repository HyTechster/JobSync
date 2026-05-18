import { z } from 'zod'

export const JOB_TYPES = [
  { value: 'service',               label: 'Service' },
  { value: 'inspection',            label: 'Inspection' },
  { value: 'installation',          label: 'Installation' },
  { value: 'maintenance',           label: 'Maintenance' },
  { value: 'emergency',             label: 'Emergency' },
  { value: 'scheduled_maintenance', label: 'Scheduled Maintenance' },
  { value: 'other',                 label: 'Other' },
] as const

export type JobTypeValue = typeof JOB_TYPES[number]['value']

export const jobOrderSchema = z
  .object({
    // ── Customer ───────────────────────────────────────────
    customer_name:  z.string().min(1, 'Customer name is required'),
    customer_phone: z.string().min(1, 'Phone is required'),
    customer_email: z.union([z.string().email('Invalid email address'), z.literal('')]).optional(),

    // ── Job details ────────────────────────────────────────
    title:            z.string().min(1, 'Title is required'),
    location_street:  z.string().min(1, 'Street address is required'),
    location_city:    z.string().optional(),
    location_state:   z.string().optional(),
    location_postcode: z.string().optional(),
    priority:         z.enum(['low', 'medium', 'high', 'urgent']),
    description:      z.string().min(1, 'Description is required'),
    job_type:         z.enum(
      ['service', 'inspection', 'installation', 'maintenance', 'emergency', 'scheduled_maintenance', 'other'],
      { error: 'Job type is required' }
    ),
    job_type_other: z.string().optional(),

    // ── Schedule ───────────────────────────────────────────
    scheduled_date_flexible: z.boolean(),
    scheduled_date:          z.string().optional(),
    scheduled_time_flexible: z.boolean(),
    scheduled_time:          z.string().optional(),
    due_date_flexible:       z.boolean(),
    due_date:                z.string().optional(),

    // ── Assignment ─────────────────────────────────────────
    technician_ids: z.array(z.string()),

    // ── Payment ────────────────────────────────────────────
    billing_same_as_location: z.boolean(),
    billing_address:          z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.scheduled_date_flexible && !data.scheduled_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Date is required',
        path: ['scheduled_date'],
      })
    }
    if (data.job_type === 'other' && !data.job_type_other?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please specify the job type',
        path: ['job_type_other'],
      })
    }
    if (!data.billing_same_as_location && !data.billing_address?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Billing address is required',
        path: ['billing_address'],
      })
    }
  })

export type JobOrderFormData = z.infer<typeof jobOrderSchema>
