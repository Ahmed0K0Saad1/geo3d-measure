import { describe, expect, it } from 'vitest'
import { areaGeodesic } from '../src/core/geo/areaGeodesic.ts'
import type { AreaPoint } from '../src/core/geo/areaTypes.ts'
import fixtures from './fixtures/area-reference.json' with { type: 'json' }

function pointsOf(item: { lons: number[]; lats: number[] }): AreaPoint[] {
  return item.lons.map((lon, index) => ({
    lon,
    lat: item.lats[index],
  }))
}

function relativeDifference(actual: number, expected: number): number {
  return Math.abs(actual - expected) / Math.abs(expected)
}

describe('المساحة الجيوديسية (GeographicLib PolygonArea)', () => {
  it('يطابق مرجع PROJ لمربع الرياض 0.2°', () => {
    const reference = fixtures.cases.riyadhBox02
    const result = areaGeodesic(pointsOf(reference))

    expect(result).not.toBeNull()
    expect(
      relativeDifference(result!.squareMeters, reference.areaSquareMeters),
    ).toBeLessThan(1e-9)
    expect(
      relativeDifference(result!.perimeterMeters, reference.perimeterMeters),
    ).toBeLessThan(1e-12)
    expect(result!.methodKey).toBe('measure.method.geodesic')
  })

  it('يطابق مرجع PROJ لمربع الرياض 0.1°', () => {
    const reference = fixtures.cases.riyadhBox01
    const result = areaGeodesic(pointsOf(reference))

    expect(result).not.toBeNull()
    expect(
      relativeDifference(result!.squareMeters, reference.areaSquareMeters),
    ).toBeLessThan(1e-9)
  })

  it('يطابق مرجع PROJ لمثلث الرياض–جدة–الدمام', () => {
    const reference = fixtures.cases.ksaTriangle
    const result = areaGeodesic(pointsOf(reference))

    expect(result).not.toBeNull()
    expect(
      relativeDifference(result!.squareMeters, reference.areaSquareMeters),
    ).toBeLessThan(1e-9)
  })

  it('يعالج مضلعًا يعبر خط التاريخ الدولي', () => {
    const reference = fixtures.cases.antimeridianBox
    const result = areaGeodesic(pointsOf(reference))

    expect(result).not.toBeNull()
    expect(
      relativeDifference(result!.squareMeters, reference.areaSquareMeters),
    ).toBeLessThan(1e-9)
  })

  it('لا يتأثر باتجاه لف الرؤوس', () => {
    const reference = fixtures.cases.riyadhBox01
    const points = pointsOf(reference)
    const forward = areaGeodesic(points)
    const backward = areaGeodesic([...points].reverse())

    expect(forward).not.toBeNull()
    expect(backward).not.toBeNull()
    expect(
      relativeDifference(backward!.squareMeters, forward!.squareMeters),
    ).toBeLessThan(1e-12)
  })

  it('يتجاهل تكرار رأس الإغلاق صراحة', () => {
    const reference = fixtures.cases.riyadhBox01
    const points = pointsOf(reference)
    const withClosingPoint = [...points, points[0]]
    const result = areaGeodesic(withClosingPoint)

    expect(result).not.toBeNull()
    expect(
      relativeDifference(result!.squareMeters, reference.areaSquareMeters),
    ).toBeLessThan(1e-9)
  })

  it('يعيد صفرًا للمضلع المتدهور (رؤوس على خط الاستواء)', () => {
    const result = areaGeodesic([
      { lat: 0, lon: 0 },
      { lat: 0, lon: 1 },
      { lat: 0, lon: 2 },
    ])

    expect(result).not.toBeNull()
    expect(result!.squareMeters).toBeLessThan(1e-6)
  })

  it('يعيد null لأقل من ثلاث نقاط أو إحداثيات غير صالحة', () => {
    expect(areaGeodesic([])).toBeNull()
    expect(
      areaGeodesic([
        { lat: 24.6, lon: 46.6 },
        { lat: 24.7, lon: 46.7 },
      ]),
    ).toBeNull()
    expect(
      areaGeodesic([
        { lat: 91, lon: 46.6 },
        { lat: 24.7, lon: 46.7 },
        { lat: 24.8, lon: 46.8 },
      ]),
    ).toBeNull()
  })
})
