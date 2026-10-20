import { describe, expect, it } from 'vitest'
import {
  buildSessionSnapshot,
  sessionSignature,
} from '../src/store/sessionSnapshot.ts'
import type { GeoPoint } from '../src/core/geo/GeoPoint.ts'
import type { AppSettings } from '../src/services/settingsTypes.ts'

const settings: AppSettings = {
  distanceUnit: 'km',
  areaUnit: 'ha',
  coordinateFormat: 'DD',
}

function point(overrides: Partial<GeoPoint> = {}): GeoPoint {
  return {
    id: 'p1',
    lat: 24.7136,
    lon: 46.6753,
    source: 'manual',
    createdAt: new Date('2026-10-20T08:00:00.000Z'),
    ...overrides,
  }
}

describe('لقطة الجلسة وبصمتها', () => {
  it('تشمل النقاط والمضلع والإعدادات بلا حقول إضافية', () => {
    const snapshot = buildSessionSnapshot(
      [point()],
      [
        { id: 'v1', lat: 24.6, lon: 46.6 },
        { id: 'v2', lat: 24.7, lon: 46.7 },
        { id: 'v3', lat: 24.8, lon: 46.8 },
      ],
      'closed',
      settings,
    )

    expect(snapshot.points).toHaveLength(1)
    expect(snapshot.polygon.closed).toBe(true)
    expect(snapshot.settings).toEqual(settings)
  })

  it('تعطي بصمة واحدة مهما اختلف ترتيب مفاتيح الكائن', () => {
    const a = buildSessionSnapshot([point()], [], 'idle', settings)
    const b = buildSessionSnapshot(
      [
        {
          createdAt: new Date('2026-10-20T08:00:00.000Z'),
          source: 'manual',
          lon: 46.6753,
          lat: 24.7136,
          id: 'p1',
        },
      ],
      [],
      'idle',
      settings,
    )

    expect(sessionSignature(a)).toBe(sessionSignature(b))
  })

  it('تتغير البصمة عند تعديل البيانات', () => {
    const base = buildSessionSnapshot([point()], [], 'idle', settings)
    const changed = buildSessionSnapshot(
      [point({ label: 'الرياض' })],
      [],
      'idle',
      settings,
    )

    expect(sessionSignature(base)).not.toBe(sessionSignature(changed))
  })
})
