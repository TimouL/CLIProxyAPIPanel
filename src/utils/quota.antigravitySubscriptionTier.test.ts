import { describe, expect, it } from 'vitest'

import { resolveAntigravitySubscriptionTierFromLoadCodeAssist } from './quota'

describe('resolveAntigravitySubscriptionTierFromLoadCodeAssist', () => {
  it('prefers paid_tier.id over current_tier.id', () => {
    expect(
      resolveAntigravitySubscriptionTierFromLoadCodeAssist({
        paid_tier: { id: 'ULTRA' },
        current_tier: { id: 'FREE' }
      })
    ).toBe('ultra')
  })

  it('falls back to current_tier.id when paid_tier.id is missing', () => {
    expect(
      resolveAntigravitySubscriptionTierFromLoadCodeAssist({
        current_tier: { id: 'PRO' }
      })
    ).toBe('pro')
  })

  it('supports camelCase tier keys', () => {
    expect(
      resolveAntigravitySubscriptionTierFromLoadCodeAssist({
        paidTier: { id: 'free' }
      })
    ).toBe('free')
  })

  it('handles id strings that include tier name', () => {
    expect(
      resolveAntigravitySubscriptionTierFromLoadCodeAssist({
        currentTier: { id: 'paid_tier_ultra' }
      })
    ).toBe('ultra')
  })
})

