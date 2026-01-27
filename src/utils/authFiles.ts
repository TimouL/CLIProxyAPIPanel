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

