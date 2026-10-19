import { describe, expect, it } from 'vitest'
import { focusAltitude } from '../src/features/map/useFlyTo.ts'

describe('focusAltitude — ارتفاع الكاميرا عند التركيز (T2.7)', () => {
  it('يستخدم الهامش الافتراضي عند غياب الارتفاع', () => {
    expect(focusAltitude()).toBe(2000)
  })

  it('يضيف الهامش فوق ارتفاع النقطة', () => {
    expect(focusAltitude(612)).toBe(2612)
  })

  it('لا ينزل تحت الهامش الأدنى', () => {
    expect(focusAltitude(-500)).toBe(2000)
  })
})
