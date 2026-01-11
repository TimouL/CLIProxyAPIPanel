import { ref } from 'vue'
import type {
  AuthFileItem,
  AntigravityQuotaState,
  CodexQuotaState,
  GeminiCliQuotaState,
  ApiCallResponse,
  GeminiCliQuotaPayload,
  AntigravityModelsPayload,
  CodexUsagePayload,
  AntigravityQuotaGroup,
  CodexQuotaWindow,
  GeminiCliQuotaBucketState,
  AntigravityQuotaInfo,
  CodexUsageWindow,
  GeminiCliParsedBucket
} from '@/types'
import { apiCallApi, getApiCallErrorMessage } from '@/api/apiCall'
import {
  ANTIGRAVITY_QUOTA_URLS,
  ANTIGRAVITY_REQUEST_HEADERS,
  CODEX_USAGE_URL,
  CODEX_REQUEST_HEADERS,
  GEMINI_CLI_QUOTA_URL,
  GEMINI_CLI_REQUEST_HEADERS,
  normalizeAuthIndexValue,
  normalizeQuotaFraction,
  normalizeNumberValue,
  normalizeStringValue,
  ANTIGRAVITY_GROUPS,
  GEMINI_CLI_GROUPS,
  resolveCodexChatgptAccountId,
  resolveGeminiCliProjectId,
  resolveCodexPlanType,
  formatCodexResetLabel,
  isIgnoredGeminiCliModel
} from '@/utils/quota'

// =====================
// Parsing Functions
// =====================

function parseAntigravityPayload(payload: unknown): Record<string, unknown> | null {
  if (payload === undefined || payload === null) return null
  if (typeof payload === 'string') {
    const trimmed = payload.trim()
    if (!trimmed) return null
    try {
      return JSON.parse(trimmed) as Record<string, unknown>
    } catch {
      return null
    }
  }
  if (typeof payload === 'object') {
    return payload as Record<string, unknown>
  }
  return null
}

function parseCodexUsagePayload(payload: unknown): CodexUsagePayload | null {
  if (payload === undefined || payload === null) return null
  if (typeof payload === 'string') {
    const trimmed = payload.trim()
    if (!trimmed) return null
    try {
      return JSON.parse(trimmed) as CodexUsagePayload
    } catch {
      return null
    }
  }
  if (typeof payload === 'object') {
    return payload as CodexUsagePayload
  }
  return null
}

function parseGeminiCliQuotaPayload(payload: unknown): GeminiCliQuotaPayload | null {
  if (payload === undefined || payload === null) return null
  if (typeof payload === 'string') {
    const trimmed = payload.trim()
    if (!trimmed) return null
    try {
      return JSON.parse(trimmed) as GeminiCliQuotaPayload
    } catch {
      return null
    }
  }
  if (typeof payload === 'object') {
    return payload as GeminiCliQuotaPayload
  }
  return null
}

function normalizePlanType(value: unknown): string | null {
  const normalized = normalizeStringValue(value)
  return normalized ? normalized.toLowerCase() : null
}

// =====================
// Builder Functions for Antigravity
// =====================

function getAntigravityQuotaInfo(entry?: AntigravityQuotaInfo): {
  remainingFraction: number | null
  resetTime?: string
  displayName?: string
} {
  if (!entry) {
    return { remainingFraction: null }
  }
  const quotaInfo = entry.quotaInfo ?? entry.quota_info ?? {}
  const remainingValue =
    quotaInfo.remainingFraction ?? quotaInfo.remaining_fraction ?? quotaInfo.remaining
  const remainingFraction = normalizeQuotaFraction(remainingValue)
  const resetValue = quotaInfo.resetTime ?? quotaInfo.reset_time
  const resetTime = typeof resetValue === 'string' ? resetValue : undefined
  const displayName = typeof entry.displayName === 'string' ? entry.displayName : undefined

  return {
    remainingFraction,
    resetTime,
    displayName
  }
}

function findAntigravityModel(
  models: AntigravityModelsPayload,
  identifier: string
): { id: string; entry: AntigravityQuotaInfo } | null {
  // Direct lookup by key
  const direct = models[identifier]
  if (direct) {
    return { id: identifier, entry: direct }
  }

  // Fallback: look for displayName match
  const match = Object.entries(models).find(([, entry]) => {
    const name = typeof entry?.displayName === 'string' ? entry.displayName : ''
    return name.toLowerCase() === identifier.toLowerCase()
  })
  if (match) {
    return { id: match[0], entry: match[1] }
  }

  return null
}

