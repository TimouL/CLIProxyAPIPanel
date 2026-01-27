export interface ModelInfo {
  name: string
  alias?: string
  description?: string
}

const MODEL_CATEGORIES: Array<{ id: string; label: string; patterns: RegExp[] }> = [
  { id: 'gpt', label: 'GPT', patterns: [/gpt/i, /\bo\d\b/i, /\bo\d+\.?/i, /\bchatgpt/i] },
  { id: 'claude', label: 'Claude', patterns: [/claude/i] },
  { id: 'gemini', label: 'Gemini', patterns: [/gemini/i, /\bgai\b/i] },
  { id: 'kimi', label: 'Kimi', patterns: [/kimi/i] },
  { id: 'qwen', label: 'Qwen', patterns: [/qwen/i] },
  { id: 'glm', label: 'GLM', patterns: [/glm/i, /chatglm/i] },
  { id: 'grok', label: 'Grok', patterns: [/grok/i] },
  { id: 'deepseek', label: 'DeepSeek', patterns: [/deepseek/i] }
]

function matchCategory(text: string): string | null {
  const haystack = text.toLowerCase()
  for (const category of MODEL_CATEGORIES) {
    if (category.patterns.some((pattern) => pattern.test(haystack))) {
      return category.id
    }
  }
  return null
}

export function normalizeModelList(payload: unknown, opts: { dedupe?: boolean } = {}): ModelInfo[] {
  const toModel = (entry: unknown): ModelInfo | null => {
    if (typeof entry === 'string') {
      const trimmed = entry.trim()
      return trimmed ? { name: trimmed } : null
    }
    if (!entry || typeof entry !== 'object') {
      return null
    }
    const raw = entry as Record<string, unknown>
    const name = raw.id ?? raw.name ?? raw.model ?? raw.value
    const normalizedName = typeof name === 'string' ? name.trim() : String(name ?? '').trim()
    if (!normalizedName) return null

    const aliasRaw = raw.alias ?? raw.display_name ?? raw.displayName
    const alias = typeof aliasRaw === 'string' ? aliasRaw.trim() : ''

    const descRaw = raw.description ?? raw.note ?? raw.comment
    const description = typeof descRaw === 'string' ? descRaw.trim() : ''

    const model: ModelInfo = { name: normalizedName }
    if (alias && alias !== normalizedName) {
      model.alias = alias
    }
    if (description) {
      model.description = description
    }
    return model
  }

  let entries: unknown[] = []
  if (Array.isArray(payload)) {
    entries = payload
  } else if (payload && typeof payload === 'object') {
    const raw = payload as Record<string, unknown>
    if (Array.isArray(raw.data)) entries = raw.data
    else if (Array.isArray(raw.models)) entries = raw.models
  }

  const normalized = entries.map(toModel).filter(Boolean) as ModelInfo[]
  if (!opts.dedupe) return normalized

  const seen = new Set<string>()
  return normalized.filter((model) => {
    const key = (model?.name || '').toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export interface ModelGroup {
  id: string
  label: string
  items: ModelInfo[]
}

export function classifyModels(models: ModelInfo[] = [], opts: { otherLabel?: string } = {}): ModelGroup[] {
  const otherLabel = opts.otherLabel ?? 'Other'
  const groups: ModelGroup[] = MODEL_CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    items: []
  }))
  const otherGroup: ModelGroup = { id: 'other', label: otherLabel, items: [] }

  models.forEach((model) => {
    const name = (model?.name || '').toString()
    const alias = (model?.alias || '').toString()
    const matched = matchCategory(`${name} ${alias}`)
    const target = matched ? groups.find((group) => group.id === matched) : null
    if (target) {
      target.items.push(model)
    } else {
      otherGroup.items.push(model)
    }
  })

  const populated = groups.filter((group) => group.items.length > 0)
  if (otherGroup.items.length) populated.push(otherGroup)
  return populated
}

