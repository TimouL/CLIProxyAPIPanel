import { apiClient } from './client'
import type { AuthProxyEgressProbeResponse } from '@/types/proxyEgress'

/**
 * Probe proxy egress info for auth files (future backend support).
 *
 * Expected backend route (not implemented yet):
 * POST /v0/management/auth-files/proxy-egress
 * Body: { auth_ids: string[] }
 * Response: { results: Record<auth_id, { ip, loc, colo, rtt_ms, checked_at, error? }> }
 */
export async function probeAuthFilesProxyEgress(authIds: string[]): Promise<AuthProxyEgressProbeResponse> {
  return apiClient.post<AuthProxyEgressProbeResponse>('/auth-files/proxy-egress', { auth_ids: authIds })
}

