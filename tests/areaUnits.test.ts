import { describe, expect, it } from 'vitest'
import {
  acresToSquareMeters,
  convertArea,
  hectaresToSquareMeters,
  squareFeetToSquareMeters,
  squareKilometersToSquareMeters,
  squareMetersToAcres,
  squareMetersToHectares,
  squareMetersToSquareFeet,
  squareMetersToSquareKilometers,
  squareMetersToSquareMiles,
  squareMilesToSquareMeters,
} from '../src/core/units/areaConverters.ts'

describe('تحويلات وحدات المساحة', () => {
  it('يطابق التعريفات الدولية', () => {
    expect(hectaresToSquareMeters(1)).toBe(10_000)
    expect(squareKilometersToSquareMeters(1)).toBe(1_000_000)
    expect(squareFeetToSquareMeters(1)).toBeCloseTo(0.09290304, 12)
    expect(acresToSquareMeters(1)).toBeCloseTo(4046.8564224, 9)
    expect(squareMilesToSquareMeters(1)).toBeCloseTo(2_589_988.110336, 9)
  })

  it('يعيد التحويل العكسي', () => {
    expect(squareMetersToHectares(10_000)).toBe(1)
    expect(squareMetersToSquareKilometers(1_000_000)).toBe(1)
    expect(squareMetersToSquareFeet(0.09290304)).toBeCloseTo(1, 12)
    expect(squareMetersToAcres(4046.8564224)).toBeCloseTo(1, 12)
    expect(squareMetersToSquareMiles(2_589_988.110336)).toBeCloseTo(1, 12)
  })

  it('يحوّل عبر convertArea لكل الوحدات', () => {
    expect(convertArea(10_000, 'm2')).toBe(10_000)
    expect(convertArea(10_000, 'ha')).toBe(1)
    expect(convertArea(1_000_000, 'km2')).toBe(1)
    expect(convertArea(0.09290304, 'ft2')).toBeCloseTo(1, 12)
    expect(convertArea(4046.8564224, 'acre')).toBeCloseTo(1, 12)
    expect(convertArea(2_589_988.110336, 'mi2')).toBeCloseTo(1, 12)
  })
})
