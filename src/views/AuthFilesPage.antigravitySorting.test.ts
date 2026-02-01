import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import AuthFilesPage from './AuthFilesPage.vue'
import { useQuotaStore } from '@/stores/quota'
import { useAuthStatsStore } from '@/stores/authStats'
import { useProxyEgressStore } from '@/stores/proxyEgress'
import type { Pinia } from 'pinia'

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn()
  }
}))

const { apiClient } = await import('@/api/client')

async function flush() {
  await Promise.resolve()
  await nextTick()
}

describe('AuthFilesPage antigravity sorting', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
    vi.useFakeTimers()

    const authStats = useAuthStatsStore()
    authStats.loadStats = vi.fn().mockResolvedValue(undefined) as any

    const proxyEgress = useProxyEgressStore()
    proxyEgress.probeAuto = vi.fn().mockResolvedValue(undefined) as any
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('orders enabled first, then disabled; within each group ultra > pro > free', async () => {
    ;(apiClient.get as any).mockResolvedValue({
      files: [
        { name: 'f1.json', type: 'antigravity' }, // enabled free
        { name: 'u2.json', type: 'antigravity', disabled: true }, // disabled ultra
        { name: 'p1.json', type: 'antigravity' }, // enabled pro
        { name: 'f2.json', type: 'antigravity', disabled: true }, // disabled free
        { name: 'u1.json', type: 'antigravity' }, // enabled ultra
        { name: 'p2.json', type: 'antigravity', disabled: true } // disabled pro
      ]
    })

    const quota = useQuotaStore()
    quota.setQuotaState('u1.json', { status: 'idle', groups: [], subscriptionTier: 'ultra' } as any)
    quota.setQuotaState('p1.json', { status: 'idle', groups: [], subscriptionTier: 'pro' } as any)
    quota.setQuotaState('f1.json', { status: 'idle', groups: [], subscriptionTier: 'free' } as any)
    quota.setQuotaState('u2.json', { status: 'idle', groups: [], subscriptionTier: 'ultra' } as any)
    quota.setQuotaState('p2.json', { status: 'idle', groups: [], subscriptionTier: 'pro' } as any)
    quota.setQuotaState('f2.json', { status: 'idle', groups: [], subscriptionTier: 'free' } as any)

    const wrapper = mount(AuthFilesPage, {
      global: {
        plugins: [pinia],
        stubs: {
          PageContainer: { template: '<div><slot /></div>' },
          PageHeader: { template: '<div><slot /></div>' },
          CardSection: { template: '<div><slot /></div>' },
          ProviderLogo: { template: '<svg />' },
          Button: { template: '<button><slot /></button>' },
          Dialog: { template: '<div><slot /></div>' },
          Input: { template: '<input />' },
          AuthFileSection: {
            props: ['title', 'files'],
            template:
              '<div :data-testid="title"><div v-for="f in files" :key="f.name">{{ f.name }}</div></div>'
          }
        }
      }
    })

    await flush()
    await flush()

    const section = wrapper.get('[data-testid="Antigravity"]')
    const names = section.findAll('div').map((n) => n.text().trim()).filter(Boolean)

    // enabled: u1, p1, f1; disabled: u2, p2, f2
    expect(names).toEqual(['u1.json', 'p1.json', 'f1.json', 'u2.json', 'p2.json', 'f2.json'])

    wrapper.unmount()
  })
})

