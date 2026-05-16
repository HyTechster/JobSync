import { describe, it, expect } from 'vitest'
import { createUserSchema, editUserSchema } from '../userSchema'

describe('createUserSchema', () => {
  const valid = {
    full_name: 'Ahmad Rashid',
    email: 'ahmad@company.com',
    role: 'technician' as const,
    password: 'securePass1',
  }

  it('accepts a valid new user', () => {
    expect(createUserSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts optional phone', () => {
    expect(createUserSchema.safeParse({ ...valid, phone: '+60123456789' }).success).toBe(true)
  })

  it('rejects empty full_name', () => {
    const r = createUserSchema.safeParse({ ...valid, full_name: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.full_name).toContain('Full name is required')
  })

  it('rejects invalid email format', () => {
    const r = createUserSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.email).toContain('Invalid email address')
  })

  it('rejects password shorter than 8 characters', () => {
    const r = createUserSchema.safeParse({ ...valid, password: 'short' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.password).toContain('Password must be at least 8 characters')
  })

  it('rejects invalid role', () => {
    const r = createUserSchema.safeParse({ ...valid, role: 'manager' })
    expect(r.success).toBe(false)
  })

  it('accepts admin role', () => {
    expect(createUserSchema.safeParse({ ...valid, role: 'admin' }).success).toBe(true)
  })
})

describe('editUserSchema', () => {
  const valid = {
    full_name: 'Ahmad Rashid',
    role: 'technician' as const,
  }

  it('accepts a valid edit payload', () => {
    expect(editUserSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts optional phone', () => {
    expect(editUserSchema.safeParse({ ...valid, phone: '+60123456789' }).success).toBe(true)
  })

  it('rejects empty full_name', () => {
    const r = editUserSchema.safeParse({ ...valid, full_name: '' })
    expect(r.success).toBe(false)
  })

  it('rejects invalid role', () => {
    const r = editUserSchema.safeParse({ ...valid, role: 'superadmin' })
    expect(r.success).toBe(false)
  })
})
