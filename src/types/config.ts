/**
 * 配置相关类型定义
 * 与基线 /config 返回结构保持一致（支持 kebab-case 和 camelCase）
 */

import type { GeminiKeyConfig, ProviderKeyConfig, OpenAIProviderConfig } from './provider';
import type { AmpcodeConfig } from './ampcode';

export interface QuotaExceededConfig {
  switchProject?: boolean;
  switchPreviewModel?: boolean;
}

export interface Config {
  debug?: boolean;
  // Backend uses kebab-case
  'proxy-url'?: string;
  'request-retry'?: number;
  'quota-exceeded'?: QuotaExceededConfig;
  'usage-statistics-enabled'?: boolean;
  'request-log'?: boolean;
  'logging-to-file'?: boolean;
  'logs-max-total-size-mb'?: number;
  'ws-auth'?: boolean;
  'force-model-prefix'?: boolean;
  'routing-strategy'?: string;
  'api-keys'?: string[];
  'gemini-api-key'?: GeminiKeyConfig[];
  'codex-api-key'?: ProviderKeyConfig[];
  'claude-api-key'?: ProviderKeyConfig[];
  'vertex-api-key'?: ProviderKeyConfig[];
  'openai-compatibility'?: OpenAIProviderConfig[];
  'oauth-excluded-models'?: Record<string, string[]>;
  // Legacy camelCase support
  proxyUrl?: string;
  requestRetry?: number;
  quotaExceeded?: QuotaExceededConfig;
  usageStatisticsEnabled?: boolean;
  requestLog?: boolean;
  loggingToFile?: boolean;
  logsMaxTotalSizeMb?: number;
  wsAuth?: boolean;
  forceModelPrefix?: boolean;
  routingStrategy?: string;
  apiKeys?: string[];
  ampcode?: AmpcodeConfig;
  geminiApiKeys?: GeminiKeyConfig[];
  codexApiKeys?: ProviderKeyConfig[];
  claudeApiKeys?: ProviderKeyConfig[];
  vertexApiKeys?: ProviderKeyConfig[];
  openaiCompatibility?: OpenAIProviderConfig[];
  oauthExcludedModels?: Record<string, string[]>;
  raw?: Record<string, any>;
}

export type RawConfigSection =
  | 'debug'
  | 'proxy-url'
  | 'request-retry'
  | 'quota-exceeded'
  | 'usage-statistics-enabled'
  | 'request-log'
  | 'logging-to-file'
  | 'logs-max-total-size-mb'
  | 'ws-auth'
  | 'force-model-prefix'
  | 'routing/strategy'
  | 'api-keys'
  | 'ampcode'
  | 'gemini-api-key'
  | 'codex-api-key'
  | 'claude-api-key'
  | 'vertex-api-key'
  | 'openai-compatibility'
  | 'oauth-excluded-models';

export interface ConfigCache {
  data: Config;
  timestamp: number;
}
