import type { InjectionKey } from 'vue'

export type ProxyEgressScheduler = {
  register: (id: string) => void
  unregister: (id: string) => void
}

export const proxyEgressSchedulerKey: InjectionKey<ProxyEgressScheduler> = Symbol('proxyEgressScheduler')

