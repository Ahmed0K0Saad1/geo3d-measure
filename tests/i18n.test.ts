import { describe, expect, it } from 'vitest'
import ar from '../src/i18n/ar.json' with { type: 'json' }
import en from '../src/i18n/en.json' with { type: 'json' }

function collectEntries(
  value: Record<string, unknown>,
  prefix = '',
): Array<[string, string]> {
  const entries: Array<[string, string]> = []
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof child === 'string') {
      entries.push([path, child])
    } else if (child && typeof child === 'object') {
      entries.push(...collectEntries(child as Record<string, unknown>, path))
    }
  }
  return entries
}

describe('موارد الترجمة', () => {
  it('ar و en لهما نفس المفاتيح وقيم غير فارغة', () => {
    const arEntries = collectEntries(ar)
    const enEntries = collectEntries(en)

    expect(arEntries.map(([key]) => key).sort()).toEqual(
      enEntries.map(([key]) => key).sort(),
    )
    for (const [key, text] of [...arEntries, ...enEntries]) {
      expect(text.trim(), `قيمة فارغة للمفتاح ${key}`).not.toBe('')
    }
  })
})
