// 时间段选项
export type PeriodValue = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'last90days'

// 筛选状态
export type FilterStatusValue = '__all__' | 'error' | 'success'

// 日期范围参数
export interface DateRangeParams {
  start_time?: string
  end_time?: string
}