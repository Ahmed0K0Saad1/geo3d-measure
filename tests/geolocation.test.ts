import { describe, expect, it } from 'vitest'
import {
  positionToGeoPoint,
  toGeolocationErrorCode,
} from '../src/features/points/geolocation.ts'

const COORDS = {
  latitude: 24.7136,
  longitude: 46.6753,
  altitude: 612.5,
  accuracy: 12.4,
}

describe('تحويل موقع GPS (geolocation)', () => {
  it('positionToGeoPoint يبني GeoPoint من إحداثيات المتصفح', () => {
    const createdAt = new Date('2026-10-20T12:00:00.000Z')
    const point = positionToGeoPoint(COORDS, {
      id: 'gps-1',
      createdAt,
      label: 'موقعي الحالي',
    })

    expect(point).toEqual({
      id: 'gps-1',
      lat: 24.7136,
      lon: 46.6753,
      height: 612.5,
      accuracy: 12.4,
      label: 'موقعي الحالي',
      source: 'gps',
      createdAt,
    })
  })

  it('height يصبح 0 عند غياب الارتفاع وlabel اختياري', () => {
    const point = positionToGeoPoint(
      { ...COORDS, altitude: null },
      { id: 'gps-2', createdAt: new Date() },
    )

    expect(point.height).toBe(0)
    expect(point.label).toBeUndefined()
  })

  it('toGeolocationErrorCode يترجم أكواد المتصفح الثلاثة', () => {
    expect(toGeolocationErrorCode(1)).toBe('permission-denied')
    expect(toGeolocationErrorCode(2)).toBe('position-unavailable')
    expect(toGeolocationErrorCode(3)).toBe('timeout')
  })

  it('toGeolocationErrorCode يعيد unknown لغير المعروف', () => {
    expect(toGeolocationErrorCode(99)).toBe('unknown')
  })
})
