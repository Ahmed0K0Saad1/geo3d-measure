import { describe, expect, it } from 'vitest'
import type { GeoPoint } from '../src/core/geo/GeoPoint.ts'
import {
  findAddedPoint,
  focusAltitude,
  frameAll,
  framePoints,
} from '../src/features/map/useFlyTo.ts'

function buildPoint(overrides: Partial<GeoPoint> = {}): GeoPoint {
  return {
    id: 'point',
    lat: 24.7136,
    lon: 46.6753,
    source: 'manual',
    createdAt: new Date('2026-10-20T08:00:00.000Z'),
    ...overrides,
  }
}

describe('focusAltitude — ارتفاع الكاميرا عند التركيز (T2.7)', () => {
  it('يستخدم الهامش الافتراضي عند غياب الارتفاع', () => {
    expect(focusAltitude()).toBe(2000)
  })

  it('يضيف الهامش فوق ارتفاع النقطة', () => {
    expect(focusAltitude(612)).toBe(2612)
  })

  it('لا ينزل تحت الهامش الأدنى', () => {
    expect(focusAltitude(-500)).toBe(2000)
  })
})

describe('findAddedPoint — كشف النقطة المضافة (T4.4)', () => {
  const pointA = buildPoint({ id: 'a' })
  const pointB = buildPoint({ id: 'b' })

  it('يعيد النقطة الجديدة وفهرسها', () => {
    expect(findAddedPoint(new Set(['a']), [pointA, pointB])).toEqual({
      index: 1,
      point: pointB,
    })
  })

  it('يكشف إضافة النقطة الأولى', () => {
    expect(findAddedPoint(new Set(), [pointA])).toEqual({
      index: 0,
      point: pointA,
    })
  })

  it('لا يعيد شيئًا عند تعديل النقاط أو إعادة ترتيبها أو حذفها', () => {
    expect(findAddedPoint(new Set(['a', 'b']), [pointB, pointA])).toBeNull()
    expect(findAddedPoint(new Set(['a', 'b']), [pointA])).toBeNull()
    expect(
      findAddedPoint(new Set(['a', 'b']), [
        pointA,
        { ...pointB, label: 'محدّث' },
      ]),
    ).toBeNull()
  })

  it('يعيد آخر نقطة مضافة عند إضافة أكثر من واحدة', () => {
    const pointC = buildPoint({ id: 'c' })
    expect(findAddedPoint(new Set(['a']), [pointA, pointB, pointC])).toEqual({
      index: 2,
      point: pointC,
    })
  })
})

describe('framePoints — تأطير مقطع في الكاميرا (T4.4)', () => {
  it('يضع الكاميرا عند منتصف الإحداثيات', () => {
    const a = buildPoint({ id: 'a', lat: 24, lon: 46 })
    const b = buildPoint({ id: 'b', lat: 26, lon: 48 })

    expect(framePoints(a, b)).toMatchObject({ lat: 25, lon: 47 })
  })

  it('يعالج منتصف خط التاريخ دون قفزة حول الأرض', () => {
    const a = buildPoint({ id: 'a', lat: 0, lon: 179 })
    const b = buildPoint({ id: 'b', lat: 0, lon: -179 })

    const frame = framePoints(a, b)
    expect(Math.abs(frame.lon)).toBe(180)
    expect(frame.lat).toBe(0)
  })

  it('لا ينزل تحت هامش التركيز للمسافات القصيرة', () => {
    const a = buildPoint({ id: 'a', lat: 24.7136, lon: 46.6753 })
    const b = buildPoint({ id: 'b', lat: 24.7137, lon: 46.6754 })

    expect(framePoints(a, b).altitude).toBe(2000)
  })

  it('يزيد الارتفاع مع المسافة', () => {
    const a = buildPoint({ id: 'a', lat: 24.7136, lon: 46.6753 })
    const near = buildPoint({ id: 'near', lat: 24.8, lon: 46.7 })
    const far = buildPoint({ id: 'far', lat: 21.4858, lon: 39.1925 })

    expect(framePoints(a, far).altitude).toBeGreaterThan(
      framePoints(a, near).altitude,
    )
  })

  it('يضيف ارتفاع الأرض إلى ارتفاع الكاميرا', () => {
    const a = buildPoint({ id: 'a', height: 1000 })
    const b = buildPoint({ id: 'b', height: 2000, lat: 24.7137, lon: 46.6754 })

    expect(framePoints(a, b).altitude).toBe(4000)
  })
})

describe('frameAll — تأطير جلسة مستعادة (T6.2)', () => {
  it('يعيد null لبيانات فارغة', () => {
    expect(frameAll([])).toBeNull()
  })

  it('يركز نقطة واحدة مع هامشها', () => {
    expect(frameAll([buildPoint({ id: 'a', height: 500 })])).toEqual({
      lat: 24.7136,
      lon: 46.6753,
      altitude: 2500,
    })
  })

  it('يوسّط كل النقاط ويرفع الكاميرا مع اتساع النطاق', () => {
    const riyadh = buildPoint({ id: 'a', lat: 24.7136, lon: 46.6753 })
    const jeddah = buildPoint({ id: 'b', lat: 21.4858, lon: 39.1925 })

    const frame = frameAll([riyadh, jeddah])

    expect(frame).not.toBeNull()
    expect(frame!.lat).toBeCloseTo(23.0997, 3)
    expect(frame!.lon).toBeCloseTo(42.9339, 3)
    expect(frame!.altitude).toBeGreaterThan(2000)
  })

  it('يعالج خط التاريخ دون قفزة حول الأرض', () => {
    const east = buildPoint({ id: 'a', lat: 0, lon: 179 })
    const west = buildPoint({ id: 'b', lat: 0, lon: -179 })

    const frame = frameAll([east, west])

    expect(frame).not.toBeNull()
    expect(Math.abs(frame!.lon)).toBe(180)
    expect(frame!.lat).toBe(0)
  })

  it('يستخدم أعلى ارتفاع أرضي', () => {
    const low = buildPoint({ id: 'a', height: 100 })
    const high = buildPoint({
      id: 'b',
      height: 3000,
      lat: 24.7137,
      lon: 46.6754,
    })

    expect(frameAll([low, high])!.altitude).toBe(5000)
  })
})
