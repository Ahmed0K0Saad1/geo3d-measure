import type { GeoPoint } from '@/core/geo/GeoPoint.ts'

/** طرفا مقطع واحد بين نقطتين متتاليتين. */
export interface SegmentEndpoints {
  start: GeoPoint
  end: GeoPoint
}

/** عدد المقاطع في مسار = عدد النقاط − 1 (لا يقل عن صفر). */
export function segmentCount(points: readonly GeoPoint[]): number {
  return Math.max(0, points.length - 1)
}

/** يعيد طرفي المقطع بالفهرس، أو null إذا كان الفهرس خارج النطاق. */
export function segmentAt(
  points: readonly GeoPoint[],
  index: number,
): SegmentEndpoints | null {
  if (!Number.isInteger(index) || index < 0 || index >= segmentCount(points)) {
    return null
  }
  return { start: points[index], end: points[index + 1] }
}

/**
 * مصفوفة درجات لـ`Cartesian3.fromDegreesArray`:
 * [lonA, latA, lonB, latB] — الارتفاع يُهمَل لأن الخط يُثبَّت على التضاريس.
 */
export function segmentDegrees(
  start: GeoPoint,
  end: GeoPoint,
): [number, number, number, number] {
  return [start.lon, start.lat, end.lon, end.lat]
}
