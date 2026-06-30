import { describe, it, expect } from 'vitest'
import { fullSheetSchema, computeTimeSpent } from '../fullSheetSchema'

const valid = {
  customer_name:   'Bintang Security Sdn Bhd',
  job_title:       'CCTV inspection at Level 3',
  job_location:    'No. 12, Jalan Teknologi, PJ',
  job_date:        '2026-06-15',
  time_in:         '09:00',
  time_out:        '11:30',
  work_performed:  'Cleaned lens and reconfigured recording schedule.',
  total_amount:    '350',
}

describe('fullSheetSchema', () => {
  it('accepts a fully valid full sheet', () => {
    expect(fullSheetSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts all optional fields provided', () => {
    const full = {
      ...valid,
      customer_phone:      '+60123456789',
      customer_email:      'contact@bintang.com',
      job_description:     'Annual maintenance contract',
      job_type:            'cctv',
      service_description: 'Replaced 2 DVR units',
    }
    expect(fullSheetSchema.safeParse(full).success).toBe(true)
  })

  it('rejects empty customer_name', () => {
    const r = fullSheetSchema.safeParse({ ...valid, customer_name: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.customer_name).toContain('Customer name is required')
  })

  it('rejects empty job_title', () => {
    const r = fullSheetSchema.safeParse({ ...valid, job_title: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.job_title).toContain('Job title is required')
  })

  it('rejects empty job_location', () => {
    const r = fullSheetSchema.safeParse({ ...valid, job_location: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.job_location).toContain('Location is required')
  })

  it('rejects empty job_date', () => {
    const r = fullSheetSchema.safeParse({ ...valid, job_date: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.job_date).toContain('Date is required')
  })

  it('rejects empty time_in', () => {
    const r = fullSheetSchema.safeParse({ ...valid, time_in: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.time_in).toContain('Time In is required')
  })

  it('rejects empty time_out', () => {
    const r = fullSheetSchema.safeParse({ ...valid, time_out: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.time_out).toContain('Time Out is required')
  })

  it('rejects empty work_performed', () => {
    const r = fullSheetSchema.safeParse({ ...valid, work_performed: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.work_performed).toContain('Work performed is required')
  })

  it('rejects empty total_amount', () => {
    const r = fullSheetSchema.safeParse({ ...valid, total_amount: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.total_amount).toContain('Payment amount is required')
  })

  it('accepts empty string customer_email (treated as blank)', () => {
    expect(fullSheetSchema.safeParse({ ...valid, customer_email: '' }).success).toBe(true)
  })

  it('rejects malformed customer_email when non-empty', () => {
    const r = fullSheetSchema.safeParse({ ...valid, customer_email: 'not-an-email' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.customer_email).toContain('Invalid email')
  })

  it('accepts valid customer_email', () => {
    expect(fullSheetSchema.safeParse({ ...valid, customer_email: 'client@example.com' }).success).toBe(true)
  })

  it('requires job_type_other when job_type is "other"', () => {
    const r = fullSheetSchema.safeParse({ ...valid, job_type: 'other', job_type_other: '' })
    expect(r.success).toBe(false)
    if (!r.success) {
      const errs = r.error.flatten().fieldErrors
      expect(errs.job_type_other).toContain('Please specify the job type')
    }
  })

  it('accepts job_type "other" when job_type_other is provided', () => {
    const r = fullSheetSchema.safeParse({ ...valid, job_type: 'other', job_type_other: 'Network switch' })
    expect(r.success).toBe(true)
  })

  it('does not require job_type_other for other job types', () => {
    expect(fullSheetSchema.safeParse({ ...valid, job_type: 'cctv' }).success).toBe(true)
  })
})

describe('computeTimeSpent', () => {
  it('returns 0 when either argument is missing', () => {
    expect(computeTimeSpent(undefined, '10:00')).toBe(0)
    expect(computeTimeSpent('09:00', undefined)).toBe(0)
    expect(computeTimeSpent()).toBe(0)
  })

  it('computes simple hour-only difference', () => {
    expect(computeTimeSpent('09:00', '11:00')).toBe(120)
  })

  it('computes difference with mixed minutes', () => {
    expect(computeTimeSpent('09:15', '11:45')).toBe(150)
  })

  it('returns 0 when time_out equals time_in', () => {
    expect(computeTimeSpent('10:00', '10:00')).toBe(0)
  })

  it('returns 0 (not negative) when time_out is before time_in', () => {
    expect(computeTimeSpent('11:00', '09:00')).toBe(0)
  })

  it('handles single-digit minutes correctly', () => {
    expect(computeTimeSpent('08:05', '08:10')).toBe(5)
  })

  it('computes a full work day correctly', () => {
    expect(computeTimeSpent('08:00', '17:00')).toBe(540)
  })
})
