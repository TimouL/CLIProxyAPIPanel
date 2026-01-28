import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import AuthFilesPage from './AuthFilesPage.vue'
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
  // Let pending promises resolve, then flush Vue re-render.
  await Promise.resolve()
  await nextTick()
}

describe('AuthFilesPage filter tags provider logos', () => {
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

  it('shows provider logos for codex/claude/gemini-cli tags', async () => {
    ;(apiClient.get as any).mockResolvedValue({
      files: [
        { name: 'a.json', type: 'codex' },
        { name: 'b.json', type: 'claude' },
        { name: 'c.json', type: 'gemini-cli' }
      ]
    })

    const wrapper = mount(AuthFilesPage, {
      global: {
        plugins: [pinia],
        stubs: {
          PageContainer: { template: '<div><slot /></div>' },
          PageHeader: { template: '<div><slot /></div>' },
          CardSection: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Dialog: { template: '<div><slot /></div>' },
          Input: { template: '<input />' },
          AuthFileSection: { template: '<div />' }
        }
      }
    })

    await flush()
    await flush()

    const buttons = wrapper.findAll('button')

    const findByText = (text: string) => buttons.find((b) => b.text().trim() === text) || null

    const codexBtn = findByText('codex')
    expect(codexBtn).not.toBeNull()
    const codexSvg = codexBtn!.find('svg')
    expect(codexSvg.exists()).toBe(true)
    expect(codexSvg.html()).toContain('M22.282 9.821')

    const claudeBtn = findByText('claude')
    expect(claudeBtn).not.toBeNull()
    const claudeSvg = claudeBtn!.find('svg')
    expect(claudeSvg.exists()).toBe(true)
    expect(claudeSvg.html()).toContain('m4.714 15.956')

    const geminiCliBtn = findByText('gemini-cli')
    expect(geminiCliBtn).not.toBeNull()
    const geminiCliSvg = geminiCliBtn!.find('svg')
    expect(geminiCliSvg.exists()).toBe(true)
    expect(geminiCliSvg.html()).toContain('M11.04 19.32')

    wrapper.unmount()
  })
})
