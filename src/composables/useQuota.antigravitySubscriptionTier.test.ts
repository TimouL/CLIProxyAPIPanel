import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useQuota } from './useQuota'
import { useQuotaStore } from '@/stores/quota'

vi.mock('@/api/client', () => ({
  apiClient: {
    getRaw: vi.fn()
  }
}))

vi.mock('@/api/apiCall', () => ({
  apiCallApi: {
    request: vi.fn()
  },
  getApiCallErrorMessage: vi.fn((res: any) => res?.error || 'HTTP error')
}))

const { apiClient } = await import('@/api/client')
const { apiCallApi } = await import('@/api/apiCall')

describe('useQuota (antigravity subscription tier)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('computes resetCountdown when refreshing antigravity quota (static until next refresh)', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-31T23:00:00Z'))

    try {
      ;(apiClient.getRaw as any).mockResolvedValue({
        data: new Blob([JSON.stringify({ project_id: 'project-1' })], { type: 'application/json' })
      })

      ;(apiCallApi.request as any).mockImplementation(async (params: any) => {
        if (typeof params?.url === 'string' && params.url.includes(':loadCodeAssist')) {
          return {
            statusCode: 200,
            body: JSON.stringify({ paid_tier: { id: 'PRO' } })
          }
        }
        return {
          statusCode: 200,
          body: JSON.stringify({
            models: {
              'claude-sonnet-4-5': {
                quotaInfo: { remainingFraction: 0.5, resetTime: '2026-02-01T00:00:00Z' }
              }
            }
          })
        }
      })

      const file = { name: 'antigravity.json', type: 'antigravity', authIndex: '1' } as any
      const { loadQuota } = useQuota(file)

      await loadQuota()

      const quota = useQuotaStore()
      const state = quota.getQuotaState('antigravity.json') as any
      expect(state?.groups?.[0]?.resetCountdown).toBe('1h 0m')
    } finally {
      vi.useRealTimers()
    }
  })

  it('skips refresh when credential is disabled', async () => {
    ;(apiClient.getRaw as any).mockResolvedValue({
      data: new Blob([JSON.stringify({ project_id: 'project-1' })], { type: 'application/json' })
    })

    ;(apiCallApi.request as any).mockResolvedValue({
      statusCode: 200,
      body: JSON.stringify({})
    })

    const file = { name: 'antigravity-disabled.json', type: 'antigravity', authIndex: '1', disabled: true } as any
    const { loadQuota } = useQuota(file)

    await loadQuota()

    expect(apiCallApi.request).not.toHaveBeenCalled()
    expect(apiClient.getRaw).not.toHaveBeenCalled()
  })

  it('stores subscriptionTier from loadCodeAssist while refreshing antigravity quota', async () => {
    ;(apiClient.getRaw as any).mockResolvedValue({
      data: new Blob([JSON.stringify({ project_id: 'project-1' })], { type: 'application/json' })
    })

    ;(apiCallApi.request as any).mockImplementation(async (params: any) => {
      if (typeof params?.url === 'string' && params.url.includes(':loadCodeAssist')) {
        return {
          statusCode: 200,
          body: JSON.stringify({ paid_tier: { id: 'PRO' } })
        }
      }
      return {
        statusCode: 200,
        body: JSON.stringify({
          models: {
            'claude-sonnet-4-5': {
              quotaInfo: { remainingFraction: 0.5, resetTime: '2026-02-01T00:00:00Z' }
            }
          }
        })
      }
    })

    const file = { name: 'antigravity.json', type: 'antigravity', authIndex: '1' } as any
    const { loadQuota } = useQuota(file)

    await loadQuota()

    const quota = useQuotaStore()
    expect((quota.getQuotaState('antigravity.json') as any)?.subscriptionTier).toBe('pro')
  })
})
