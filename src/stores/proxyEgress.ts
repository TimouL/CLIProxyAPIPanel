import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AuthProxyEgressInfo } from '@/types/proxyEgress'
import { probeAuthFilesProxyEgress } from '@/api/proxyEgress'
import type { ApiError } from '@/types'

export type ProxyEgressBackendSupport = 'unknown' | 'supported' | 'unsupported'
export type ProxyEgressProbeSource = 'auto' | 'manual'

export interface ProxyEgressRecord extends AuthProxyEgressInfo {
  checked_at_ms?: number
}

export interface ProxyEgressStateEntry {
  record: ProxyEgressRecord | null
  last_success_at_ms: number | null
  last_error_at_ms: number | null
  last_error: string | null
  in_flight: boolean
  in_flight_source: ProxyEgressProbeSource | null
  auto_last_attempt_at_ms: number | null
  manual_last_attempt_at_ms: number | null
}

const AUTO_CACHE_TTL_MS = 10 * 60 * 1000
const AUTO_COOLDOWN_MS = 30 * 1000
const MANUAL_COOLDOWN_MS = 30 * 1000

function nowMs(): number {
  return Date.now()
}

function parseCheckedAtMs(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const t = Date.parse(value)
  return Number.isFinite(t) ? t : null
}

function isUnsupportedBackendError(err: unknown): boolean {
  const apiErr = err as ApiError | undefined
  const status = (apiErr as any)?.status
  if (status === 404 || status === 405 || status === 501) return true
  const msg = ((apiErr as any)?.message || '').toString().toLowerCase()
  return msg.includes('not found') || msg.includes('cannot post') || msg.includes('unsupported')
}

export const useProxyEgressStore = defineStore('proxyEgress', () => {
  const backendSupport = ref<ProxyEgressBackendSupport>('unknown')
  const states = ref<Map<string, ProxyEgressStateEntry>>(new Map())

  const ensure = (id: string): ProxyEgressStateEntry => {
    const existing = states.value.get(id)
    if (existing) return existing
    const initial: ProxyEgressStateEntry = {
      record: null,
      last_success_at_ms: null,
      last_error_at_ms: null,
      last_error: null,
      in_flight: false,
      in_flight_source: null,
      auto_last_attempt_at_ms: null,
      manual_last_attempt_at_ms: null
    }
    states.value.set(id, initial)
    return initial
  }

  const getState = (id: string): ProxyEgressStateEntry | null => states.value.get(id) || null

  const getManualCooldownRemainingMs = (id: string): number => {
    const entry = states.value.get(id)
    if (!entry?.manual_last_attempt_at_ms) return 0
    const elapsed = nowMs() - entry.manual_last_attempt_at_ms
    return Math.max(0, MANUAL_COOLDOWN_MS - elapsed)
  }

  const canManualProbe = (id: string): boolean => {
    return getManualCooldownRemainingMs(id) === 0
  }

  const canAutoProbe = (id: string): boolean => {
    const entry = states.value.get(id)
    if (backendSupport.value === 'unsupported') return false
    if (entry?.in_flight) return false

    // Cache TTL based on last successful record timestamp.
    const checkedAt = entry?.record?.checked_at_ms
    if (checkedAt && nowMs() - checkedAt < AUTO_CACHE_TTL_MS) return false

    // Throttle bursty auto triggers (e.g., rapid pagination).
    if (entry?.auto_last_attempt_at_ms && nowMs() - entry.auto_last_attempt_at_ms < AUTO_COOLDOWN_MS) return false

    return true
  }

  async function probe(ids: string[], source: ProxyEgressProbeSource): Promise<void> {
    const trimmed = ids.map((id) => id.trim()).filter(Boolean)
    if (trimmed.length === 0) return
    if (backendSupport.value === 'unsupported') return

    const eligible = trimmed.filter((id) => {
      if (source === 'manual') return canManualProbe(id)
      return canAutoProbe(id)
    })
    if (eligible.length === 0) return

    const now = nowMs()
    eligible.forEach((id) => {
      const entry = ensure(id)
      entry.in_flight = true
      entry.in_flight_source = source
      if (source === 'manual') entry.manual_last_attempt_at_ms = now
      else entry.auto_last_attempt_at_ms = now
    })

    try {
      const resp = await probeAuthFilesProxyEgress(eligible)
      backendSupport.value = 'supported'

      eligible.forEach((id) => {
        const entry = ensure(id)
        entry.in_flight = false
        entry.in_flight_source = null

        const payload = resp?.results?.[id]
        if (!payload) {
          return
        }

        const payloadError = typeof payload.error === 'string' ? payload.error.trim() : ''
        if (payloadError) {
          entry.last_error_at_ms = nowMs()
          entry.last_error = payloadError
          return
        }

        const checkedAtMs = parseCheckedAtMs(payload.checked_at)
        entry.record = {
          ip: typeof payload.ip === 'string' ? payload.ip : undefined,
          loc: typeof payload.loc === 'string' ? payload.loc : undefined,
          colo: typeof payload.colo === 'string' ? payload.colo : undefined,
          rtt_ms: typeof payload.rtt_ms === 'number' ? payload.rtt_ms : undefined,
          checked_at: typeof payload.checked_at === 'string' ? payload.checked_at : undefined,
          checked_at_ms: checkedAtMs ?? nowMs()
        }
        entry.last_success_at_ms = nowMs()
        entry.last_error_at_ms = null
        entry.last_error = null
      })
    } catch (err: unknown) {
      if (isUnsupportedBackendError(err)) {
        backendSupport.value = 'unsupported'
      }

      // If the backend isn't ready yet, don't paint the UI as "down".
      const treatAsUnknown = backendSupport.value !== 'supported'
      eligible.forEach((id) => {
        const entry = ensure(id)
        entry.in_flight = false
        entry.in_flight_source = null
        if (treatAsUnknown) {
          entry.last_error_at_ms = null
          entry.last_error = null
          return
        }
        entry.last_error_at_ms = nowMs()
        entry.last_error = (err as ApiError)?.message || 'probe failed'
      })
    }
  }

  const probeAuto = (ids: string[]) => probe(ids, 'auto')
  const probeManual = (id: string) => probe([id], 'manual')

  return {
    backendSupport,
    states,
    getState,
    canAutoProbe,
    canManualProbe,
    getManualCooldownRemainingMs,
    probeAuto,
    probeManual
  }
})

