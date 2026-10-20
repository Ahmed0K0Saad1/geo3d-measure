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

function getPath(value: Record<string, unknown>, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (current, key) =>
        current && typeof current === 'object'
          ? (current as Record<string, unknown>)[key]
          : undefined,
      value,
    )
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

  it('يشمل مفاتيح P6 الأساسية في اللغتين', () => {
    const required = [
      'sessions.title',
      'sessions.save',
      'sessions.saveError',
      'export.title',
      'export.formats.geojson',
      'export.formats.kml',
      'export.formats.csv',
      'settings.title',
      'settings.distanceUnit',
      'settings.areaUnit',
      'settings.coordinateFormat',
      'settings.language',
      'settings.formats.DD',
      'settings.formats.MGRS',
      'results.units.mi',
      'results.units.ft',
    ]

    for (const path of required) {
      expect(getPath(ar, path), `مفتاح عربي مفقود: ${path}`).toEqual(
        expect.any(String),
      )
      expect(getPath(en, path), `مفتاح إنجليزي مفقود: ${path}`).toEqual(
        expect.any(String),
      )
    }
  })
})
