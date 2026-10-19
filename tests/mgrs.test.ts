import { describe, expect, it } from 'vitest'
import {
  MgrsError,
  mgrsToWgs84,
  wgs84ToMgrs,
  type MgrsErrorCode,
} from '../src/core/coords/mgrs.ts'

function expectMgrsError(run: () => unknown, code: MgrsErrorCode): void {
  try {
    run()
  } catch (error) {
    expect(error).toBeInstanceOf(MgrsError)
    expect((error as MgrsError).code).toBe(code)
    return
  }
  throw new Error(`توقعنا خطأ بالكود ${code} لكن الدالة نجحت`)
}

describe('تحويلات MGRS', () => {
  // المراجع من اختبارات مكتبة mgrs الرسمية (مبنية على GEOTRANS).
  it('يطابق المتجه الرسمي 33UXP0500444997', () => {
    expect(wgs84ToMgrs(48.24949, 16.4145)).toBe('33UXP0500444997')
  })

  it('يطابق متجه GEOTRANS 11SPA7234911844', () => {
    expect(wgs84ToMgrs(36.2361322, -115.0820944)).toBe('11SPA7234911844')
    const point = mgrsToWgs84('11SPA7234911844')
    expect(point.lat).toBeCloseTo(36.2361322, 4)
    expect(point.lon).toBeCloseTo(-115.0820944, 4)
  })

  it('يحوّل نقطة الرياض إلى 38RPN6945934271', () => {
    expect(wgs84ToMgrs(24.7136, 46.6753)).toBe('38RPN6945934271')
  })

  it('يعيد مركز الخلية عند التحويل العكسي', () => {
    const point = mgrsToWgs84('33UXP04')
    expect(point.lat).toBeCloseTo(48.24949, 5)
    expect(point.lon).toBeCloseTo(16.4145, 5)
  })

  it('يتقبل الفراغات ويحافظ على الدقة', () => {
    const compact = mgrsToWgs84('33UXP0500444997')
    const spaced = mgrsToWgs84('33UXP 0500 444997')
    expect(spaced.lat).toBeCloseTo(compact.lat, 9)
    expect(spaced.lon).toBeCloseTo(compact.lon, 9)
  })

  it('يعيد دورة كاملة بدقة المتر', () => {
    const reference = wgs84ToMgrs(24.7136, 46.6753)
    const back = mgrsToWgs84(reference)
    expect(back.lat).toBeCloseTo(24.7136, 4)
    expect(back.lon).toBeCloseTo(46.6753, 4)
  })

  it('يدعم دقة 0 (100 كم) و3 (100 م)', () => {
    expect(wgs84ToMgrs(24.7136, 46.6753, 0)).toBe('38RPN')
    expect(wgs84ToMgrs(24.7136, 46.6753, 3)).toBe('38RPN694342')
  })

  it('يرفض المراجع غير الصالحة والفراغ', () => {
    expectMgrsError(() => mgrsToWgs84(''), 'invalid-mgrs')
    expectMgrsError(() => mgrsToWgs84('ZZZZ'), 'invalid-mgrs')
    expectMgrsError(() => mgrsToWgs84('38RPN123'), 'invalid-mgrs')
  })

  it('يرفض خطوط العرض خارج النطاق ودقات غير صالحة', () => {
    expectMgrsError(() => wgs84ToMgrs(85, 46), 'out-of-range')
    expectMgrsError(() => wgs84ToMgrs(-81, 46), 'out-of-range')
    expectMgrsError(() => wgs84ToMgrs(24, 46, 6), 'invalid-precision')
    expectMgrsError(() => wgs84ToMgrs(24, 46, 2.5), 'invalid-precision')
    expectMgrsError(() => wgs84ToMgrs(24, 181), 'invalid-coordinate')
  })
})
