// 时间段选项
export type PeriodValue = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'last90days'

// 筛选状态
export type FilterStatusValue = '__all__' | 'success' | 'failed'

// 请求状态类型
export type RequestStatus = 'pending' | 'streaming' | 'completed' | 'failed'

// 日期范围参数
export interface DateRangeParams {
  start_time?: string
  end_time?: string
}

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
}

// 筛选参数
export interface FilterParams {
  model?: string
  provider?: string
  success?: boolean
}

// 请求记录 - 适配 CLIProxyAPI 后端接口
export interface UsageRecord {
  id: number
  request_id: string
  timestamp: string
  ip: string
  api_key: string
  api_key_masked: string
  model: string
  provider: string
  is_streaming: boolean
  input_tokens: number
  output_tokens: number
  total_tokens: number
  duration_ms: number
  status_code: number
  success: boolean
  request_url?: string
  request_method?: string
  request_headers?: Record<string, string>
  request_body?: string
  response_headers?: Record<string, string>
  response_body?: string
}

// 模型统计
export interface ModelStatsItem {
  model: string
  provider: string
  request_count: number
  success_count: number
  failure_count: number
  input_tokens: number
  output_tokens: number
  total_tokens: number
  avg_duration_ms: number
}

// 提供商统计
export interface ProviderStatsItem {
  provider: string
  request_count: number
  success_count: number
  failure_count: number
  total_tokens: number
  avg_duration_ms: number
  model_count: number
}

// 使用概览
export interface UsageSummary {
  total_requests: number
  success_requests: number
  failure_requests: number
  success_rate: number
  total_tokens: number
  input_tokens: number
  output_tokens: number
  avg_duration_ms: number
  unique_models: number
  unique_providers: number
}

// 活跃度热力图日数据
export interface ActivityHeatmapDay {
  date: string
  requests: number
  total_tokens: number
}

// 活跃度热力图
export interface ActivityHeatmap {
  start_date: string
  end_date: string
  total_days: number
  max_requests: number
  days: ActivityHeatmapDay[]
}

// 请求时间线点
export interface RequestTimelinePoint {
  hour: string      // Format: "2006-01-02 15:00"
  requests: number  // Number of requests in this hour
  tokens: number    // Total tokens in this hour
}

// 请求时间线
export interface RequestTimeline {
  start_time: string
  end_time: string
  total_hours: number
  max_requests: number
  points: RequestTimelinePoint[]
}

// 筛选选项
export interface UsageRecordOptions {
  models: string[]
  providers: string[]
}

// 默认概览
export function createDefaultSummary(): UsageSummary {
  return {
    total_requests: 0,
    success_requests: 0,
    failure_requests: 0,
    success_rate: 0,
    total_tokens: 0,
    input_tokens: 0,
    output_tokens: 0,
    avg_duration_ms: 0,
    unique_models: 0,
    unique_providers: 0
  }
}
