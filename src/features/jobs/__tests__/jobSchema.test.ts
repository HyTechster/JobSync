import { describe, it, expect } from 'vitest'
import { jobOrderSchema } from '../jobSchema'

const validJob = {
  title: 'Fix CCTV camera',
  description: 'Camera at main entrance is offline',
  customer_name: 'ABC Corp Sdn Bhd',
  location: 'Level 3, Menara ABC, KL',
  priority: 'high' as const,
  scheduled_date: '2026-06-01',
  technician_ids: [],
}

describe('jobOrderSchema', () => {
  it('accepts a fully valid job order', () => {
    expect(jobOrderSchema.safeParse(validJob).success).toBe(true)
  })

  it('accepts optional fields omitted', () => {
    const { customer_phone: _cp, scheduled_time: _st, ...rest } = { ...validJob, customer_phone: undefined, scheduled_time: undefined }
    expect(jobOrderSchema.safeParse(rest).success).toBe(true)
  })

  it('accepts technician_ids as empty array', () => {
    expect(jobOrderSchema.safeParse({ ...validJob, technician_ids: [] }).success).toBe(true)
  })

  it('accepts technician_ids with multiple entries', () => {
    const r = jobOrderSchema.safeParse({ ...validJob, technician_ids: ['id-1', 'id-2'] })
    expect(r.success).toBe(true)
  })

  it('rejects empty title', () => {
    const r = jobOrderSchema.safeParse({ ...validJob, title: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.title).toContain('Title is required')
  })

  it('rejects empty description', () => {
    const r = jobOrderSchema.safeParse({ ...validJob, description: '' })
    expect(r.success).toBe(false)
  })

  it('rejects empty customer_name', () => {
    const r = jobOrderSchema.safeParse({ ...validJob, customer_name: '' })
    expect(r.success).toBe(false)
  })

  it('rejects empty location', () => {
    const r = jobOrderSchema.safeParse({ ...validJob, location: '' })
    expect(r.success).toBe(false)
  })

  it('rejects empty scheduled_date', () => {
    const r = jobOrderSchema.safeParse({ ...validJob, scheduled_date: '' })
    expect(r.success).toBe(false)
  })

  it('rejects invalid priority value', () => {
    const r = jobOrderSchema.safeParse({ ...validJob, priority: 'critical' })
    expect(r.success).toBe(false)
  })

  it('accepts all valid priority values', () => {
    const priorities = ['low', 'medium', 'high', 'urgent'] as const
    for (const priority of priorities) {
      expect(jobOrderSchema.safeParse({ ...validJob, priority }).success).toBe(true)
    }
  })
})
