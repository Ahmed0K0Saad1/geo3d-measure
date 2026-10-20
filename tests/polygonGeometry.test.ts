import { describe, expect, it } from 'vitest'
import {
  isWithinPixels,
  polygonDegrees,
} from '../src/features/map/polygonGeometry.ts'

const vertices = [
  { lat: 24.6, lon: 46.6 },
  { lat: 24.6, lon: 46.8 },
  { lat: 24.8, lon: 46.8 },
]

describe('هندسة المضلع المساعدة', () => {
  it('يقارن المسافة بالبكسل', () => {
    expect(isWithinPixels({ x: 10, y: 10 }, { x: 16, y: 18 }, 10)).toBe(true)
    expect(isWithinPixels({ x: 10, y: 10 }, { x: 30, y: 10 }, 10)).toBe(false)
  })

  it('يبني درجات مفتوحة دون إغلاق', () => {
    expect(polygonDegrees(vertices, false)).toEqual([
      46.6, 24.6, 46.8, 24.6, 46.8, 24.8,
    ])
  })

  it('يغلق الحلقة بإضافة الرأس الأول', () => {
    expect(polygonDegrees(vertices, true)).toEqual([
      46.6, 24.6, 46.8, 24.6, 46.8, 24.8, 46.6, 24.6,
    ])
  })

  it('لا يغلق حلقة أقل من ثلاثة رؤوس', () => {
    expect(polygonDegrees(vertices.slice(0, 2), true)).toEqual([
      46.6, 24.6, 46.8, 24.6,
    ])
  })
})
