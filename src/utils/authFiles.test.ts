import { describe, expect, it } from 'vitest'

import { sortAuthFilesEnabledFirst, sortAuthFilesEnabledFirstThenByTier } from './authFiles'

describe('sortAuthFilesEnabledFirst', () => {
  it('puts disabled items last (stable)', () => {
    const input = [
      { name: 'a', disabled: true },
      { name: 'b' },
      { name: 'c', disabled: false },
      { name: 'd', disabled: true }
    ]

    const sorted = sortAuthFilesEnabledFirst(input)

    expect(sorted.map((f) => f.name)).toEqual(['b', 'c', 'a', 'd'])
    expect(input.map((f) => f.name)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('treats string flags consistently', () => {
    const input = [
      { name: 'a', disabled: 'true' },
      { name: 'b', disabled: 'false' },
      { name: 'c', disabled: ' TRUE ' }
    ]

    const sorted = sortAuthFilesEnabledFirst(input)
    expect(sorted.map((f) => f.name)).toEqual(['b', 'a', 'c'])
  })
})

describe('sortAuthFilesEnabledFirstThenByTier', () => {
  it('sorts enabled/disabled groups by tier priority (ultra > pro > free)', () => {
    const input = [
      { name: 'a', disabled: false, tier: 'pro' },
      { name: 'b', disabled: false, tier: 'ultra' },
      { name: 'c', disabled: true, tier: 'free' },
      { name: 'd', disabled: false, tier: 'free' },
      { name: 'e', disabled: true, tier: 'ULTRA' },
      { name: 'f', disabled: true, tier: undefined },
      { name: 'g', disabled: false, tier: null },
      { name: 'h', disabled: false, tier: 'pro' },
      { name: 'i', disabled: true, tier: 'pro' }
    ]

    const sorted = sortAuthFilesEnabledFirstThenByTier(input, (item) => item.tier as any)

    expect(sorted.map((f) => f.name)).toEqual(['b', 'a', 'h', 'd', 'g', 'e', 'i', 'c', 'f'])
    expect(input.map((f) => f.name)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'])
  })
})