function buildAntigravityQuotaGroups(models: AntigravityModelsPayload): AntigravityQuotaGroup[] {
  const groups: AntigravityQuotaGroup[] = []
  let geminiProResetTime: string | undefined

  for (const def of ANTIGRAVITY_GROUPS) {
    const matches = def.identifiers
      .map((identifier) => findAntigravityModel(models, identifier))
      .filter((entry): entry is { id: string; entry: AntigravityQuotaInfo } => Boolean(entry))

    const quotaEntries = matches
      .map(({ id, entry }) => {
        const info = getAntigravityQuotaInfo(entry)
        // If remainingFraction is null but resetTime exists, assume 0 (exhausted)
        const remainingFraction = info.remainingFraction ?? (info.resetTime ? 0 : null)
        if (remainingFraction === null) return null
        return {
          id,
          remainingFraction,
          resetTime: info.resetTime,
          displayName: info.displayName
        }
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

    if (quotaEntries.length === 0) continue

    const remainingFraction = Math.min(...quotaEntries.map((entry) => entry.remainingFraction))
    const resetTime = quotaEntries.map((entry) => entry.resetTime).find(Boolean)
    const displayName = quotaEntries.map((entry) => entry.displayName).find(Boolean)
    const label = def.labelFromModel && displayName ? displayName : def.label

    // Track gemini-3-pro reset time for image group
    if (def.id === 'gemini-3-pro') {
      geminiProResetTime = resetTime
    }

    // For image group, use gemini-pro reset time if not available
    const finalResetTime = def.id === 'gemini-image' ? (resetTime ?? geminiProResetTime) : resetTime

    groups.push({
      id: def.id,
      label,
      models: quotaEntries.map((entry) => entry.id),
      remainingFraction,
      resetTime: finalResetTime
    })
  }

  return groups
}

// =====================
// Builder Functions for Codex
// =====================

function formatCodexWindowResetLabel(window?: CodexUsageWindow | null): string {
  if (!window) return '-'
  return formatCodexResetLabel(
    normalizeNumberValue(window.reset_at ?? window.resetAt),
    normalizeNumberValue(window.reset_after_seconds ?? window.resetAfterSeconds)
  )
}

function buildCodexQuotaWindows(payload: CodexUsagePayload): CodexQuotaWindow[] {
  const rateLimit = payload.rate_limit ?? payload.rateLimit ?? undefined
  const codeReviewLimit = payload.code_review_rate_limit ?? payload.codeReviewRateLimit ?? undefined
  const windows: CodexQuotaWindow[] = []

  const addWindow = (
    id: string,
    label: string,
    window?: CodexUsageWindow | null,
    limitReached?: boolean,
    allowed?: boolean
  ) => {
    if (!window) return
    const resetLabel = formatCodexWindowResetLabel(window)
    const usedPercentRaw = normalizeNumberValue(window.used_percent ?? window.usedPercent)
    const isLimitReached = Boolean(limitReached) || allowed === false
    const usedPercent = usedPercentRaw ?? (isLimitReached && resetLabel !== '-' ? 100 : null)
    windows.push({
      id,
      label,
      usedPercent,
      resetLabel
    })
  }

  addWindow(
    'primary',
    '主要窗口',
    rateLimit?.primary_window ?? rateLimit?.primaryWindow,
    rateLimit?.limit_reached ?? rateLimit?.limitReached,
    rateLimit?.allowed
  )
  addWindow(
    'secondary',
    '次要窗口',
    rateLimit?.secondary_window ?? rateLimit?.secondaryWindow,
    rateLimit?.limit_reached ?? rateLimit?.limitReached,
    rateLimit?.allowed
  )
  addWindow(
    'code-review',
    '代码审查',
    codeReviewLimit?.primary_window ?? codeReviewLimit?.primaryWindow,
    codeReviewLimit?.limit_reached ?? codeReviewLimit?.limitReached,
    codeReviewLimit?.allowed
  )

  return windows
}

// =====================
// Builder Functions for Gemini CLI
// =====================

// Create lookup map from GEMINI_CLI_GROUPS
const GEMINI_CLI_GROUP_LOOKUP = new Map<string, { id: string; label: string }>()
for (const group of GEMINI_CLI_GROUPS) {
  for (const modelId of group.modelIds) {
    GEMINI_CLI_GROUP_LOOKUP.set(modelId, { id: group.id, label: group.label })
  }
}

function minNullableNumber(current: number | null, next: number | null): number | null {
  if (current === null) return next
  if (next === null) return current
  return Math.min(current, next)
}

function pickEarlierResetTime(current?: string, next?: string): string | undefined {
  if (!current) return next
  if (!next) return current
  const currentTime = new Date(current).getTime()
  const nextTime = new Date(next).getTime()
  if (Number.isNaN(currentTime)) return next
  if (Number.isNaN(nextTime)) return current
  return currentTime <= nextTime ? current : next
}

function buildGeminiCliQuotaBuckets(buckets: GeminiCliParsedBucket[]): GeminiCliQuotaBucketState[] {
  if (buckets.length === 0) return []

  const grouped = new Map<string, GeminiCliQuotaBucketState & { modelIds: string[] }>()

  buckets.forEach((bucket) => {
    if (isIgnoredGeminiCliModel(bucket.modelId)) return
    const group = GEMINI_CLI_GROUP_LOOKUP.get(bucket.modelId)
    const groupId = group?.id ?? bucket.modelId
    const label = group?.label ?? bucket.modelId
    const tokenKey = bucket.tokenType ?? ''
    const mapKey = `${groupId}::${tokenKey}`
    const existing = grouped.get(mapKey)

    if (!existing) {
      grouped.set(mapKey, {
        id: `${groupId}${tokenKey ? `-${tokenKey}` : ''}`,
        label,
        remainingFraction: bucket.remainingFraction,
        remainingAmount: bucket.remainingAmount,
        resetTime: bucket.resetTime,
        tokenType: bucket.tokenType,
        modelIds: [bucket.modelId]
      })
      return
    }

    existing.remainingFraction = minNullableNumber(
      existing.remainingFraction,
      bucket.remainingFraction
    )
    existing.remainingAmount = minNullableNumber(existing.remainingAmount, bucket.remainingAmount)
    existing.resetTime = pickEarlierResetTime(existing.resetTime, bucket.resetTime)
    existing.modelIds.push(bucket.modelId)
  })

  return Array.from(grouped.values()).map((bucket) => {
    const uniqueModelIds = Array.from(new Set(bucket.modelIds))
    return {
      id: bucket.id,
      label: bucket.label,
      remainingFraction: bucket.remainingFraction,
      remainingAmount: bucket.remainingAmount,
      resetTime: bucket.resetTime,
      tokenType: bucket.tokenType,
      modelIds: uniqueModelIds
    }
  })
}

// =====================
// Main Composable
// =====================

export function useQuota(file: AuthFileItem) {
  const loading = ref(false)
  const quotaState = ref<AntigravityQuotaState | CodexQuotaState | GeminiCliQuotaState | null>(null)

  // Initialize state based on type
  if (file.type === 'antigravity') {
    quotaState.value = { status: 'idle', groups: [] }
  } else if (file.type === 'codex') {
    quotaState.value = { status: 'idle', windows: [] }
  } else if (file.type === 'gemini-cli') {
    quotaState.value = { status: 'idle', buckets: [] }
  }

  const loadQuota = async () => {
    // Support both camelCase and snake_case field names
    const rawAuthIndex = file.authIndex ?? (file as Record<string, unknown>)['auth_index']
    if (!rawAuthIndex) return
    loading.value = true
    if (quotaState.value) quotaState.value.status = 'loading'
    
    // Clear previous error
    if (quotaState.value) {
      quotaState.value.error = undefined
      quotaState.value.errorStatus = undefined
    }

    try {
      const authIndex = normalizeAuthIndexValue(rawAuthIndex)
      if (!authIndex) {
        throw new Error('缺少认证索引')
      }
      
      if (file.type === 'antigravity') {
        await loadAntigravityQuota(authIndex)
      } else if (file.type === 'codex') {
        await loadCodexQuota(authIndex)
      } else if (file.type === 'gemini-cli') {
        await loadGeminiCliQuota(authIndex)
      }
    } catch (err: unknown) {
      if (quotaState.value) {
        quotaState.value.status = 'error'
        quotaState.value.error = err instanceof Error ? err.message : '未知错误'
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Antigravity: POST to multiple URLs with fallback
   * Response: { models: Record<string, AntigravityQuotaInfo> }
   */
  const loadAntigravityQuota = async (authIndex: string) => {
    let lastError = ''
    let lastStatus: number | undefined
    let priorityStatus: number | undefined
    let hadSuccess = false

    for (const url of ANTIGRAVITY_QUOTA_URLS) {
      try {
        const res = await apiCallApi.request({
          authIndex,
          method: 'POST',
          url,
          header: { ...ANTIGRAVITY_REQUEST_HEADERS },
          data: '{}'
        })

        if (res.statusCode < 200 || res.statusCode >= 300) {
          lastError = getApiCallErrorMessage(res)
          lastStatus = res.statusCode
          if (res.statusCode === 403 || res.statusCode === 404) {
            priorityStatus ??= res.statusCode
          }
          continue
        }

        hadSuccess = true
        const payload = parseAntigravityPayload(res.body ?? res.bodyText)
        const models = payload?.models

        // models should be an object map, not an array
        if (!models || typeof models !== 'object' || Array.isArray(models)) {
          lastError = '模型数据为空或格式错误'
          continue
        }

        const groups = buildAntigravityQuotaGroups(models as AntigravityModelsPayload)
        if (groups.length === 0) {
          lastError = '未找到配额信息'
          continue
        }

        if (quotaState.value && 'groups' in quotaState.value) {
          quotaState.value.groups = groups
          quotaState.value.status = 'success'
        }
        return
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : '未知错误'
      }
    }

    // All URLs failed
    if (hadSuccess) {
      // At least one request succeeded but couldn't parse, show empty
      if (quotaState.value && 'groups' in quotaState.value) {
        quotaState.value.groups = []
        quotaState.value.status = 'success'
      }
      return
    }

    throw new Error(lastError || '请求失败')
  }

  /**
   * Codex: GET with Chatgpt-Account-Id header
   * URL: https://chatgpt.com/backend-api/wham/usage
   */
  const loadCodexQuota = async (authIndex: string) => {
    // Resolve account ID from file
    const accountId = resolveCodexChatgptAccountId(file)
    if (!accountId) {
      throw new Error('缺少 ChatGPT 账户 ID')
    }

    const planTypeFromFile = resolveCodexPlanType(file)

    const requestHeader: Record<string, string> = {
      ...CODEX_REQUEST_HEADERS,
      'Chatgpt-Account-Id': accountId
    }

    const res = await apiCallApi.request({
      authIndex,
      method: 'GET',
      url: CODEX_USAGE_URL,
      header: requestHeader
    })

    if (res.statusCode < 200 || res.statusCode >= 300) {
      handleError(res)
      return
    }

    const payload = parseCodexUsagePayload(res.body ?? res.bodyText)
    if (!payload) {
      throw new Error('响应解析失败')
    }

    const planTypeFromUsage = normalizePlanType(payload.plan_type ?? payload.planType)
    const windows = buildCodexQuotaWindows(payload)

    if (quotaState.value && 'windows' in quotaState.value) {
      quotaState.value.windows = windows
      quotaState.value.planType = planTypeFromUsage ?? planTypeFromFile
      quotaState.value.status = 'success'
    }
  }

  /**
   * Gemini CLI: POST with { project: projectId } body
   * URL: https://cloudcode-pa.googleapis.com/v1internal:retrieveUserQuota
   */
  const loadGeminiCliQuota = async (authIndex: string) => {
    // Resolve project ID from file
    const projectId = resolveGeminiCliProjectId(file)
    if (!projectId) {
      throw new Error('缺少项目 ID')
    }

    const res = await apiCallApi.request({
      authIndex,
      method: 'POST',
      url: GEMINI_CLI_QUOTA_URL,
      header: { ...GEMINI_CLI_REQUEST_HEADERS },
      data: JSON.stringify({ project: projectId })
    })

    if (res.statusCode < 200 || res.statusCode >= 300) {
      handleError(res)
      return
    }

    const payload = parseGeminiCliQuotaPayload(res.body ?? res.bodyText)
    const rawBuckets = Array.isArray(payload?.buckets) ? payload?.buckets : []

    if (rawBuckets.length === 0) {
      if (quotaState.value && 'buckets' in quotaState.value) {
        quotaState.value.buckets = []
        quotaState.value.status = 'success'
      }
      return
    }

    // Parse raw buckets
    const parsedBuckets = rawBuckets
      .map((bucket) => {
        const modelId = normalizeStringValue(bucket.modelId ?? bucket.model_id)
        if (!modelId) return null
        const tokenType = normalizeStringValue(bucket.tokenType ?? bucket.token_type)
        const remainingFractionRaw = normalizeQuotaFraction(
          bucket.remainingFraction ?? bucket.remaining_fraction
        )
        const remainingAmount = normalizeNumberValue(bucket.remainingAmount ?? bucket.remaining_amount)
        const resetTime = normalizeStringValue(bucket.resetTime ?? bucket.reset_time) ?? undefined

        // Fallback fraction logic
        let fallbackFraction: number | null = null
        if (remainingAmount !== null) {
          fallbackFraction = remainingAmount <= 0 ? 0 : null
        } else if (resetTime) {
          fallbackFraction = 0
        }
        const remainingFraction = remainingFractionRaw ?? fallbackFraction

        return {
          modelId,
          tokenType,
          remainingFraction,
          remainingAmount,
          resetTime
        } as GeminiCliParsedBucket
      })
      .filter((bucket): bucket is GeminiCliParsedBucket => bucket !== null)

    const buckets = buildGeminiCliQuotaBuckets(parsedBuckets)

    if (quotaState.value && 'buckets' in quotaState.value) {
      quotaState.value.buckets = buckets
      quotaState.value.status = 'success'
    }
  }

  const handleError = (res: ApiCallResponse) => {
    if (quotaState.value) {
      quotaState.value.status = 'error'
      quotaState.value.error = getApiCallErrorMessage(res)
      quotaState.value.errorStatus = res.statusCode
    }
  }

  return {
    quotaState,
    loading,
    loadQuota
  }
}
