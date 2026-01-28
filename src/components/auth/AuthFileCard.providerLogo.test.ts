import { describe, expect, test, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import AuthFileCard from './AuthFileCard.vue'
import { useAuthStatsStore } from '@/stores/authStats'

function setup() {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authStats = useAuthStatsStore()
  authStats.loadStats = vi.fn().mockResolvedValue(undefined) as any

  return { pinia }
}

describe('AuthFileCard provider logos', () => {
  test('renders OpenAI logo for codex', () => {
    const { pinia } = setup()

    const wrapper = mount(AuthFileCard, {
      props: {
        file: { name: 'codex.json', type: 'codex' }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ProxyEgressIcon: { template: '<div data-testid="badge"><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Switch: { template: '<input type="checkbox" />' }
        }
      }
    })

    const svg = wrapper.find('[data-testid="badge"] svg')
    expect(svg.exists()).toBe(true)
    // Unique substring from Simple Icons OpenAI glyph.
    expect(svg.html()).toContain('M22.282 9.821')
  })

  test('renders Claude logo for claude', () => {
    const { pinia } = setup()

    const wrapper = mount(AuthFileCard, {
      props: {
        file: { name: 'claude.json', type: 'claude' }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ProxyEgressIcon: { template: '<div data-testid="badge"><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Switch: { template: '<input type="checkbox" />' }
        }
      }
    })

    const svg = wrapper.find('[data-testid="badge"] svg')
    expect(svg.exists()).toBe(true)
    // Unique substring from Simple Icons Claude glyph.
    expect(svg.html()).toContain('m4.714 15.956')
  })

  test('renders Google Gemini logo for gemini-cli', () => {
    const { pinia } = setup()

    const wrapper = mount(AuthFileCard, {
      props: {
        file: { name: 'gemini-cli.json', type: 'gemini-cli' }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ProxyEgressIcon: { template: '<div data-testid="badge"><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Switch: { template: '<input type="checkbox" />' }
        }
      }
    })

    const svg = wrapper.find('[data-testid="badge"] svg')
    expect(svg.exists()).toBe(true)
    // Unique substring from Simple Icons Google Gemini glyph.
    expect(svg.html()).toContain('M11.04 19.32')
  })

  test('renders Antigravity logo for antigravity', () => {
    const { pinia } = setup()

    const wrapper = mount(AuthFileCard, {
      props: {
        file: { name: 'antigravity.json', type: 'antigravity' }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ProxyEgressIcon: { template: '<div data-testid="badge"><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Switch: { template: '<input type="checkbox" />' }
        }
      }
    })

    const svg = wrapper.find('[data-testid="badge"] svg')
    expect(svg.exists()).toBe(true)
    expect(svg.html()).toContain('M0 0 C0.79631836 0.36786621')
  })

  test('renders Qwen logo for qwen', () => {
    const { pinia } = setup()

    const wrapper = mount(AuthFileCard, {
      props: {
        file: { name: 'qwen.json', type: 'qwen' }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ProxyEgressIcon: { template: '<div data-testid="badge"><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Switch: { template: '<input type="checkbox" />' }
        }
      }
    })

    const svg = wrapper.find('[data-testid="badge"] svg')
    expect(svg.exists()).toBe(true)
    expect(svg.html()).toContain('M12.604 1.34')
  })

  test('renders iFlow logo for iflow', () => {
    const { pinia } = setup()

    const wrapper = mount(AuthFileCard, {
      props: {
        file: { name: 'iflow.json', type: 'iflow' }
      },
      global: {
        plugins: [pinia],
        stubs: {
          ProxyEgressIcon: { template: '<div data-testid="badge"><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Switch: { template: '<input type="checkbox" />' }
        }
      }
    })

    const svg = wrapper.find('[data-testid="badge"] svg')
    expect(svg.exists()).toBe(true)
    expect(svg.html()).toContain('M31.843111328125,14.751')
  })
})
