import { describe, expect, it } from 'vitest'
import type { GeoPoint } from '../src/core/geo/GeoPoint.ts'
import { HaversineStrategy } from '../src/core/geo/haversine.ts'
import { computePath } from '../src/core/geo/path.ts'
import { StrategyRegistry } from '../src/core/geo/registry.ts'
import type { DistanceStrategy } from '../src/core/geo/strategy.ts'
import references from './fixtures/geodesic-reference.json' with { type: 'json' }

interface ReferenceCoordinate {
  lat: number
  lon: number
}

interface GeodesicReferenceCase {
  name: string
  from: ReferenceCoordinate
  to: ReferenceCoordinate
  geodesicMeters: number
  geodesicInitialBearingDeg?: number
  geodesicFinalBearingDeg?: number
}

interface GeodesicReferenceFixture {
  source: string
  tolerancePercent: number
  bearingToleranceDeg: number
  cases: GeodesicReferenceCase[]
}

// JSON المستورد يأتي بنوع واسع من TS؛ الشكل محروس بهذه الواجهات (بلا any).
const reference = references as GeodesicReferenceFixture

const dummyPoint: GeoPoint = {
  id: 'p1',
  lat: 24.7136,
  lon: 46.6753,
  source: 'manual',
  createdAt: new Date('2026-10-20T00:00:00Z'),
}

function createStrategy(id: string, meters = 1): DistanceStrategy {
  return {
    id,
    labelKey: `measure.method.${id}`,
    compute: () => ({
      meters,
      initialBearingDeg: 0,
      finalBearingDeg: 0,
      method: id,
    }),
  }
}

describe('StrategyRegistry', () => {
  it('يسجل الاستراتيجيات ويجلبها ويعيد قائمتها', () => {
    const registry = new StrategyRegistry()
    const haversine = createStrategy('haversine')
    const vincenty = createStrategy('vincenty')

    registry.register(haversine)
    registry.register(vincenty)

    expect(registry.get('haversine')).toBe(haversine)
    expect(registry.get('vincenty')).toBe(vincenty)
    expect(registry.list()).toEqual([haversine, vincenty])
    expect(
      registry.get('haversine')?.compute(dummyPoint, dummyPoint).meters,
    ).toBe(1)
  })

  it('يعيد undefined لمعرّف غير مسجل', () => {
    const registry = new StrategyRegistry()

    expect(registry.get('missing')).toBeUndefined()
    expect(registry.list()).toEqual([])
  })

  it('آخر تسجيل لنفس المعرّف يستبدل السابق', () => {
    const registry = new StrategyRegistry()
    const first = createStrategy('haversine', 1)
    const second = createStrategy('haversine', 2)

    registry.register(first)
    registry.register(second)

    expect(registry.list()).toHaveLength(1)
    expect(registry.get('haversine')).toBe(second)
  })
})

const strategy = new HaversineStrategy()

function point(id: string, lat: number, lon: number): GeoPoint {
  return {
    id,
    lat,
    lon,
    source: 'manual',
    createdAt: new Date('2026-10-20T00:00:00Z'),
  }
}

describe('HaversineStrategy — المسافة', () => {
  it('يحمل معرّف المنهجية في النتيجة (FR-14)', () => {
    const result = strategy.compute(
      point('1', 24.7136, 46.6753),
      point('2', 21.4858, 39.1925),
    )

    expect(result.method).toBe('haversine')
  })

  it('الرياض → جدة ضمن النطاق المتوقع (~845 كم)', () => {
    const result = strategy.compute(
      point('1', 24.7136, 46.6753),
      point('2', 21.4858, 39.1925),
    )

    expect(result.meters).toBeGreaterThan(844000)
    expect(result.meters).toBeLessThan(846000)
  })

  it('نفس النقطة → مسافة صفر واتجاهان صفر', () => {
    const p = point('1', 24.7136, 46.6753)
    const result = strategy.compute(p, p)

    expect(result.meters).toBe(0)
    expect(result.initialBearingDeg).toBe(0)
    expect(result.finalBearingDeg).toBe(0)
  })

  it('يعبر خط التاريخ دون خطأ (~22.24 كم)', () => {
    const result = strategy.compute(point('1', 0, 179.9), point('2', 0, -179.9))

    expect(result.meters).toBeGreaterThan(22238)
    expect(result.meters).toBeLessThan(22240)
  })
})

