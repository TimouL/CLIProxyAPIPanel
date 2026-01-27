import { defineStore } from 'pinia'
import { ref } from 'vue'

import { apiClient } from '@/api/client'

export interface AuthFileModelItem {
  id: string
  display_name?: string
  type?: string
  owned_by?: string
}

export const useAuthFileModelsStore = defineStore('authFileModels', () => {
  const cache = ref<Map<string, AuthFileModelItem[]>>(new Map())
  const inFlight = new Map<string, Promise<AuthFileModelItem[]>>()

  const getCachedModels = (fileName: string): AuthFileModelItem[] | null => {
    const key = fileName.trim()
    if (!key) return null
    return cache.value.get(key) ?? null
  }

  const invalidate = (fileName: string) => {
    const key = fileName.trim()
    if (!key) return
    cache.value.delete(key)
    inFlight.delete(key)
  }

  const prune = (fileNames: string[]) => {
    const keep = new Set(
      fileNames
        .map((name) => name.trim())
        .filter(Boolean)
    )
    for (const key of cache.value.keys()) {
      if (!keep.has(key)) {
        cache.value.delete(key)
      }
    }
    for (const key of inFlight.keys()) {
      if (!keep.has(key)) {
        inFlight.delete(key)
      }
    }
  }

  const fetchModels = async (fileName: string): Promise<AuthFileModelItem[]> => {
    const trimmed = fileName.trim()
    if (!trimmed) return []

    const cached = cache.value.get(trimmed)
    if (cached) return cached

    const existingRequest = inFlight.get(trimmed)
    if (existingRequest) return existingRequest

    const request = (async () => {
      try {
        const data = await apiClient.get<{ models?: AuthFileModelItem[] }>(
          `/auth-files/models?name=${encodeURIComponent(trimmed)}`
        )
        const models = Array.isArray(data?.models) ? data.models : []
        cache.value.set(trimmed, models)
        return models
      } finally {
        inFlight.delete(trimmed)
      }
    })()

    inFlight.set(trimmed, request)
    return request
  }

  return {
    cache,
    getCachedModels,
    invalidate,
    prune,
    fetchModels
  }
})
