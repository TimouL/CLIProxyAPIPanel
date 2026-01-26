import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'

import ProxyEgressIcon from './ProxyEgressIcon.vue'

describe('ProxyEgressIcon', () => {
  it('shows tooltip content on hover when proxy is configured', async () => {
    vi.useFakeTimers()

    const wrapper = mount(ProxyEgressIcon, {
      props: {
        targetId: 'auth-1',
        proxyConfigured: true
      },
      slots: {
        default: '<span>icon</span>'
      },
      attachTo: document.body,
      global: {
        plugins: [createPinia()]
      }
    })

    try {
      const button = wrapper.get('button')
      await button.trigger('pointermove', { pointerType: 'mouse' })
      vi.runAllTimers()
      await wrapper.vm.$nextTick()

      // Trigger should reflect open state when tooltip opens.
      expect(button.attributes('data-state')).not.toBe('closed')

      // TooltipContent is portalled to document.body.
      expect(document.body.textContent).toContain('代理出口')
    } finally {
      wrapper.unmount()
      vi.useRealTimers()
    }
  })
})
