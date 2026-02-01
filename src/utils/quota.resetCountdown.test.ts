import { describe, expect, it } from 'vitest'

import { formatResetCountdown } from './quota'

describe('formatResetCountdown', () => {
  it('formats durations under 24 hours as *h *m', () => {
    const now = new Date('2026-02-01T00:00:00Z').getTime()
    const reset = '2026-02-01T03:12:00Z'
    expect(formatResetCountdown(reset, now)).toBe('3h 12m')
  })

  it('formats durations at/over 24 hours as *d *h', () => {
    const now = new Date('2026-02-01T00:00:00Z').getTime()
    const reset = '2026-02-03T05:00:00Z'
    expect(formatResetCountdown(reset, now)).toBe('2d 5h')
  })

  it('returns empty string for invalid timestamps', () => {
    const now = new Date('2026-02-01T00:00:00Z').getTime()
    expect(formatResetCountdown('not-a-date', now)).toBe('')
  })
})

