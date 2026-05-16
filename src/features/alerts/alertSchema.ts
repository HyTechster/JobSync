import { z } from 'zod'

export const createAlertSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  recipient_ids: z.array(z.string()).min(1, 'Select at least one recipient'),
})

export type CreateAlertFormData = z.infer<typeof createAlertSchema>
