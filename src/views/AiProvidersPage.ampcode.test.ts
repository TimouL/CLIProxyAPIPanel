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

describe('AiProvidersPage ampcode config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders and saves ampcode config', async () => {
    const upstreamUrl = 'https://amp.example.com'
    const upstreamApiKey = 'sk-ampcode-1234567890'

    ;(apiClient.get as any).mockImplementation((url: string) => {
      switch (url) {
        case '/gemini-api-key':
          return Promise.resolve({ 'gemini-api-key': [] })
        case '/claude-api-key':
          return Promise.resolve({ 'claude-api-key': [] })
        case '/codex-api-key':
          return Promise.resolve({ 'codex-api-key': [] })
        case '/openai-compatibility':
          return Promise.resolve({ 'openai-compatibility': [] })
        case '/vertex-api-key':
          return Promise.resolve({ 'vertex-api-key': [] })
        case '/ampcode':
          return Promise.resolve({
            ampcode: {
              'upstream-url': upstreamUrl,
              'upstream-api-key': upstreamApiKey,
              'force-model-mappings': true,
              'model-mappings': [{ from: 'gpt-4', to: 'gpt-4-0613' }]
            }
          })
        case '/usage':
          return Promise.resolve(null)
        default:
          return Promise.resolve({})
      }
    })

    ;(apiClient.put as any).mockResolvedValue({ status: 'ok' })

    const wrapper = mount(AiProvidersPage, {
      global: {
        stubs: {
          PageContainer: { template: '<div><slot /></div>' },
          PageHeader: { template: '<div />' },
          CardSection: { template: '<div><slot /></div>' },
          ProviderLogo: { template: '<div />' },
          Dialog: {
            props: ['open'],
            template: '<div v-if="open"><slot /><slot name="footer" /></div>'
          },
          Sheet: {
            props: ['open'],
            template: '<div v-if="open"><slot /><slot name="footer" /></div>'
          },
          Input: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template:
              '<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
          },
          Textarea: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template:
              '<textarea v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>'
          },
          Checkbox: {
            props: ['checked'],
            emits: ['update:checked'],
            template:
              '<input type="checkbox" v-bind="$attrs" :checked="checked" @change="$emit(\'update:checked\', $event.target.checked)" />'
          },
          Button: { template: '<button v-bind="$attrs"><slot /></button>' },
          Badge: { template: '<span><slot /></span>' },
          Skeleton: { template: '<div />' },
          Switch: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template:
              '<input type="checkbox" v-bind="$attrs" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />'
          },
          Tabs: { template: '<div><slot /></div>' },
          TabsList: { template: '<div><slot /></div>' },
          TabsTrigger: { props: ['value'], template: '<button :data-value="value"><slot /></button>' },
          TabsContent: { props: ['value'], template: '<div :data-content="value"><slot /></div>' }
        }
      }
    })

    await flush()
    await flush()

    const ampcodeContent = wrapper.find('div[data-content="ampcode"]')
    expect(ampcodeContent.text()).toContain(upstreamUrl)
    expect(ampcodeContent.text()).toContain('sk-a...7890')
    expect(ampcodeContent.text()).toContain('gpt-4')
    expect(ampcodeContent.text()).toContain('gpt-4-0613')

    const editButton = ampcodeContent.findAll('button').find((btn) => btn.text().includes('编辑配置'))
    expect(editButton).toBeTruthy()
    await editButton!.trigger('click')
    await flush()

    const upstreamUrlInput = wrapper.find('input[placeholder="https://api.openai.com/v1"]')
    expect((upstreamUrlInput.element as HTMLInputElement).value).toBe(upstreamUrl)

    const saveButton = wrapper.findAll('button').find((btn) => btn.text().trim() === '保存')
    expect(saveButton).toBeTruthy()
    await saveButton!.trigger('click')
    await flush()

    expect(apiClient.put).toHaveBeenCalledWith('/ampcode/upstream-url', { value: upstreamUrl })
    expect(apiClient.put).toHaveBeenCalledWith('/ampcode/upstream-api-key', { value: upstreamApiKey })
    expect(apiClient.put).toHaveBeenCalledWith('/ampcode/force-model-mappings', { value: true })
    expect(apiClient.put).toHaveBeenCalledWith('/ampcode/model-mappings', {
      value: [{ from: 'gpt-4', to: 'gpt-4-0613' }]
    })

    wrapper.unmount()
  })
})
