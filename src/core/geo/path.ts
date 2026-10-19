import type { GeoPoint } from './GeoPoint.ts'
import type { DistanceStrategy, SegmentResult } from './strategy.ts'

/** نتيجة قياس مسار كامل. */
export interface PathResult {
  segments: SegmentResult[]
  totalMeters: number
}

/**
 * يجمع مسافات المقاطع المتتالية بين النقاط.
 * أقل من نقطتين ← 0 مقاطع وإجمالي 0.
 */
export function computePath(
  points: readonly GeoPoint[],
  strategy: DistanceStrategy,
): PathResult {
  const segments: SegmentResult[] = []
  let totalMeters = 0

  for (let i = 1; i < points.length; i += 1) {
    const segment = strategy.compute(points[i - 1], points[i])
    segments.push(segment)
    totalMeters += segment.meters
  }

  return { segments, totalMeters }
}
