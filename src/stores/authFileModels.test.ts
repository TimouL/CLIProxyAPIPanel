import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useAuthFileModelsStore } from './authFileModels'

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn()
  }
}))

const { apiClient } = await import('@/api/client')

describe('useAuthFileModelsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('caches models per file name', async () => {
    const store = useAuthFileModelsStore()
    ;(apiClient.get as any).mockResolvedValue({ models: [{ id: 'm1' }] })

    const first = await store.fetchModels('a.json')
    const second = await store.fetchModels('a.json')

    expect(first).toEqual([{ id: 'm1' }])
    expect(second).toEqual([{ id: 'm1' }])
    expect(apiClient.get).toHaveBeenCalledTimes(1)
  })

  it('dedupes in-flight requests for the same file', async () => {
    const store = useAuthFileModelsStore()
    let resolve: ((value: any) => void) | null = null
    ;(apiClient.get as any).mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r
        })
    )

    const p1 = store.fetchModels('b.json')
    const p2 = store.fetchModels('b.json')

    expect(apiClient.get).toHaveBeenCalledTimes(1)
    resolve?.({ models: [{ id: 'm2' }] })

    await expect(Promise.all([p1, p2])).resolves.toEqual([[{ id: 'm2' }], [{ id: 'm2' }]])
  })

  it('invalidates cached models', async () => {
    const store = useAuthFileModelsStore()
    ;(apiClient.get as any)
      .mockResolvedValueOnce({ models: [{ id: 'm1' }] })
      .mockResolvedValueOnce({ models: [{ id: 'm1' }, { id: 'm2' }] })

    await store.fetchModels('c.json')
    store.invalidate('c.json')
    const refreshed = await store.fetchModels('c.json')

    expect(refreshed).toEqual([{ id: 'm1' }, { id: 'm2' }])
    expect(apiClient.get).toHaveBeenCalledTimes(2)
  })
})

