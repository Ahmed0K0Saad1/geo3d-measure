import { describe, expect, it } from 'vitest'
import {
  areaUtm,
  hasAntimeridianCrossing,
  shoelaceArea,
} from '../src/core/geo/areaUtm.ts'
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

describe('مساحة UTM + Shoelace', () => {
  it('يحسب Shoelace لمربع 1000×1000 م', () => {
    const square = [
      { easting: 0, northing: 0 },
      { easting: 1000, northing: 0 },
      { easting: 1000, northing: 1000 },
      { easting: 0, northing: 1000 },
    ]
    expect(shoelaceArea(square)).toBe(1_000_000)
    expect(shoelaceArea([...square].reverse())).toBe(1_000_000)
    expect(shoelaceArea(square.slice(0, 2))).toBe(0)
  })

  it('يكتشف عبور خط التاريخ', () => {
    expect(
      hasAntimeridianCrossing([
        { lat: 0, lon: 179.8 },
        { lat: 0, lon: -179.8 },
        { lat: 1, lon: -179.8 },
      ]),
    ).toBe(true)
    expect(
      hasAntimeridianCrossing([
        { lat: 0, lon: 46.6 },
        { lat: 0, lon: 46.8 },
        { lat: 1, lon: 46.8 },
      ]),
    ).toBe(false)
  })

  it('يطابق مرجع PROJ لمربع الرياض داخل منطقة واحدة', () => {
    const reference = fixtures.cases.utmRiyadhBox01
    const result = areaUtm(pointsOf(reference))

    expect(result).not.toBeNull()
    expect(result!.zone).toBe(reference.zone)
    expect(result!.hemisphere).toBe(reference.hemisphere)
    expect(result!.warnings).toEqual([])
    expect(
      relativeDifference(result!.squareMeters!, reference.areaSquareMeters),
    ).toBeLessThan(1e-6)
  })

  it('يبقى قريبًا من المساحة الجيوديسية ضمن تشوه الإسقاط', () => {
    const reference = fixtures.cases.riyadhBox01
    const result = areaUtm(pointsOf(reference))
    const geodesic = fixtures.cases.riyadhBox01.areaSquareMeters
    const relative = Math.abs(result!.squareMeters! - geodesic) / geodesic

    expect(relative).toBeLessThan(0.0005)
  })

  it('يحذر عند امتداد المضلع لأكثر من منطقة UTM', () => {
    const result = areaUtm(pointsOf(fixtures.cases.ksaTriangle))

    expect(result).not.toBeNull()
    expect(result!.squareMeters).not.toBeNull()
    expect(result!.warnings).toContain('multi-zone')
  })

  it('يوقف UTM عند عبور خط التاريخ', () => {
    const result = areaUtm(pointsOf(fixtures.cases.antimeridianBox))

    expect(result).not.toBeNull()
    expect(result!.squareMeters).toBeNull()
    expect(result!.warnings).toContain('antimeridian')
  })

  it('يوقف UTM عند عبور خط الاستواء', () => {
    const result = areaUtm(pointsOf(fixtures.cases.equatorBox))

    expect(result).not.toBeNull()
    expect(result!.squareMeters).toBeNull()
    expect(result!.warnings).toContain('multi-hemisphere')
  })

  it('يوقف UTM خارج نطاق 80°S–84°N', () => {
    const result = areaUtm([
      { lat: 85, lon: 10 },
      { lat: 85, lon: 11 },
      { lat: 85.2, lon: 10.5 },
    ])

    expect(result).not.toBeNull()
    expect(result!.squareMeters).toBeNull()
    expect(result!.warnings).toContain('outside-utm-range')
  })

  it('يعيد null لأقل من ثلاث نقاط', () => {
    expect(areaUtm([])).toBeNull()
    expect(
      areaUtm([
        { lat: 24.6, lon: 46.6 },
        { lat: 24.7, lon: 46.7 },
      ]),
    ).toBeNull()
  })
})
