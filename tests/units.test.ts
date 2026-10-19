import { describe, expect, it } from 'vitest'
import {
  feetToMeters,
  kilometersToMeters,
  metersToFeet,
  metersToKilometers,
  metersToMiles,
  metersToNauticalMiles,
  milesToMeters,
  nauticalMilesToMeters,
} from '../src/core/units/converters.ts'

describe('تحويلات وحدات المسافة', () => {
  it('يحول بين المتر والكيلومتر', () => {
    expect(metersToKilometers(1500)).toBe(1.5)
    expect(kilometersToMeters(1.5)).toBe(1500)
  })

  it('يحول الميل البحري بعامل 1852 م', () => {
    expect(metersToNauticalMiles(1852)).toBeCloseTo(1, 12)
    expect(nauticalMilesToMeters(1)).toBe(1852)
  })

  it('يحول الميل القانوني بعامل 1609.344 م', () => {
    expect(metersToMiles(1609.344)).toBeCloseTo(1, 12)
    expect(milesToMeters(1)).toBeCloseTo(1609.344, 12)
  })

  it('يحول القدم بعامل 0.3048 م', () => {
    expect(metersToFeet(0.3048)).toBeCloseTo(1, 12)
    expect(feetToMeters(1)).toBeCloseTo(0.3048, 12)
  })

  it('التحويل ذهابًا وإيابًا يعيد القيمة الأصلية', () => {
    const meters = 1234.567
    expect(feetToMeters(metersToFeet(meters))).toBeCloseTo(meters, 9)
    expect(milesToMeters(metersToMiles(meters))).toBeCloseTo(meters, 9)
    expect(nauticalMilesToMeters(metersToNauticalMiles(meters))).toBeCloseTo(
      meters,
      9,
    )
  })
})
