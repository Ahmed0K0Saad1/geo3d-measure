/**
 * المساحة الجيوديسية على الإهليلج WGS84 عبر GeographicLib PolygonArea
 * (خوارزمية Karney) — ADR-017/034. منطق نقي بلا React/Cesium.
 */

import { Geodesic } from 'geographiclib-geodesic'
import type { AreaPoint, AreaResultBase } from './areaTypes.ts'

export type GeodesicAreaResult = AreaResultBase & {
  /** المساحة بالمتر المربع. */
  squareMeters: number
  methodKey: 'measure.method.geodesic'
}

function isValidPoint(point: AreaPoint): boolean {
  return (
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lon) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lon >= -180 &&
    point.lon <= 180
  )
}

/**
 * يحسب المساحة الجيوديسية ومحيط المضلع.
 * - أقل من 3 نقاط: `null`.
 * - الارتفاع مهمَل؛ القياس على سطح الإهليلج.
 * - `Compute(false, true)` يعيد مساحة موقّعة؛ `Math.abs` يجعل اتجاه اللف
 *   لا يغيّر الناتج. (بـ`sign=false` تعيد المكتبة متممة المساحة للمضلع
 *   المعاكس الاتجاه بدل قيمته المطلقة — تحقق عملي في P5.)
 */
export function areaGeodesic(
  points: readonly AreaPoint[],
): GeodesicAreaResult | null {
  if (points.length < 3 || !points.every(isValidPoint)) {
    return null
  }

  const polygon = Geodesic.WGS84.Polygon()
  for (const point of points) {
    polygon.AddPoint(point.lat, point.lon)
  }

  const result = polygon.Compute(false, true)
  if (
    result.area === undefined ||
    !Number.isFinite(result.area) ||
    !Number.isFinite(result.perimeter)
  ) {
    return null
  }

  return {
    squareMeters: Math.abs(result.area),
    perimeterMeters: result.perimeter,
    methodKey: 'measure.method.geodesic',
  }
}
