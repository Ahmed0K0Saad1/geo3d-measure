import { describe, expect, it } from 'vitest'
import { formatPoint } from '../src/core/coords/formatPoint.ts'

const riyadh = { lat: 24.7136, lon: 46.6753 }

describe('formatPoint — صيغ عرض الإحداثيات (T6.4)', () => {
  it('يعرض DD بخمس منازل', () => {
    expect(formatPoint(riyadh, 'DD')).toBe('24.71360, 46.67530')
  })

  it('يعرض DMS مع نصف الكرة', () => {
    expect(formatPoint(riyadh, 'DMS')).toBe('24°42\'48.96" N 46°40\'31.08" E')
    expect(formatPoint({ lat: -33.8688, lon: 151.2093 }, 'DMS')).toContain('S')
  })

  it('يعرض UTM وMGRS بقيم الرياض المرجعية', () => {
    expect(formatPoint(riyadh, 'UTM')).toBe('38N 669460E 2734272N')
    expect(formatPoint(riyadh, 'MGRS')).toBe('38RPN6945934271')
  })

  it('يعود إلى DMS عند خروج النقطة من نطاق UTM/MGRS', () => {
    const polar = { lat: 85, lon: 10 }
    const dms = formatPoint(polar, 'DMS')

    expect(formatPoint(polar, 'UTM')).toBe(dms)
    expect(formatPoint(polar, 'MGRS')).toBe(dms)
  })
})
