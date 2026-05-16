import { describe, it, expect } from 'vitest'
import { createAlertSchema } from '../alertSchema'

describe('createAlertSchema', () => {
  const valid = {
    title: 'Site visit tomorrow',
    message: 'Please be on-site by 9am.',
    recipient_ids: ['tech-id-1', 'tech-id-2'],
  }

  it('accepts a valid alert', () => {
    expect(createAlertSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty title', () => {
    const r = createAlertSchema.safeParse({ ...valid, title: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.title).toContain('Title is required')
  })

  it('rejects empty message', () => {
    const r = createAlertSchema.safeParse({ ...valid, message: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.message).toContain('Message is required')
  })

  it('rejects empty recipient_ids array', () => {
    const r = createAlertSchema.safeParse({ ...valid, recipient_ids: [] })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.recipient_ids).toContain('Select at least one recipient')
  })

  it('accepts a single recipient', () => {
    expect(createAlertSchema.safeParse({ ...valid, recipient_ids: ['tech-id-1'] }).success).toBe(true)
  })
})
