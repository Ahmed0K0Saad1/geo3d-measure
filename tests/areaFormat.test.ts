import { describe, expect, it } from 'vitest'
import {
  areaDifference,
  formatArea,
  formatPercent,
} from '../src/features/polygon/areaFormat.ts'

describe('تنسيق المساحة والفرق', () => {
  it('ينسّق الوحدات المترية والإمبراطورية بمنازل مناسبة', () => {
    const squareMeters = 448_363_292.3277

    expect(formatArea(squareMeters, 'm2')).toBe('448,363,292')
    expect(formatArea(squareMeters, 'ha')).toBe('44,836.329')
    expect(formatArea(squareMeters, 'km2')).toBe('448.363')
    expect(formatArea(squareMeters, 'ft2')).toBe('4,826,142,313')
    expect(formatArea(squareMeters, 'acre')).toBe('110,792.982')
    expect(formatArea(squareMeters, 'mi2')).toBe('173.1140')
  })

  it('ينسّق النسبة المئوية ويحدد القيم الضئيلة', () => {
    expect(formatPercent(0.42)).toBe('0.420')
    expect(formatPercent(-1.234)).toBe('1.234')
    expect(formatPercent(0.0004)).toBe('<0.001')
    expect(formatPercent(Number.NaN)).toBe('—')
  })

  it('يحسب فرق UTM الموقّع والاتجاه', () => {
    const geodesic = 112_134_777.66199112
    const utm = 112_122_299.73474121
    const difference = areaDifference(geodesic, utm)

    expect(difference).not.toBeNull()
    expect(difference!.direction).toBe('lower')
    expect(difference!.signedPercent).toBeCloseTo(-0.011125, 5)
    expect(difference!.absoluteSquareMeters).toBeCloseTo(12_477.927, 2)
  })

  it('يعيد equal للقيم المتطابقة وnull للقيم غير الصالحة', () => {
    expect(areaDifference(1000, 1000)?.direction).toBe('equal')
    expect(areaDifference(0, 1000)).toBeNull()
    expect(areaDifference(Number.NaN, 1000)).toBeNull()
  })
})
