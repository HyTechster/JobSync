import { describe, it, expect } from 'vitest'
import { formatDuration } from '../formatters'

describe('formatDuration', () => {
  it('returns minutes only when under 60', () => {
    expect(formatDuration(1)).toBe('1 min')
    expect(formatDuration(30)).toBe('30 min')
    expect(formatDuration(59)).toBe('59 min')
  })

  it('returns hours only when minutes remainder is zero', () => {
    expect(formatDuration(60)).toBe('1 hr')
    expect(formatDuration(120)).toBe('2 hr')
    expect(formatDuration(480)).toBe('8 hr')
  })

  it('returns combined hours and minutes', () => {
    expect(formatDuration(90)).toBe('1 hr 30 min')
    expect(formatDuration(125)).toBe('2 hr 5 min')
    expect(formatDuration(1439)).toBe('23 hr 59 min')
  })

  it('handles zero minutes', () => {
    expect(formatDuration(0)).toBe('0 min')
  })

  it('handles exactly 1440 minutes (24 hours)', () => {
    expect(formatDuration(1440)).toBe('24 hr')
  })
})
