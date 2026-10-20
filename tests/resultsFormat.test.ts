import { describe, expect, it } from 'vitest'
import {
  convertDistance,
  formatBearing,
  formatDistance,
} from '../src/features/points/resultsFormat.ts'

describe('resultsFormat — عرض المسافات والاتجاهات (T4.3)', () => {
  it('يحوّل الأمتار إلى الوحدات الثلاث', () => {
    expect(convertDistance(1000, 'm')).toBe(1000)
    expect(convertDistance(1000, 'km')).toBe(1)
    expect(convertDistance(1852, 'nm')).toBe(1)
  })

  it('ينسّق المسافة بمنازل الوحدة', () => {
    expect(formatDistance(1000, 'km')).toBe('1.000')
    expect(formatDistance(1852, 'nm')).toBe('1.000')
    expect(formatDistance(123.456, 'm')).toBe('123.5')
    expect(formatDistance(0, 'km')).toBe('0.000')
  })

  it('ينسّق الاتجاه بمنزلة عشرية', () => {
    expect(formatBearing(0)).toBe('0.0°')
    expect(formatBearing(42.91642)).toBe('42.9°')
    expect(formatBearing(138.89027)).toBe('138.9°')
  })

  it('يطبّع الاتجاه بعد التقريب بدل إظهار 360', () => {
    expect(formatBearing(359.96)).toBe('0.0°')
    expect(formatBearing(360)).toBe('0.0°')
    expect(formatBearing(-0.04)).toBe('0.0°')
  })
})
