import { describe, expect, it } from 'vitest'
import { clampTooltipPosition } from '../src/features/map/tooltipPosition.ts'

describe('clampTooltipPosition — تثبيت التلميح داخل الخريطة (T4.1)', () => {
  it('يضع التلميح أسفل يمين المؤشر داخل الحدود', () => {
    expect(clampTooltipPosition(100, 100, 800, 600)).toEqual({
      left: 114,
      top: 114,
    })
  })

  it('يمنع تجاوز الحافة اليمنى', () => {
    expect(clampTooltipPosition(790, 100, 800, 600).left).toBe(576)
  })

  it('يمنع تجاوز الحافة السفلية', () => {
    expect(clampTooltipPosition(100, 590, 800, 600).top).toBe(528)
  })

  it('لا يخرج من الحاوية الصغيرة', () => {
    expect(clampTooltipPosition(0, 0, 100, 50)).toEqual({ left: 4, top: 4 })
  })
})
