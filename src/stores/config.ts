/**
 * 配置状态管理
 * 从 CPAMA 项目迁移并适配 Vue 3 + Pinia
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Config, RawConfigSection } from '@/types/config'
import { configApi } from '@/api/config'
import { CACHE_EXPIRY_MS } from '@/utils/constants'

interface ConfigCache {
  data: any
  timestamp: number
}

let configRequestToken = 0
let inFlightConfigRequest: { id: number; promise: Promise<Config> } | null = null

const SECTION_KEYS: RawConfigSection[] = [
  'debug',
  'proxy-url',
  'request-retry',
  'quota-exceeded',
  'usage-statistics-enabled',
  'request-log',
  'logging-to-file',
  'logs-max-total-size-mb',
  'ws-auth',
  'force-model-prefix',
  'routing/strategy',
  'api-keys',
  'ampcode',
  'gemini-api-key',
  'codex-api-key',
  'claude-api-key',
  'vertex-api-key',
  'openai-compatibility',
  'oauth-excluded-models'
]

const extractSectionValue = (config: Config | null, section?: RawConfigSection) => {
  if (!config) return undefined
  switch (section) {
    case 'debug':
      return config.debug
    case 'proxy-url':
      return config.proxyUrl
    case 'request-retry':
      return config.requestRetry
    case 'quota-exceeded':
      return config.quotaExceeded
    case 'usage-statistics-enabled':
      return config.usageStatisticsEnabled
    case 'request-log':
      return config.requestLog
    case 'logging-to-file':
      return config.loggingToFile
    case 'logs-max-total-size-mb':
      return config.logsMaxTotalSizeMb
    case 'ws-auth':
      return config.wsAuth
    case 'force-model-prefix':
      return config.forceModelPrefix
    case 'routing/strategy':
      return config.routingStrategy
    case 'api-keys':
      return config.apiKeys
    case 'ampcode':
      return config.ampcode
    case 'gemini-api-key':
      return config.geminiApiKeys
    case 'codex-api-key':
      return config.codexApiKeys
    case 'claude-api-key':
      return config.claudeApiKeys
    case 'vertex-api-key':
      return config.vertexApiKeys
    case 'openai-compatibility':
      return config.openaiCompatibility
    case 'oauth-excluded-models':
      return config.oauthExcludedModels
    default:
      if (!section) return undefined
      return config.raw?.[section]
  }
}

export const useConfigStore = defineStore('config', () => {
  const config = ref<Config | null>(null)
  const cache = ref<Map<string, ConfigCache>>(new Map())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  /**
   * 检查缓存是否有效
   */
  const isCacheValid = (section?: RawConfigSection): boolean => {
    const key = section || 'config'
    const cached = cache.value.get(key)
    if (!cached) return false
    return Date.now() - cached.timestamp < CACHE_EXPIRY_MS
  }

  /**
   * 清除缓存
   */
  const clearCache = (section?: RawConfigSection): void => {
    if (section) {
      cache.value.delete(section)
    } else {
      cache.value.clear()
    }
  }

  /**
   * 获取配置
   */
  const fetchConfig = async (section?: RawConfigSection, forceRefresh = false): Promise<Config | any> => {
    const key = section || 'config'
    
    // 检查缓存
    if (!forceRefresh && isCacheValid(section)) {
      const cached = cache.value.get(key)
      if (cached) {
        if (section) {
          return cached.data
        } else {
          config.value = cached.data
          return cached.data
        }
      }
    }

    // 如果是获取完整配置且有正在进行的请求，复用该请求
    if (!section && inFlightConfigRequest) {
      return inFlightConfigRequest.promise
    }

    loading.value = true
    error.value = null

    try {
      const currentToken = ++configRequestToken
      let promise: Promise<Config>

      if (section) {
        // 获取特定配置段
        const fullConfig = await configApi.getConfig()
        const sectionValue = extractSectionValue(fullConfig, section)
        
        // 缓存结果
        cache.value.set(key, {
          data: sectionValue,
          timestamp: Date.now()
        })
        
        return sectionValue
      } else {
        // 获取完整配置
        promise = configApi.getConfig()
        inFlightConfigRequest = { id: currentToken, promise }

        const result = await promise

        // 只有当前请求才更新状态
        if (currentToken === configRequestToken) {
          config.value = result
          
          // 缓存结果
          cache.value.set(key, {
            data: result,
            timestamp: Date.now()
          })
          
          inFlightConfigRequest = null
        }

        return result
      }
    } catch (err: any) {
      error.value = err?.message || 'Failed to fetch config'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新配置值
   */
  const updateConfigValue = (section: RawConfigSection, value: any): void => {
    if (!config.value) return

    const newConfig = { ...config.value }
    
    switch (section) {
      case 'debug':
        newConfig.debug = value
        break
      case 'proxy-url':
        newConfig.proxyUrl = value
        break
      case 'request-retry':
        newConfig.requestRetry = value
        break
      case 'quota-exceeded':
        newConfig.quotaExceeded = value
        break
      case 'usage-statistics-enabled':
        newConfig.usageStatisticsEnabled = value
        break
      case 'request-log':
        newConfig.requestLog = value
        break
      case 'logging-to-file':
        newConfig.loggingToFile = value
        break
      case 'logs-max-total-size-mb':
        newConfig.logsMaxTotalSizeMb = value
        break
      case 'ws-auth':
        newConfig.wsAuth = value
        break
      case 'force-model-prefix':
        newConfig.forceModelPrefix = value
        break
      case 'routing/strategy':
        newConfig.routingStrategy = value
        break
      case 'api-keys':
        newConfig.apiKeys = value
        break
      case 'ampcode':
        newConfig.ampcode = value
        break
      case 'gemini-api-key':
        newConfig.geminiApiKeys = value
        break
      case 'codex-api-key':
        newConfig.codexApiKeys = value
        break
      case 'claude-api-key':
        newConfig.claudeApiKeys = value
        break
      case 'vertex-api-key':
        newConfig.vertexApiKeys = value
        break
      case 'openai-compatibility':
        newConfig.openaiCompatibility = value
        break
      case 'oauth-excluded-models':
        newConfig.oauthExcludedModels = value
        break
      default:
        if (newConfig.raw) {
          newConfig.raw[section] = value
        }
        break
    }

    config.value = newConfig
    
    // 清除相关缓存
    clearCache(section)
    clearCache() // 清除完整配置缓存
  }

  return {
    // State
    config,
    loading: isLoading,
    error: hasError,
    
    // Actions
    fetchConfig,
    updateConfigValue,
    clearCache,
    isCacheValid
  }
})