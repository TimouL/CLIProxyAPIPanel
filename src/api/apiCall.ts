import { apiClient } from './client'
import type { ApiCallRequest, ApiCallResponse } from '@/types'

export const apiCallApi = {
  async request(params: ApiCallRequest): Promise<ApiCallResponse> {
    return apiClient.post<ApiCallResponse>('/api-call', params)
  }
}

export function getApiCallErrorMessage(response: ApiCallResponse): string {
  if (response.error) return response.error
  if (response.bodyText) {
    try {
      const parsed = JSON.parse(response.bodyText)
      return parsed.error?.message || parsed.error || parsed.message || `HTTP ${response.statusCode}`
    } catch {
      return response.bodyText.slice(0, 100)
    }
  }
  return `HTTP ${response.statusCode}`
}