describe('HaversineStrategy — الاتجاه', () => {
  it('شرقًا على خط الاستواء → 90° ابتدائيًا ونهائيًا', () => {
    const result = strategy.compute(point('1', 0, 0), point('2', 0, 1))

    expect(result.initialBearingDeg).toBeCloseTo(90, 9)
    expect(result.finalBearingDeg).toBeCloseTo(90, 9)
  })

  it('غربًا على خط الاستواء → 270° (تطبيع موجب)', () => {
    const result = strategy.compute(point('1', 0, 1), point('2', 0, 0))

    expect(result.initialBearingDeg).toBeCloseTo(270, 9)
    expect(result.finalBearingDeg).toBeCloseTo(270, 9)
  })

  it('شمالًا → 0° ابتدائيًا ونهائيًا', () => {
    const result = strategy.compute(point('1', 0, 0), point('2', 1, 0))

    expect(result.initialBearingDeg).toBeCloseTo(0, 9)
    expect(result.finalBearingDeg).toBeCloseTo(0, 9)
  })

  it('جنوبًا → 180° ابتدائيًا ونهائيًا', () => {
    const result = strategy.compute(point('1', 1, 0), point('2', 0, 0))

    expect(result.initialBearingDeg).toBeCloseTo(180, 9)
    expect(result.finalBearingDeg).toBeCloseTo(180, 9)
  })
})

describe('computePath', () => {
  it('أقل من نقطتين → 0 مقاطع وإجمالي 0', () => {
    const empty = computePath([], strategy)
    const single = computePath([point('1', 24.7136, 46.6753)], strategy)

    expect(empty.segments).toEqual([])
    expect(empty.totalMeters).toBe(0)
    expect(single.segments).toEqual([])
    expect(single.totalMeters).toBe(0)
  })

  it('يجمع مقاطع متعددة والإجمالي يساوي مجموعها', () => {
    const path = computePath(
      [
        point('1', 24.7136, 46.6753),
        point('2', 21.4858, 39.1925),
        point('3', 21.4225, 39.8262),
      ],
      strategy,
    )

    expect(path.segments).toHaveLength(2)
    expect(path.totalMeters).toBe(
      path.segments.reduce((sum, segment) => sum + segment.meters, 0),
    )
    expect(
      path.segments.every((segment) => segment.method === 'haversine'),
    ).toBe(true)
  })

  it('يستخدم الاستراتيجية الممررة لكل مقطع', () => {
    const fixedStrategy: DistanceStrategy = {
      id: 'fixed',
      labelKey: 'test.fixed',
      compute: () => ({
        meters: 100,
        initialBearingDeg: 0,
        finalBearingDeg: 0,
        method: 'fixed',
      }),
    }

    const path = computePath(
      [point('1', 0, 0), point('2', 0, 1), point('3', 1, 1), point('4', 1, 0)],
      fixedStrategy,
    )

    expect(path.segments).toHaveLength(3)
    expect(path.totalMeters).toBe(300)
    expect(path.segments.every((segment) => segment.method === 'fixed')).toBe(
      true,
    )
  })
})

// الفرق المرصود: ويلينغتون +0.0387% · بكين −0.2340% · الاتجاهات 0.033°/0.024°.
describe('Haversine — مقارنات مرجعية مع GeographicLib', () => {
  for (const testCase of reference.cases) {
    it(`${testCase.name} — المسافة داخل ${reference.tolerancePercent}%`, () => {
      const result = strategy.compute(
        point(`${testCase.name}-from`, testCase.from.lat, testCase.from.lon),
        point(`${testCase.name}-to`, testCase.to.lat, testCase.to.lon),
      )
      const relativeDifference =
        Math.abs(result.meters - testCase.geodesicMeters) /
        testCase.geodesicMeters

      expect(relativeDifference).toBeLessThanOrEqual(
        reference.tolerancePercent / 100,
      )
      expect(result.method).toBe('haversine')
    })
  }

  it('ويلينغتون → سالامانكا: قيمة Haversine المتوقعة (R = 6371008.8)', () => {
    const result = strategy.compute(
      point('wellington', -41.32, 174.81),
      point('salamanca', 40.96, -5.5),
    )

    expect(result.meters).toBeGreaterThan(19967402)
    expect(result.meters).toBeLessThan(19967405)
  })

  it('بكين → سان فرانسيسكو: الاتجاهات داخل 0.1° من GeographicLib', () => {
    const testCase = reference.cases.find(
      (candidate) => candidate.name === 'Beijing → San Francisco',
    )

    if (!testCase) {
      throw new Error('Missing Beijing → San Francisco reference case')
    }

    const initialReference = testCase.geodesicInitialBearingDeg
    const finalReference = testCase.geodesicFinalBearingDeg
    if (initialReference === undefined || finalReference === undefined) {
      throw new Error('Missing bearing reference values')
    }

    const result = strategy.compute(
      point('beijing', testCase.from.lat, testCase.from.lon),
      point('san-francisco', testCase.to.lat, testCase.to.lon),
    )

    expect(
      Math.abs(result.initialBearingDeg - initialReference),
    ).toBeLessThanOrEqual(reference.bearingToleranceDeg)
    expect(
      Math.abs(result.finalBearingDeg - finalReference),
    ).toBeLessThanOrEqual(reference.bearingToleranceDeg)
  })
})
