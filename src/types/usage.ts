/**
 * 使用统计相关类型
 * 基于原项目 src/modules/usage.js
 * 支持 kebab-case 和 snake_case 和 camelCase
 */

// 时间段类型
export type TimePeriod = 'hour' | 'day';

// 数据点
export interface DataPoint {
  timestamp: string;
  value: number;
}

// 模型使用统计
export interface ModelUsage {
  modelName?: string;
  'model-name'?: string;
  model_name?: string;
  requests: number;
  // Backend uses snake_case
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  // Legacy camelCase
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cost?: number;
}

// 使用统计数据
export interface UsageStats {
  overview: {
    // Backend uses snake_case
    total_requests?: number;
    total_tokens?: number;
    total_cost?: number;
    // Legacy camelCase
    totalRequests?: number;
    totalTokens?: number;
    totalCost?: number;
  };
  requestsData?: {
    hour: DataPoint[];
    day: DataPoint[];
  };
  requests_data?: {
    hour: DataPoint[];
    day: DataPoint[];
  };
  tokensData?: {
    hour: DataPoint[];
    day: DataPoint[];
  };
  tokens_data?: {
    hour: DataPoint[];
    day: DataPoint[];
  };
  costData?: {
    hour: DataPoint[];
    day: DataPoint[];
  };
  cost_data?: {
    hour: DataPoint[];
    day: DataPoint[];
  };
  modelStats?: ModelUsage[];
  model_stats?: ModelUsage[];
}

// 模型价格
export interface ModelPrice {
  modelName?: string;
  'model-name'?: string;
  model_name?: string;
  inputPricePer1M?: number;
  input_price_per_1m?: number;
  outputPricePer1M?: number;
  output_price_per_1m?: number;
}
