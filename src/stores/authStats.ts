import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/api/client'

/**
 * 成功/失败统计桶
 */
export interface KeyStatBucket {
  success: number
  failure: number
}

/**
 * 按 authIndex 和 source 分别统计的数据
 */
export interface KeyStats {
  bySource: Record<string, KeyStatBucket>
  byAuthIndex: Record<string, KeyStatBucket>
}

/**
 * 状态栏单个格子的状态
 */
export type StatusBlockState = 'success' | 'failure' | 'mixed' | 'idle'

/**
 * 状态栏数据
 */
export interface StatusBarData {
  blocks: StatusBlockState[]
  successRate: number
  totalSuccess: number
  totalFailure: number
}

/**
 * Usage 明细条目
 */
interface UsageDetail {
  timestamp: string
  source?: string
  auth_index?: number | string
  failed?: boolean
}

/**
 * 标准化 authIndex 值
 */
function normalizeAuthIndex(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString()
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : null
  }
  return null
}

/**
 * 从 usage 数据收集所有请求明细
 */
function collectUsageDetails(usageData: any): UsageDetail[] {
  if (!usageData) {
    return []
  }
  const apis = usageData.apis || {}
  const details: UsageDetail[] = []
  Object.values(apis as Record<string, any>).forEach((apiEntry) => {
    const models = apiEntry?.models || {}
    Object.values(models as Record<string, any>).forEach((modelEntry) => {
      const modelDetails = Array.isArray(modelEntry.details) ? modelEntry.details : []
      modelDetails.forEach((detail: any) => {
        if (detail && detail.timestamp) {
          details.push(detail)
        }
      })
    })
  })
  return details
}

/**
 * 计算按 source 和 authIndex 的统计
 */
function computeKeyStats(usageData: any): KeyStats {
  if (!usageData) {
    return { bySource: {}, byAuthIndex: {} }
  }

  const sourceStats: Record<string, KeyStatBucket> = {}
  const authIndexStats: Record<string, KeyStatBucket> = {}

  const ensureBucket = (bucket: Record<string, KeyStatBucket>, key: string) => {
    if (!bucket[key]) {
      bucket[key] = { success: 0, failure: 0 }
    }
    return bucket[key]
  }

  const apis = usageData.apis || {}
  Object.values(apis as any).forEach((apiEntry: any) => {
    const models = apiEntry?.models || {}

    Object.values(models as any).forEach((modelEntry: any) => {
      const details = modelEntry?.details || []

      details.forEach((detail: any) => {
        const source = detail?.source || ''
        const authIndexKey = normalizeAuthIndex(detail?.auth_index)
        const isFailed = detail?.failed === true

        if (source) {
          const bucket = ensureBucket(sourceStats, source)
          if (isFailed) {
            bucket.failure += 1
          } else {
            bucket.success += 1
          }
        }

        if (authIndexKey) {
          const bucket = ensureBucket(authIndexStats, authIndexKey)
          if (isFailed) {
            bucket.failure += 1
          } else {
            bucket.success += 1
          }
        }
      })
    })
  })

  return {
    bySource: sourceStats,
    byAuthIndex: authIndexStats
  }
}

/**
 * 计算状态栏数据（最近1小时，分为20个5分钟的时间块）
 */
function calculateStatusBarData(
  usageDetails: UsageDetail[],
  authIndexFilter?: string | number
): StatusBarData {
  const BLOCK_COUNT = 20
  const BLOCK_DURATION_MS = 5 * 60 * 1000 // 5 minutes
  const HOUR_MS = 60 * 60 * 1000

  const now = Date.now()
  const hourAgo = now - HOUR_MS

  // Initialize blocks
  const blockStats: Array<{ success: number; failure: number }> = Array.from(
    { length: BLOCK_COUNT },
    () => ({ success: 0, failure: 0 })
  )

  let totalSuccess = 0
  let totalFailure = 0

  // Filter and bucket the usage details
  usageDetails.forEach((detail) => {
    const timestamp = Date.parse(detail.timestamp)
    if (Number.isNaN(timestamp) || timestamp < hourAgo || timestamp > now) {
      return
    }

    // Apply authIndex filter if provided
    if (authIndexFilter !== undefined) {
      const detailAuthIndex = normalizeAuthIndex(detail.auth_index)
      const filterKey = normalizeAuthIndex(authIndexFilter)
      if (detailAuthIndex !== filterKey) {
        return
      }
    }

    // Calculate which block this falls into (0 = oldest, 19 = newest)
    const ageMs = now - timestamp
    const blockIndex = BLOCK_COUNT - 1 - Math.floor(ageMs / BLOCK_DURATION_MS)

    if (blockIndex >= 0 && blockIndex < BLOCK_COUNT) {
      if (detail.failed) {
        blockStats[blockIndex].failure += 1
        totalFailure += 1
      } else {
        blockStats[blockIndex].success += 1
        totalSuccess += 1
      }
    }
  })

  // Convert stats to block states
  const blocks: StatusBlockState[] = blockStats.map((stat) => {
    if (stat.success === 0 && stat.failure === 0) {
      return 'idle'
    }
    if (stat.failure === 0) {
      return 'success'
    }
    if (stat.success === 0) {
      return 'failure'
    }
    return 'mixed'
  })

  // Calculate success rate
  const total = totalSuccess + totalFailure
  const successRate = total > 0 ? (totalSuccess / total) * 100 : 100

  return {
    blocks,
    successRate,
    totalSuccess,
    totalFailure
  }
}

