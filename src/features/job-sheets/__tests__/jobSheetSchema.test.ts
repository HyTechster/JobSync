import { describe, it, expect } from 'vitest'
import { jobSheetSchema } from '../jobSheetSchema'

describe('jobSheetSchema', () => {
  const valid = {
    work_performed: 'Replaced faulty power supply and tested all cameras.',
    time_spent_minutes: 90,
  }

  it('accepts a valid job sheet', () => {
    expect(jobSheetSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts optional notes', () => {
    expect(jobSheetSchema.safeParse({ ...valid, notes: 'Follow up required' }).success).toBe(true)
  })

  it('accepts notes omitted', () => {
    expect(jobSheetSchema.safeParse({ ...valid, notes: undefined }).success).toBe(true)
  })

  it('rejects empty work_performed', () => {
    const r = jobSheetSchema.safeParse({ ...valid, work_performed: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.work_performed).toContain('Work performed is required')
  })

  it('rejects time_spent_minutes of 0', () => {
    const r = jobSheetSchema.safeParse({ ...valid, time_spent_minutes: 0 })
    expect(r.success).toBe(false)
  })

  it('rejects negative time_spent_minutes', () => {
    const r = jobSheetSchema.safeParse({ ...valid, time_spent_minutes: -5 })
    expect(r.success).toBe(false)
  })

  it('rejects time_spent_minutes exceeding 24 hours', () => {
    const r = jobSheetSchema.safeParse({ ...valid, time_spent_minutes: 1441 })
    expect(r.success).toBe(false)
  })

  it('accepts exactly 1440 minutes (24 hours)', () => {
    expect(jobSheetSchema.safeParse({ ...valid, time_spent_minutes: 1440 }).success).toBe(true)
  })

  it('rejects non-integer time_spent_minutes', () => {
    const r = jobSheetSchema.safeParse({ ...valid, time_spent_minutes: 45.5 })
    expect(r.success).toBe(false)
  })
})
