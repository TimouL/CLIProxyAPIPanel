import { apiClient } from './client'
import type { ApiCallRequest, ApiCallResponse } from '@/types'

export const apiCallApi = {
  async request(params: ApiCallRequest): Promise<ApiCallResponse> {
    return apiClient.post<ApiCallResponse>('/api-call', params)
  }
}

export function getApiCallErrorMessage(response: ApiCallResponse): string {
  const anyRes = response as unknown as {
    statusCode?: unknown
    status_code?: unknown
    bodyText?: unknown
    body?: unknown
    error?: unknown
  }

  const statusCode =
    typeof anyRes.statusCode === 'number'
      ? anyRes.statusCode
      : typeof anyRes.status_code === 'number'
        ? anyRes.status_code
        : undefined

  if (typeof anyRes.error === 'string' && anyRes.error.trim()) return anyRes.error

  const bodyText =
    typeof anyRes.bodyText === 'string' && anyRes.bodyText.trim()
      ? anyRes.bodyText
      : typeof anyRes.body === 'string' && anyRes.body.trim()
        ? anyRes.body
        : null

  if (bodyText) {
    try {
      const parsed = JSON.parse(bodyText) as any
      const messageCandidate = parsed?.error?.message ?? parsed?.error ?? parsed?.message
      if (typeof messageCandidate === 'string' && messageCandidate.trim()) return messageCandidate
    } catch {
      return bodyText.slice(0, 100)
    }
    return statusCode !== undefined ? `HTTP ${statusCode}` : bodyText.slice(0, 100)
  }

  return statusCode !== undefined ? `HTTP ${statusCode}` : 'HTTP unknown'
}
