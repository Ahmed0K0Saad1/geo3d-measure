import { describe, expect, it } from 'vitest'
import { geoPointDraftSchema, geoPointSchema } from '../src/lib/validators.ts'

const basePoint = {
  id: 'p-1',
  lat: 24.7136,
  lon: 46.6753,
  source: 'manual' as const,
  createdAt: new Date('2026-10-20T00:00:00Z'),
}

describe('مخططات zod للنقاط', () => {
  it('يقبل نقطة كاملة مطابقة لنموذج GeoPoint', () => {
    const result = geoPointSchema.safeParse({
      ...basePoint,
      height: 612,
      accuracy: 8,
      label: 'نقطة 1',
    })
    expect(result.success).toBe(true)
  })

  it('يقبل مسودة إحداثية بلا هوية أو وقت', () => {
    const result = geoPointDraftSchema.safeParse({
      lat: -33.8688,
      lon: 151.2093,
      source: 'utm',
    })
    expect(result.success).toBe(true)
  })

  it('يرفض خط عرض/طول خارج النطاق', () => {
    expect(geoPointSchema.safeParse({ ...basePoint, lat: 91 }).success).toBe(
      false,
    )
    expect(geoPointSchema.safeParse({ ...basePoint, lon: -181 }).success).toBe(
      false,
    )
  })

  it('يرفض المصدر غير المعتمد والهوية/الوقت الناقصين', () => {
    expect(
      geoPointSchema.safeParse({ ...basePoint, source: 'unknown' }).success,
    ).toBe(false)
    expect(
      geoPointSchema.safeParse({
        lat: 24,
        lon: 46,
        source: 'manual',
        createdAt: new Date(),
      }).success,
    ).toBe(false)
    expect(
      geoPointSchema.safeParse({ ...basePoint, createdAt: '2026-10-20' })
        .success,
    ).toBe(false)
  })

  it('يرفض هامش دقة سالبًا', () => {
    expect(
      geoPointSchema.safeParse({ ...basePoint, accuracy: -1 }).success,
    ).toBe(false)
  })
})
