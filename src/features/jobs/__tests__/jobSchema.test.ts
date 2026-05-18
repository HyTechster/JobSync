import { describe, it, expect } from 'vitest'
import { jobOrderSchema } from '../jobSchema'

const validJob = {
  customer_name:  'ABC Corp Sdn Bhd',
  customer_phone: '0123456789',
  title:          'Fix CCTV camera',
  location_street: 'Level 3, Menara ABC',
  location_city:   'Kuala Lumpur',
  priority:        'high' as const,
  description:     'Camera at main entrance is offline',
  job_type:        'maintenance' as const,
  scheduled_date_flexible: false,
  scheduled_date:          '2026-06-01',
  scheduled_time_flexible: false,
  due_date_flexible:       false,
  technician_ids:          [],
  billing_same_as_location: true,
}

describe('jobOrderSchema', () => {
  it('accepts a fully valid job order', () => {
    expect(jobOrderSchema.safeParse(validJob).success).toBe(true)
  })

  it('accepts optional fields omitted', () => {
    const minimal = {
      customer_name:  validJob.customer_name,
      customer_phone: validJob.customer_phone,
      title:          validJob.title,
      location_street: validJob.location_street,
      priority:        validJob.priority,
      description:     validJob.description,
      job_type:        validJob.job_type,
      scheduled_date_flexible: false,
      scheduled_date:          validJob.scheduled_date,
      scheduled_time_flexible: false,
      due_date_flexible:       false,
      technician_ids:          [],
      billing_same_as_location: true,
    }
    expect(jobOrderSchema.safeParse(minimal).success).toBe(true)
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

  it('rejects empty location_street', () => {
    const r = jobOrderSchema.safeParse({ ...validJob, location_street: '' })
    expect(r.success).toBe(false)
  })

  it('rejects missing scheduled_date when not flexible', () => {
    const r = jobOrderSchema.safeParse({
      ...validJob,
      scheduled_date_flexible: false,
      scheduled_date: undefined,
    })
    expect(r.success).toBe(false)
  })

  it('accepts missing scheduled_date when flexible', () => {
    const r = jobOrderSchema.safeParse({
      ...validJob,
      scheduled_date_flexible: true,
      scheduled_date: undefined,
    })
    expect(r.success).toBe(true)
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

  it('rejects billing_address missing when not same as location', () => {
    const r = jobOrderSchema.safeParse({
      ...validJob,
      billing_same_as_location: false,
      billing_address: '',
    })
    expect(r.success).toBe(false)
  })

  it('accepts billing_address provided when not same as location', () => {
    const r = jobOrderSchema.safeParse({
      ...validJob,
      billing_same_as_location: false,
      billing_address: 'No. 1, Jalan Example, KL',
    })
    expect(r.success).toBe(true)
  })
})
