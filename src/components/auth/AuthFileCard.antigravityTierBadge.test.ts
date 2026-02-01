import { expect, test, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

import AuthFileCard from './AuthFileCard.vue'
import { useAuthStatsStore } from '@/stores/authStats'
import { useQuotaStore } from '@/stores/quota'

function setup() {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authStats = useAuthStatsStore()
  authStats.loadStats = vi.fn().mockResolvedValue(undefined) as any

  return { pinia }
}

test('renders Antigravity subscription tier badge when available', async () => {
  const { pinia } = setup()

  const wrapper = mount(AuthFileCard, {
    props: {
      file: { name: 'antigravity.json', type: 'antigravity' }
    },
    global: {
      plugins: [pinia],
      stubs: {
        ProxyEgressIcon: { template: '<div><slot /></div>' },
        Button: { template: '<button><slot /></button>' },
        Switch: { template: '<input type="checkbox" />' }
      }
    }
  })

  const quota = useQuotaStore()
  quota.setQuotaState('antigravity.json', {
    status: 'idle',
    groups: [],
    subscriptionTier: 'pro'
  } as any)

  await nextTick()

  expect(wrapper.text()).toContain('套餐: Pro')
})

