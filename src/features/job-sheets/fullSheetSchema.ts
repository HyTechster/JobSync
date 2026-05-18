import { z } from 'zod'

export const fullSheetSchema = z.object({
  // Customer
  customer_name:  z.string().min(1, 'Customer name is required'),
  customer_phone: z.string().optional(),
  customer_email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),

  // Job details — location, date, times now required
  job_title:       z.string().min(1, 'Job title is required'),
  job_location:    z.string().min(1, 'Location is required'),
  job_description: z.string().optional(),
  job_type:        z.string().optional(),
  job_type_other:  z.string().optional(),
  job_date:        z.string().min(1, 'Date is required'),
  time_in:         z.string().min(1, 'Time In is required'),
  time_out:        z.string().min(1, 'Time Out is required'),

  // Work
  work_performed:      z.string().min(1, 'Work performed is required'),
  service_description: z.string().optional(),

  // Payment — required
  total_amount: z.string().min(1, 'Payment amount is required'),
}).superRefine((data, ctx) => {
  if (data.job_type === 'other' && !data.job_type_other?.trim()) {
    ctx.addIssue({ code: 'custom', path: ['job_type_other'], message: 'Please specify the job type' })
  }
})

export type FullSheetFormData = z.infer<typeof fullSheetSchema>

export function computeTimeSpent(timeIn?: string, timeOut?: string): number {
  if (!timeIn || !timeOut) return 0
  const [inH, inM] = timeIn.split(':').map(Number)
  const [outH, outM] = timeOut.split(':').map(Number)
  return Math.max(0, (outH * 60 + outM) - (inH * 60 + inM))
}
