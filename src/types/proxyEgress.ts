export interface AuthProxyEgressInfo {
  ip?: string
  loc?: string
  colo?: string
  rtt_ms?: number
  checked_at?: string
}

export interface AuthProxyEgressProbeResponse {
  results: Record<string, AuthProxyEgressInfo & { error?: string }>
}

