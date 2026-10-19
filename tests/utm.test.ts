import { describe, expect, it } from 'vitest'
import {
  UtmError,
  formatUtm,
  utmToWgs84,
  utmZoneFor,
  wgs84ToUtm,
  type UtmErrorCode,
} from '../src/core/coords/utm.ts'

function expectUtmError(run: () => unknown, code: UtmErrorCode): void {
  try {
    run()
  } catch (error) {
    expect(error).toBeInstanceOf(UtmError)
    expect((error as UtmError).code).toBe(code)
    return
  }
  throw new Error(`توقعنا خطأ بالكود ${code} لكن الدالة نجحت`)
}

describe('تحويلات UTM (WGS84 ↔ EPSG:326xx/327xx)', () => {
  // القيم المرجعية من PROJ (pyproj 3.7.2) — مطابقة لمخرجات proj4js 2.22.0.
  it('يحوّل الرياض إلى 38N بالقيم المرجعية', () => {
    const result = wgs84ToUtm(24.7136, 46.6753)
    expect(result.zone).toBe(38)
    expect(result.hemisphere).toBe('N')
    expect(result.easting).toBeCloseTo(669459.622, 3)
    expect(result.northing).toBeCloseTo(2734271.672, 3)
  })

  it('يحوّل سيدني إلى نصف الكرة الجنوبي 56S', () => {
    const result = wgs84ToUtm(-33.8688, 151.2093)
    expect(result.zone).toBe(56)
    expect(result.hemisphere).toBe('S')
    expect(result.easting).toBeCloseTo(334368.634, 3)
    expect(result.northing).toBeCloseTo(6250948.345, 3)
  })

  it('يتعامل مع خط الطول 180 دون إنتاج منطقة 61', () => {
    expect(utmZoneFor(10, 180)).toBe(1)
    expect(utmZoneFor(10, -180)).toBe(1)
    const result = wgs84ToUtm(10, 180)
    expect(result.zone).toBe(1)
    expect(result.easting).toBeCloseTo(171071.264, 3)
    expect(result.northing).toBeCloseTo(1106908.854, 3)
  })

  it('يطبق الحالات الخاصة: النرويج 32V وسفالبارد 33X', () => {
    expect(utmZoneFor(60, 5)).toBe(32)
    expect(wgs84ToUtm(60, 5).easting).toBeCloseTo(276979.926, 3)
    expect(utmZoneFor(78, 20)).toBe(33)
    expect(wgs84ToUtm(78, 20).northing).toBeCloseTo(8663320.201, 3)
  })

  it('يعيد التحويل العكسي بدقة مناسبة', () => {
    const utm = wgs84ToUtm(24.7136, 46.6753)
    const back = utmToWgs84(utm.easting, utm.northing, utm.zone, utm.hemisphere)
    expect(back.lat).toBeCloseTo(24.7136, 6)
    expect(back.lon).toBeCloseTo(46.6753, 6)

    const south = wgs84ToUtm(-33.8688, 151.2093)
    const southBack = utmToWgs84(
      south.easting,
      south.northing,
      south.zone,
      south.hemisphere,
    )
    expect(southBack.lat).toBeCloseTo(-33.8688, 6)
    expect(southBack.lon).toBeCloseTo(151.2093, 6)
  })

  it('يرفض خطوط العرض خارج نطاق UTM (±80..84)', () => {
    expectUtmError(() => wgs84ToUtm(85, 46), 'out-of-range')
    expectUtmError(() => wgs84ToUtm(-81, 46), 'out-of-range')
    expectUtmError(() => wgs84ToUtm(91, 46), 'invalid-coordinate')
    expectUtmError(() => wgs84ToUtm(24, 181), 'invalid-coordinate')
  })

  it('يرفض مناطق وحدود Easting/Northing غير صالحة', () => {
    expectUtmError(() => utmToWgs84(500000, 2700000, 0, 'N'), 'invalid-zone')
    expectUtmError(() => utmToWgs84(500000, 2700000, 61, 'N'), 'invalid-zone')
    expectUtmError(() => utmToWgs84(500000, 2700000, 38.5, 'N'), 'invalid-zone')
    expectUtmError(() => utmToWgs84(-1, 2700000, 38, 'N'), 'out-of-range')
    expectUtmError(
      () => utmToWgs84(500000, 10_000_001, 38, 'N'),
      'out-of-range',
    )
    expectUtmError(
      () => utmToWgs84(Number.NaN, 2700000, 38, 'N'),
      'invalid-coordinate',
    )
  })

  it('يعرض UTM بصيغة مقروءة', () => {
    expect(
      formatUtm({
        easting: 669459.622,
        northing: 2734271.672,
        zone: 38,
        hemisphere: 'N',
      }),
    ).toBe('38N 669460E 2734272N')
  })
})
