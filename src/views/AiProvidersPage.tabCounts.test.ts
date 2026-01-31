import { beforeEach, describe, expect, it, vi } from 'vitest'
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

describe('AiProvidersPage tab count badges', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows enabled/total in tab badges', async () => {
    ;(apiClient.get as any).mockImplementation((url: string) => {
      switch (url) {
        case '/gemini-api-key':
          return Promise.resolve({
            'gemini-api-key': [{ 'api-key': 'g1' }, { 'api-key': 'g2', disabled: true }]
          })
        case '/claude-api-key':
          return Promise.resolve({ 'claude-api-key': [{ 'api-key': 'c1', disabled: true }] })
        case '/codex-api-key':
          return Promise.resolve({ 'codex-api-key': [] })
        case '/openai-compatibility':
          return Promise.resolve({ 'openai-compatibility': [{ name: 'A' }, { name: 'B' }] })
        case '/vertex-api-key':
          return Promise.resolve({ 'vertex-api-key': [] })
        case '/ampcode':
          return Promise.resolve({ ampcode: {} })
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
          ProviderLogo: { template: '<div />' },
          Dialog: { template: '<div />' },
          Sheet: { template: '<div />' },
          Input: { template: '<input />' },
          Textarea: { template: '<textarea />' },
          Checkbox: { template: '<input type="checkbox" />' },
          Button: { template: '<button><slot /></button>' },
          Badge: { template: '<span data-badge v-bind="$attrs"><slot /></span>' },
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

    const geminiTab = wrapper.find('button[data-value="gemini"]')
    const openaiTab = wrapper.find('button[data-value="openai"]')
    const claudeTab = wrapper.find('button[data-value="claude"]')
    const codexTab = wrapper.find('button[data-value="codex"]')

    expect(geminiTab.text()).toContain('1/2')
    expect(openaiTab.text()).toContain('2/2')
    expect(claudeTab.text()).toContain('0/1')

    // When total is 0, display should be just "0" (not "0/0") and keep circular badge style.
    expect(codexTab.text()).toContain('0')
    expect(codexTab.text()).not.toContain('0/0')

    const geminiBadge = geminiTab.find('[data-badge]')
    expect(geminiBadge.text()).toBe('1/2')
    expect(geminiBadge.classes()).toContain('min-w-10')

    const codexBadge = codexTab.find('[data-badge]')
    expect(codexBadge.text()).toBe('0')
    expect(codexBadge.classes()).toContain('w-5')
    expect(codexBadge.classes()).toContain('p-0')

    wrapper.unmount()
  })
})
