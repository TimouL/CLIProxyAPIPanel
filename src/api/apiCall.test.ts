import { describe, expect, it } from 'vitest'

import { getApiCallErrorMessage } from './apiCall'

describe('getApiCallErrorMessage', () => {
  it('supports snake_case response fields from backend (status_code + body)', () => {
    const message = getApiCallErrorMessage({
      status_code: 403,
      body: JSON.stringify({ error: { message: 'Forbidden' } })
    } as any)

    expect(message).toBe('Forbidden')
  })

  it('falls back to HTTP <code> when response has no error body', () => {
    const message = getApiCallErrorMessage({
      status_code: 500
    } as any)

    expect(message).toBe('HTTP 500')
  })
})

