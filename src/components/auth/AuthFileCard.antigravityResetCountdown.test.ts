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

test('shows antigravity reset countdown as a clock icon + *h *m', async () => {
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
    status: 'success',
    groups: [
      {
        id: 'g1',
        label: 'Group',
        models: ['m1'],
        remainingFraction: 0.5,
        resetCountdown: '3h 12m'
      }
    ]
  } as any)

  await nextTick()

  const countdown = wrapper.get('[title="距离下次重置"]')
  expect(countdown.text()).toContain('3h 12m')
  expect(countdown.find('svg').exists()).toBe(true)
})

