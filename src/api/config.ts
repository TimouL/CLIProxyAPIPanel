/**
 * 配置相关 API
 */

import { apiClient } from './client'
import type { Config } from '@/types/config'

export const configApi = {
  /**
   * 获取配置（会进行字段规范化）
   */
  async getConfig(): Promise<Config> {
    const raw = await apiClient.get('/config')
    return normalizeConfigResponse(raw)
  },

  /**
   * 获取原始配置（不做转换）
   */
  getRawConfig: () => apiClient.get('/config'),

  /**
   * 更新 Debug 模式
   */
  updateDebug: (enabled: boolean) => apiClient.put('/debug', { value: enabled }),

  /**
   * 更新代理 URL
   */
  updateProxyUrl: (proxyUrl: string) => apiClient.put('/proxy-url', { value: proxyUrl }),

  /**
   * 清除代理 URL
   */
  clearProxyUrl: () => apiClient.delete('/proxy-url'),

  /**
   * 更新重试次数
   */
  updateRequestRetry: (retryCount: number) => apiClient.put('/request-retry', { value: retryCount }),

  /**
   * 配额回退：切换项目
   */
  updateSwitchProject: (enabled: boolean) =>
    apiClient.put('/quota-exceeded/switch-project', { value: enabled }),

  /**
   * 配额回退：切换预览模型
   */
  updateSwitchPreviewModel: (enabled: boolean) =>
    apiClient.put('/quota-exceeded/switch-preview-model', { value: enabled }),

  /**
   * 使用统计开关
   */
  updateUsageStatistics: (enabled: boolean) =>
    apiClient.put('/usage-statistics-enabled', { value: enabled }),

  /**
   * 请求日志开关
   */
  updateRequestLog: (enabled: boolean) => apiClient.put('/request-log', { value: enabled }),

  /**
   * 写日志到文件开关
   */
  updateLoggingToFile: (enabled: boolean) => apiClient.put('/logging-to-file', { value: enabled }),

  /**
   * 获取日志总大小上限（MB）
   */
  async getLogsMaxTotalSizeMb(): Promise<number> {
    const data = await apiClient.get('/logs-max-total-size-mb')
    return data?.['logs-max-total-size-mb'] ?? data?.logsMaxTotalSizeMb ?? 0
  },

  /**
   * 更新日志总大小上限（MB）
   */
  updateLogsMaxTotalSizeMb: (sizeMb: number) =>
    apiClient.put('/logs-max-total-size-mb', { value: sizeMb }),

  /**
   * WebSocket 认证开关
   */
  updateWsAuth: (enabled: boolean) => apiClient.put('/ws-auth', { value: enabled }),

  /**
   * 获取强制模型前缀开关
   */
  async getForceModelPrefix(): Promise<boolean> {
    const data = await apiClient.get('/force-model-prefix')
    return Boolean(data?.['force-model-prefix'] ?? data?.forceModelPrefix)
  },

  /**
   * 更新强制模型前缀开关
   */
  updateForceModelPrefix: (enabled: boolean) =>
    apiClient.put('/force-model-prefix', { value: enabled }),

  /**
   * 获取路由策略
   */
  async getRoutingStrategy(): Promise<string> {
    const data = await apiClient.get('/routing/strategy')
    return data?.['routing/strategy'] ?? data?.routingStrategy ?? 'round-robin'
  },

  /**
   * 更新路由策略
   */
  updateRoutingStrategy: (strategy: string) =>
    apiClient.put('/routing/strategy', { value: strategy }),
}

/**
 * 规范化配置响应数据
 */
function normalizeConfigResponse(raw: any): Config {
  if (!raw || typeof raw !== 'object') {
    return { raw }
  }

  const config: Config = {
    debug: Boolean(raw.debug),
    proxyUrl: raw['proxy-url'] || raw.proxyUrl || undefined,
    requestRetry: typeof raw['request-retry'] === 'number' ? raw['request-retry'] : 
                  typeof raw.requestRetry === 'number' ? raw.requestRetry : undefined,
    quotaExceeded: raw['quota-exceeded'] || raw.quotaExceeded || undefined,
    usageStatisticsEnabled: Boolean(raw['usage-statistics-enabled'] ?? raw.usageStatisticsEnabled),
    requestLog: Boolean(raw['request-log'] ?? raw.requestLog),
    loggingToFile: Boolean(raw['logging-to-file'] ?? raw.loggingToFile),
    logsMaxTotalSizeMb: typeof raw['logs-max-total-size-mb'] === 'number' ? raw['logs-max-total-size-mb'] :
                        typeof raw.logsMaxTotalSizeMb === 'number' ? raw.logsMaxTotalSizeMb : undefined,
    wsAuth: Boolean(raw['ws-auth'] ?? raw.wsAuth),
    forceModelPrefix: Boolean(raw['force-model-prefix'] ?? raw.forceModelPrefix),
    routingStrategy: raw['routing/strategy'] || raw.routingStrategy || undefined,
    apiKeys: Array.isArray(raw['api-keys']) ? raw['api-keys'] : 
             Array.isArray(raw.apiKeys) ? raw.apiKeys : undefined,
    ampcode: raw.ampcode || undefined,
    geminiApiKeys: raw['gemini-api-key'] || raw.geminiApiKeys || undefined,
    codexApiKeys: raw['codex-api-key'] || raw.codexApiKeys || undefined,
    claudeApiKeys: raw['claude-api-key'] || raw.claudeApiKeys || undefined,
    vertexApiKeys: raw['vertex-api-key'] || raw.vertexApiKeys || undefined,
    openaiCompatibility: raw['openai-compatibility'] || raw.openaiCompatibility || undefined,
    oauthExcludedModels: raw['oauth-excluded-models'] || raw.oauthExcludedModels || undefined,
    raw
  }

  return config
}