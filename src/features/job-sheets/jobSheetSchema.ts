import { z } from 'zod'

export const jobSheetSchema = z.object({
  work_performed: z.string().min(1, 'Work performed is required'),
  time_spent_minutes: z
    .number()
    .int()
    .min(1, 'Time must be at least 1 minute')
    .max(1440, 'Time cannot exceed 24 hours'),
  notes: z.string().optional(),
})

export type JobSheetFormData = z.infer<typeof jobSheetSchema>
