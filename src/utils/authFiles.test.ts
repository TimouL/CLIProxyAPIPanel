import { describe, expect, it } from 'vitest'

import { sortAuthFilesEnabledFirst } from './authFiles'

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

