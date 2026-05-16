import { z } from 'zod'

export const jobOrderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_phone: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  scheduled_date: z.string().min(1, 'Scheduled date is required'),
  scheduled_time: z.string().optional(),
  technician_ids: z.array(z.string()),
})

export type JobOrderFormData = z.infer<typeof jobOrderSchema>
