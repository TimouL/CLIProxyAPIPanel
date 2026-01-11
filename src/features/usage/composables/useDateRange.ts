import type { PeriodValue, DateRangeParams } from '../types'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

/**
 * 格式化日期为 ISO 格式
 */
function formatDateForApi(date: Date): string {
  return date.toISOString()
}

/**
 * 根据时间段值计算日期范围
 */
export function getDateRangeFromPeriod(period: PeriodValue): DateRangeParams {
  const now = new Date()
  let startDate: Date
  let endDate = new Date(now)

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'yesterday':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'last7days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'last30days':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'last90days':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    default:
      return {} // 返回空对象表示不过滤时间
  }

  return {
    start_time: formatDateForApi(startDate),
    end_time: formatDateForApi(endDate)
  }
}

/**
 * 格式化日期时间显示
 */
export function formatDateTime(dateStr: string): string {
  const d = dayjs.utc(dateStr).local()
  if (!d.isValid()) return dateStr
  return d.format('MM-DD HH:mm:ss')
}

/**
 * 格式化时分秒
 */
export function formatTime(dateStr: string): string {
  const d = dayjs.utc(dateStr).local()
  if (!d.isValid()) return dateStr
  return d.format('HH:mm:ss')
}

/**
 * 格式化 token 数量
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`
  }
  return String(tokens)
}

/**
 * 格式化耗时 (毫秒)
 */
export function formatDuration(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`
  }
  return `${ms}ms`
}
