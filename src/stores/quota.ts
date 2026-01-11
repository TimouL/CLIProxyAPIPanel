import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AntigravityQuotaState, CodexQuotaState, GeminiCliQuotaState } from '@/types'

type QuotaState = AntigravityQuotaState | CodexQuotaState | GeminiCliQuotaState

export const useQuotaStore = defineStore('quota', () => {
  // 存储每个文件的配额状态
  const quotaStates = ref<Map<string, QuotaState>>(new Map())
  
  // 存储加载状态
  const loadingStates = ref<Map<string, boolean>>(new Map())

  // 获取文件的配额状态
  const getQuotaState = (fileName: string): QuotaState | null => {
    return quotaStates.value.get(fileName) || null
  }

  // 设置文件的配额状态
  const setQuotaState = (fileName: string, state: QuotaState) => {
    quotaStates.value.set(fileName, state)
  }

  // 获取文件的加载状态
  const getLoadingState = (fileName: string): boolean => {
    return loadingStates.value.get(fileName) || false
  }

  // 设置文件的加载状态
  const setLoadingState = (fileName: string, loading: boolean) => {
    loadingStates.value.set(fileName, loading)
  }

  // 清除单个文件的状态
  const clearFileState = (fileName: string) => {
    quotaStates.value.delete(fileName)
    loadingStates.value.delete(fileName)
  }

  // 清除所有状态
  const clearAllStates = () => {
    quotaStates.value.clear()
    loadingStates.value.clear()
  }

  // 获取所有已加载配额的文件数量
  const getLoadedQuotaCount = (): number => {
    let count = 0
    for (const state of quotaStates.value.values()) {
      if (state.status === 'success') {
        count++
      }
    }
    return count
  }

  // 获取所有文件名列表
  const getAllFileNames = (): string[] => {
    return Array.from(quotaStates.value.keys())
  }

  // 初始化文件的配额状态（如果不存在）
  const initializeQuotaState = (fileName: string, fileType: string): QuotaState => {
    const existing = getQuotaState(fileName)
    if (existing) {
      return existing
    }

    let initialState: QuotaState
    if (fileType === 'antigravity') {
      initialState = { status: 'idle', groups: [] }
    } else if (fileType === 'codex') {
      initialState = { status: 'idle', windows: [] }
    } else if (fileType === 'gemini-cli') {
      initialState = { status: 'idle', buckets: [] }
    } else {
      initialState = { status: 'idle', groups: [] } // 默认状态
    }

    setQuotaState(fileName, initialState)
    return initialState
  }

  return {
    quotaStates,
    loadingStates,
    getQuotaState,
    setQuotaState,
    getLoadingState,
    setLoadingState,
    clearFileState,
    clearAllStates,
    initializeQuotaState,
    getLoadedQuotaCount,
    getAllFileNames
  }
})