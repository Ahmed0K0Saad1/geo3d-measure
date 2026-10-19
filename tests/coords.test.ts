import { describe, expect, it } from 'vitest'
import {
  CoordinateParseError,
  formatDD,
  formatDMS,
  parseCoordinate,
  parseDD,
  parseDMS,
  type CoordinateParseErrorCode,
} from '../src/core/coords/parsers.ts'

function expectParseError(
  run: () => unknown,
  code: CoordinateParseErrorCode,
): void {
  try {
    run()
  } catch (error) {
    expect(error).toBeInstanceOf(CoordinateParseError)
    expect((error as CoordinateParseError).code).toBe(code)
    return
  }
  throw new Error(`توقعنا خطأ بالكود ${code} لكن الدالة نجحت`)
}

describe('تحليل الإحداثيات اليدوية (parsers)', () => {
  it('parseDD يقرأ الدرجات العشرية الموجبة والسالبة', () => {
    expect(parseDD('24.7136')).toBe(24.7136)
    expect(parseDD('-74.0059722')).toBe(-74.0059722)
    expect(parseDD('+46.6753')).toBe(46.6753)
  })

  it('parseDD يرفض الصيغ غير الرقمية', () => {
    expectParseError(() => parseDD('24°42′'), 'invalid')
    expectParseError(() => parseDD(''), 'invalid')
  })

  it('parseDD يرفض ما يتجاوز ±180', () => {
    expectParseError(() => parseDD('181'), 'out-of-range')
  })

  it('parseDMS يقرأ الصيغة الرمزية بنصف كرة لاحق (مرجع الرياض)', () => {
    // 24°42′48.96″ = 24 + 42/60 + 48.96/3600 = 24.7136
    expect(parseDMS('24°42′48.96″N')).toBeCloseTo(24.7136, 6)
    // 46°40′31.08″ = 46 + 40/60 + 31.08/3600 = 46.6753
    expect(parseDMS('46d40\'31.08"E')).toBeCloseTo(46.6753, 6)
  })

  it('parseDMS يقرأ نصف الكرة البادئ والسالبة (S/W)', () => {
    expect(parseDMS('S24°42′48.96″')).toBeCloseTo(-24.7136, 6)
    expect(parseDMS('W46°40′31.08″')).toBeCloseTo(-46.6753, 6)
  })

  it('parseDMS يقرأ صيغة النقطتين (40:26:47)', () => {
    expect(parseDMS('40:26:47')).toBeCloseTo(40 + 26 / 60 + 47 / 3600, 6)
    expect(parseDMS('-74:0:21.5')).toBeCloseTo(-74.0059722, 5)
  })

  it('parseDMS يقرأ الصيغة المفصولة بمسافات مع نصف كرة', () => {
    expect(parseDMS('24 42 48.96 S')).toBeCloseTo(-24.7136, 6)
  })

  it('parseDMS يرفض الدقائق أو الثواني خارج [0,60)', () => {
    expectParseError(() => parseDMS('24°61′0″N'), 'invalid-minutes')
    expectParseError(() => parseDMS('24°42′60″N'), 'invalid-seconds')
  })

  it('parseDMS يرفض تعارض الإشارة مع نصف الكرة', () => {
    expectParseError(() => parseDMS('-74°0′21.5″E'), 'hemisphere-mismatch')
  })

  it('parseDMS يرفض ما يتجاوز ±180', () => {
    expectParseError(() => parseDMS('200°0′0″N'), 'out-of-range')
  })

  it('parseCoordinate يطبق النطاق المحوري (±90 للعرض)', () => {
    expect(parseCoordinate('90', 'lat')).toBe(90)
    expect(parseCoordinate('24°42′48.96″N', 'lat')).toBeCloseTo(24.7136, 6)
    expectParseError(() => parseCoordinate('91', 'lat'), 'out-of-range')
  })

  it('parseCoordinate يرفض اتجاهًا لا يناسب المحور', () => {
    expectParseError(
      () => parseCoordinate('46°40′31.08″N', 'lon'),
      'hemisphere-mismatch',
    )
    expect(parseCoordinate('46°40′31.08″E', 'lon')).toBeCloseTo(46.6753, 6)
  })

  it('formatDD يعرض ست منازل افتراضيًا', () => {
    expect(formatDD(24.7136)).toBe('24.713600')
    expect(formatDD(24.7136, 2)).toBe('24.71')
  })

  it('formatDMS يعرض لاحقة المحور الصحيحة', () => {
    expect(formatDMS(24.7136, 'lat')).toBe('24°42\'48.96" N')
    expect(formatDMS(-74.0059722222, 'lon')).toBe('74°0\'21.50" W')
    expect(formatDMS(46.6753)).toBe('46°40\'31.08"')
  })

  it('formatDMS يمنع ظهور 60 ثانية عند التقريب (حمل صحيح)', () => {
    expect(formatDMS(24.999999999, 'lat')).toBe('25°0\'0.00" N')
  })
})
