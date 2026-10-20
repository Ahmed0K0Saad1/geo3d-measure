import { describe, expect, it } from 'vitest'
import type { GeoPoint } from '../src/core/geo/GeoPoint.ts'
import {
  segmentAt,
  segmentCount,
  segmentDegrees,
} from '../src/features/map/pathGeometry.ts'

function buildPoint(id: string, lat: number, lon: number): GeoPoint {
  return {
    id,
    lat,
    lon,
    source: 'manual',
    createdAt: new Date('2026-10-20T08:00:00.000Z'),
  }
}

const riyadh = buildPoint('riyadh', 24.7136, 46.6753)
const jeddah = buildPoint('jeddah', 21.4858, 39.1925)
const dammam = buildPoint('dammam', 26.4207, 50.0888)

describe('pathGeometry — مقاطع المسار (T4.2)', () => {
  it('عدد المقاطع = عدد النقاط − 1 ولا ينزل تحت صفر', () => {
    expect(segmentCount([])).toBe(0)
    expect(segmentCount([riyadh])).toBe(0)
    expect(segmentCount([riyadh, jeddah])).toBe(1)
    expect(segmentCount([riyadh, jeddah, dammam])).toBe(2)
  })

  it('يعيد طرفي المقطع الصحيح', () => {
    expect(segmentAt([riyadh, jeddah], 0)).toEqual({
      start: riyadh,
      end: jeddah,
    })
    expect(segmentAt([riyadh, jeddah, dammam], 1)).toEqual({
      start: jeddah,
      end: dammam,
    })
  })

  it('يرفض الفهارس غير الصالحة', () => {
    const points = [riyadh, jeddah, dammam]
    expect(segmentAt(points, -1)).toBeNull()
    expect(segmentAt(points, 2)).toBeNull()
    expect(segmentAt(points, 0.5)).toBeNull()
    expect(segmentAt([riyadh], 0)).toBeNull()
  })

  it('يبني مصفوفة الدرجات بترتيب lon/lat', () => {
    expect(segmentDegrees(riyadh, jeddah)).toEqual([
      riyadh.lon,
      riyadh.lat,
      jeddah.lon,
      jeddah.lat,
    ])
  })
})
