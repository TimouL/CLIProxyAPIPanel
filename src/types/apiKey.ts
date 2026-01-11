/**
 * API 密钥相关类型定义
 * 用于管理独立密钥界面
 * 数据存储在后端，不使用 localStorage
 */

/**
 * 后端返回的 API 密钥条目格式
 * 与后端 config.ApiKeyEntry 结构对应
 */
export interface ApiKeyEntry {
  /** 稳定唯一标识符 (UUID) */
  id?: string
  /** 密钥值 */
  'api-key': string
  /** 用户设置的名称 */
  name?: string
  /** 是否启用 */
  'is-active': boolean
  /** 使用次数统计 */
  'usage-count'?: number
  /** 输入Token消耗 */
  'input-tokens'?: number
  /** 输出Token消耗 */
  'output-tokens'?: number
  /** 最后使用时间 (ISO 格式) */
  'last-used-at'?: string
  /** 创建时间 (ISO 格式) */
  'created-at'?: string
}

/**
 * 从后端获取的原始 API 密钥格式
 * 支持向后兼容：string | ApiKeyEntry
 */
export type RawApiKey = string | ApiKeyEntry

/**
 * 完整的 API 密钥信息（用于前端显示）
 */
export interface ApiKeyInfo {
  /** 稳定唯一标识符 (UUID) */
  id: string
  /** 密钥值 */
  key: string
  /** 脱敏后的显示密钥 */
  keyDisplay: string
  /** 用户设置的名称 */
  name: string
  /** 是否启用 */
  isActive: boolean
  /** 使用次数统计 */
  usageCount: number
  /** 输入Token消耗 */
  inputTokens: number
  /** 输出Token消耗 */
  outputTokens: number
  /** 最后使用时间 (ISO 格式) */
  lastUsedAt: string | null
  /** 创建时间 (ISO 格式) */
  createdAt: string | null
}

/**
 * 添加/编辑密钥表单数据
 */
export interface ApiKeyFormData {
  /** 密钥值 */
  key: string
  /** 密钥名称 */
  name: string
}

/**
 * 密钥筛选选项
 */
export interface ApiKeyFilterOptions {
  /** 搜索关键词 */
  search: string
  /** 状态筛选: 'all' | 'active' | 'inactive' */
  status: 'all' | 'active' | 'inactive'
}
