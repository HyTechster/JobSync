import { z } from 'zod'

export const createUserSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'technician']),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const editUserSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'manager', 'technician']),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
export type EditUserFormData = z.infer<typeof editUserSchema>
