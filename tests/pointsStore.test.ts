import { beforeEach, describe, expect, it } from 'vitest'
import type { GeoPoint } from '../src/core/geo/GeoPoint.ts'
import { usePointsStore } from '../src/store/usePointsStore.ts'

let sequence = 0

function buildPoint(overrides: Partial<GeoPoint> = {}): GeoPoint {
  sequence += 1
  return {
    id: `point-${sequence}`,
    lat: 24.7136,
    lon: 46.6753,
    source: 'manual',
    createdAt: new Date('2026-10-20T08:00:00.000Z'),
    ...overrides,
  }
}

function currentPoints(): GeoPoint[] {
  return usePointsStore.getState().points
}

function currentIds(): string[] {
  return currentPoints().map((point) => point.id)
}

beforeEach(() => {
  usePointsStore.setState({ points: [], selectedPointId: null })
})

describe('مخزن النقاط (usePointsStore)', () => {
  it('بعد التهيئة: مصفوفة فارغة وبلا اختيار', () => {
    expect(currentPoints()).toEqual([])
    expect(usePointsStore.getState().selectedPointId).toBeNull()
  })

  it('addPoint يلحق في النهاية دون تحوير الحالة السابقة', () => {
    const before = currentPoints()
    const pointA = buildPoint({ id: 'a' })
    const pointB = buildPoint({ id: 'b' })

    usePointsStore.getState().addPoint(pointA)
    usePointsStore.getState().addPoint(pointB)

    expect(currentPoints()).toEqual([pointA, pointB])
    expect(currentPoints()).not.toBe(before)
    expect(before).toEqual([])
  })

  it('removePoint يحذف المستهدف فقط ويتجاهل معرّفًا مجهولًا', () => {
    const pointA = buildPoint({ id: 'a' })
    const pointB = buildPoint({ id: 'b' })
    const pointC = buildPoint({ id: 'c' })
    usePointsStore.setState({ points: [pointA, pointB, pointC] })

    usePointsStore.getState().removePoint('b')
    expect(currentIds()).toEqual(['a', 'c'])

    usePointsStore.getState().removePoint('غير-موجود')
    expect(currentIds()).toEqual(['a', 'c'])
  })

  it('updatePoint يدمج التعديلات على المستهدف فقط', () => {
    const pointA = buildPoint({ id: 'a', label: 'الأول' })
    const pointB = buildPoint({ id: 'b' })
    usePointsStore.setState({ points: [pointA, pointB] })

    usePointsStore.getState().updatePoint('a', { label: 'محدّث', lat: 25.5 })

    const [updatedA, untouchedB] = currentPoints()
    expect(updatedA).toEqual({ ...pointA, label: 'محدّث', lat: 25.5 })
    expect(untouchedB).toBe(pointB)

    usePointsStore.getState().updatePoint('غير-موجود', { lat: 1 })
    expect(currentPoints()[1]).toBe(pointB)
    expect(currentPoints()[0].lat).toBe(25.5)
  })

  it('reorderPoints يعيد الترتيب حسب قائمة المعرّفات', () => {
    const pointA = buildPoint({ id: 'a' })
    const pointB = buildPoint({ id: 'b' })
    const pointC = buildPoint({ id: 'c' })
    usePointsStore.setState({ points: [pointA, pointB, pointC] })

    usePointsStore.getState().reorderPoints(['c', 'a', 'b'])

    expect(currentIds()).toEqual(['c', 'a', 'b'])
  })

  it('reorderPoints يتجاهل المعرّفات المجهولة', () => {
    const pointA = buildPoint({ id: 'a' })
    const pointB = buildPoint({ id: 'b' })
    const pointC = buildPoint({ id: 'c' })
    usePointsStore.setState({ points: [pointA, pointB, pointC] })

    usePointsStore.getState().reorderPoints(['b', 'غير-موجود', 'c'])

    expect(currentIds()).toEqual(['b', 'c'])
  })

  it('selectPoint يعيّن الاختيار ويُمسح بـnull', () => {
    usePointsStore.getState().selectPoint('a')
    expect(usePointsStore.getState().selectedPointId).toBe('a')

    usePointsStore.getState().selectPoint(null)
    expect(usePointsStore.getState().selectedPointId).toBeNull()
  })
})
