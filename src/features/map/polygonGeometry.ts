/** هندسة المضلع المساعدة — منطق نقي بلا Cesium (T5.1). */

import type { PolygonVertex } from '@/store/usePolygonStore.ts'

export interface ScreenPoint {
  x: number
  y: number
}

/** هل النقطتان على الشاشة ضمن نصف قطر البكسل المحدد؟ */
export function isWithinPixels(
  a: ScreenPoint,
  b: ScreenPoint,
  thresholdPixels: number,
): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) <= thresholdPixels
}

/**
 * يحوّل الرؤوس إلى مصفوفة درجات مسطحة `[lon, lat, ...]` لـCesium.
 * عند `closed` يُضاف الرأس الأول في النهاية لإغلاق الحلقة.
 */
export function polygonDegrees(
  vertices: readonly Pick<PolygonVertex, 'lat' | 'lon'>[],
  closed: boolean,
): number[] {
  const degrees: number[] = []
  for (const vertex of vertices) {
    degrees.push(vertex.lon, vertex.lat)
  }
  if (closed && vertices.length >= 3) {
    degrees.push(vertices[0].lon, vertices[0].lat)
  }
  return degrees
}
