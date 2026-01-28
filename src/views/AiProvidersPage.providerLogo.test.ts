import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import AiProvidersPage from './AiProvidersPage.vue'

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

const { apiClient } = await import('@/api/client')

async function flush() {
  await Promise.resolve()
  await nextTick()
}

describe('AiProvidersPage provider logos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses ProviderLogo for Claude/Codex tabs and cards', async () => {
    ;(apiClient.get as any).mockImplementation((url: string) => {
      switch (url) {
        case '/gemini-api-key':
          return Promise.resolve({ 'gemini-api-key': [] })
        case '/claude-api-key':
          return Promise.resolve({ 'claude-api-key': [{ 'api-key': 'sk-claude-1234567890' }] })
        case '/codex-api-key':
          return Promise.resolve({ 'codex-api-key': [{ 'api-key': 'sk-codex-1234567890' }] })
        case '/openai-compatibility':
          return Promise.resolve({ 'openai-compatibility': [] })
        case '/vertex-api-key':
          return Promise.resolve({ 'vertex-api-key': [] })
        case '/ampcode':
          return Promise.resolve({})
        case '/usage':
          return Promise.resolve(null)
        default:
          return Promise.resolve({})
      }
    })

    const wrapper = mount(AiProvidersPage, {
      global: {
        stubs: {
          PageContainer: { template: '<div><slot /></div>' },
          PageHeader: { template: '<div />' },
          CardSection: { template: '<div><slot /></div>' },
          Dialog: { template: '<div />' },
          Sheet: { template: '<div />' },
          Input: { template: '<input />' },
          Textarea: { template: '<textarea />' },
          Checkbox: { template: '<input type="checkbox" />' },
          Button: { template: '<button><slot /></button>' },
          Badge: { template: '<span><slot /></span>' },
          Skeleton: { template: '<div />' },
          Switch: { template: '<input type="checkbox" />' },
          Tabs: { template: '<div><slot /></div>' },
          TabsList: { template: '<div><slot /></div>' },
          TabsTrigger: { props: ['value'], template: '<button :data-value="value"><slot /></button>' },
          TabsContent: { props: ['value'], template: '<div :data-content="value"><slot /></div>' }
        }
      }
    })

    await flush()
    await flush()

    const claudeTab = wrapper.find('button[data-value="claude"]')
    expect(claudeTab.exists()).toBe(true)
    expect(claudeTab.find('svg').html()).toContain('m4.714 15.956')

    const codexTab = wrapper.find('button[data-value="codex"]')
    expect(codexTab.exists()).toBe(true)
    expect(codexTab.find('svg').html()).toContain('M22.282 9.821')

    const claudeCardIcon = wrapper.find('div[data-content="claude"] .provider-icon svg')
    expect(claudeCardIcon.exists()).toBe(true)
    expect(claudeCardIcon.html()).toContain('m4.714 15.956')

    const codexCardIcon = wrapper.find('div[data-content="codex"] .provider-icon svg')
    expect(codexCardIcon.exists()).toBe(true)
    expect(codexCardIcon.html()).toContain('M22.282 9.821')

    wrapper.unmount()
  })
})