export const useAuthStatsStore = defineStore('authStats', () => {
  // 存储 usage 原始数据
  const usageData = ref<any>(null)
  
  // 存储计算后的 keyStats
  const keyStats = ref<KeyStats>({ bySource: {}, byAuthIndex: {} })
  
  // 存储所有 usage details
  const usageDetails = ref<UsageDetail[]>([])
  
  // 加载状态
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)
  
  // 上次加载时间
  const lastLoadTime = ref<number>(0)
  
  // 缓存有效期（4分钟）
  const CACHE_EXPIRY_MS = 4 * 60 * 1000

  /**
   * 加载 usage 统计数据
   */
  const loadStats = async (force = false) => {
    // 如果缓存仍有效且非强制刷新，则跳过
    const now = Date.now()
    if (!force && loaded.value && now - lastLoadTime.value < CACHE_EXPIRY_MS) {
      return
    }

    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const res = await apiClient.get<any>('/usage').catch(() => null)
      if (res) {
        usageData.value = res.usage || res
        keyStats.value = computeKeyStats(usageData.value)
        usageDetails.value = collectUsageDetails(usageData.value)
        loaded.value = true
        lastLoadTime.value = now
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载统计数据失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据 authIndex 获取统计数据
   */
  const getStatsByAuthIndex = (authIndex: string | number | null | undefined): KeyStatBucket => {
    const key = normalizeAuthIndex(authIndex)
    if (!key) return { success: 0, failure: 0 }
    return keyStats.value.byAuthIndex[key] || { success: 0, failure: 0 }
  }

  /**
   * 根据 source (文件名) 获取统计数据
   */
  const getStatsBySource = (source: string): KeyStatBucket => {
    if (!source) return { success: 0, failure: 0 }
    
    // 尝试直接匹配
    if (keyStats.value.bySource[source]) {
      return keyStats.value.bySource[source]
    }
    
    // 尝试去掉扩展名匹配
    const nameWithoutExt = source.replace(/\.[^/.]+$/, '')
    if (nameWithoutExt && keyStats.value.bySource[nameWithoutExt]) {
      return keyStats.value.bySource[nameWithoutExt]
    }
    
    return { success: 0, failure: 0 }
  }

  /**
   * 获取认证文件的状态栏数据
   */
  const getStatusBarData = (authIndex: string | number | null | undefined): StatusBarData => {
    const key = normalizeAuthIndex(authIndex)
    if (!key || usageDetails.value.length === 0) {
      return {
        blocks: new Array(20).fill('idle') as StatusBlockState[],
        successRate: 100,
        totalSuccess: 0,
        totalFailure: 0
      }
    }
    return calculateStatusBarData(usageDetails.value, key)
  }

  /**
   * 计算成功率
   */
  const calculateSuccessRate = (stats: KeyStatBucket): number => {
    const total = stats.success + stats.failure
    return total > 0 ? (stats.success / total) * 100 : 100
  }

  /**
   * 检查是否有统计数据
   */
  const hasStatsData = computed(() => {
    return Object.keys(keyStats.value.byAuthIndex).length > 0 || Object.keys(keyStats.value.bySource).length > 0
  })

  return {
    usageData,
    keyStats,
    usageDetails,
    loading,
    loaded,
    error,
    hasStatsData,
    loadStats,
    getStatsByAuthIndex,
    getStatsBySource,
    getStatusBarData,
    calculateSuccessRate,
    normalizeAuthIndex
  }
})
