import { describe, expect, it } from 'vitest'

import { classifyModels, normalizeModelList } from './models'

describe('normalizeModelList', () => {
  it('normalizes OpenAI-like payloads and dedupes', () => {
    const payload = {
      data: [
        { id: 'gpt-4o' },
        { id: 'gpt-4o' },
        'claude-3-5-sonnet',
        { name: 'gemini-2.0-flash', display_name: 'Gemini Flash' }
      ]
    }

    const models = normalizeModelList(payload, { dedupe: true })
    expect(models.map((m) => m.name)).toEqual(['gpt-4o', 'claude-3-5-sonnet', 'gemini-2.0-flash'])
    expect(models.find((m) => m.name === 'gemini-2.0-flash')?.alias).toBe('Gemini Flash')
  })
})

describe('classifyModels', () => {
  it('groups common model families', () => {
    const groups = classifyModels(
      [
        { name: 'gpt-4o' },
        { name: 'claude-3-5-sonnet' },
        { name: 'gemini-2.0-flash' },
        { name: 'unknown-model' }
      ],
      { otherLabel: '其他' }
    )

    expect(groups.map((g) => g.id)).toEqual(['gpt', 'claude', 'gemini', 'other'])
    expect(groups.find((g) => g.id === 'other')?.label).toBe('其他')
  })
})

