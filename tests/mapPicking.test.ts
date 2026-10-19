import { Cartesian3 } from 'cesium'
import { describe, expect, it } from 'vitest'
import { cartesianToCoordinates } from '../src/features/map/mapPicking.ts'

function convert(lat: number, lon: number, height: number) {
  const result = cartesianToCoordinates(
    Cartesian3.fromDegrees(lon, lat, height),
  )
  if (result === null) {
    throw new Error('توقعنا إحداثيات صالحة لكن التحويل أعاد null')
  }
  return result
}

describe('تحويل نقطة Cesium إلى إحداثيات جغرافية (T2.5)', () => {
  it('يعيد lat/lon/height لنقطة الرياض', () => {
    const result = convert(24.7136, 46.6753, 612)
    expect(result.lat).toBeCloseTo(24.7136, 9)
    expect(result.lon).toBeCloseTo(46.6753, 9)
    expect(result.height).toBeCloseTo(612, 6)
  })

  it('يتعامل مع نصف الكرة الجنوبي وخط غرينتش', () => {
    const south = convert(-33.8688, 151.2093, 0)
    expect(south.lat).toBeCloseTo(-33.8688, 9)
    expect(south.lon).toBeCloseTo(151.2093, 9)

    const origin = convert(0, 0, 0)
    expect(origin.lat).toBeCloseTo(0, 9)
    expect(origin.lon).toBeCloseTo(0, 9)
    expect(origin.height).toBeCloseTo(0, 6)
  })

  it('يتعامل مع خط الطول 180 دون قلب الإشارة', () => {
    const result = convert(10, 180, 0)
    expect(result.lat).toBeCloseTo(10, 9)
    expect(Math.abs(result.lon)).toBeCloseTo(180, 9)
  })
})
