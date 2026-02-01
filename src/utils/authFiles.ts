function isDisabledFlag(value: unknown): boolean {
  if (value === true) return true
  if (value === false || value === null || value === undefined) return false

  // Be tolerant to slightly inconsistent backends / persisted values.
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') return true
    if (normalized === 'false' || normalized === '') return false
  }

  if (typeof value === 'number') {
    if (value === 1) return true
    if (value === 0) return false
  }

  return false
}

// Stable ordering: enabled first, disabled last; preserves relative order inside each group.
export function sortAuthFilesEnabledFirst<T extends { disabled?: unknown }>(items: readonly T[]): T[] {
  const enabled: T[] = []
  const disabled: T[] = []

  for (const item of items) {
    if (isDisabledFlag(item.disabled)) {
      disabled.push(item)
    } else {
      enabled.push(item)
    }
  }

  return enabled.concat(disabled)
}

// Stable ordering: enabled first, disabled last; within each group sort by tier priority.
// Uses the provided tier resolver to keep this helper UI-agnostic.
export function sortAuthFilesEnabledFirstThenByTier<T extends { disabled?: unknown }>(
  items: readonly T[],
  tierOf: (item: T) => string | null | undefined,
  tierOrder: readonly string[] = ['ultra', 'pro', 'free']
): T[] {
  const enabled: T[] = []
  const disabled: T[] = []

  for (const item of items) {
    if (isDisabledFlag(item.disabled)) {
      disabled.push(item)
    } else {
      enabled.push(item)
    }
  }

  const normalizedOrder = tierOrder.map((entry) => entry.trim().toLowerCase()).filter(Boolean)

  const tierIndex = (item: T): number => {
    const raw = tierOf(item)
    if (typeof raw !== 'string') return normalizedOrder.length
    const key = raw.trim().toLowerCase()
    const idx = normalizedOrder.indexOf(key)
    return idx === -1 ? normalizedOrder.length : idx
  }

  const sortGroup = (group: readonly T[]): T[] => {
    const buckets: T[][] = Array.from({ length: normalizedOrder.length + 1 }, () => [])
    for (const item of group) {
      buckets[tierIndex(item)].push(item)
    }
    return buckets.flat()
  }

  return sortGroup(enabled).concat(sortGroup(disabled))
}
