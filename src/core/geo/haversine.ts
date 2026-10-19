import type { GeoPoint } from './GeoPoint.ts'
import type { DistanceStrategy, SegmentResult } from './strategy.ts'

/** نصف قطر كرة Haversine بالمتر — REQUIREMENTS §6 (6371.0088 كم). */
export const EARTH_RADIUS_METERS = 6371008.8

const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

function normalizeBearing(degrees: number): number {
  return ((degrees % 360) + 360) % 360
}

function initialBearing(a: GeoPoint, b: GeoPoint): number {
  const phi1 = a.lat * DEG_TO_RAD
  const phi2 = b.lat * DEG_TO_RAD
  const deltaLambda = (b.lon - a.lon) * DEG_TO_RAD

  const y = Math.sin(deltaLambda) * Math.cos(phi2)
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)

  return normalizeBearing(Math.atan2(y, x) * RAD_TO_DEG)
}

/**
 * Haversine على كرة نصف قطرها 6371008.8 م.
 * - الارتفاع (`height`) لا يدخل في الحساب (خارج نطاق v1 — ADR-032).
 * - النقطتان المتطابقتان ← المسافة 0 والاتجاهان 0 (الاتجاه غير معرّف).
 * - النقاط المتضادة (antipodal) ← الاتجاه غير معرّف رياضيًا.
 */
export class HaversineStrategy implements DistanceStrategy {
  readonly id = 'haversine'
  readonly labelKey = 'measure.method.haversine'

  compute(a: GeoPoint, b: GeoPoint): SegmentResult {
    const phi1 = a.lat * DEG_TO_RAD
    const phi2 = b.lat * DEG_TO_RAD
    const deltaPhi = (b.lat - a.lat) * DEG_TO_RAD
    const deltaLambda = (b.lon - a.lon) * DEG_TO_RAD

    const h =
      Math.sin(deltaPhi / 2) ** 2 +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2
    // تقييد h يمنع NaN الناتج عن الخطأ العائم قرب النقاط المتضادة.
    const clampedH = Math.min(1, Math.max(0, h))
    const centralAngle =
      2 * Math.atan2(Math.sqrt(clampedH), Math.sqrt(1 - clampedH))
    const meters = EARTH_RADIUS_METERS * centralAngle

    if (meters === 0) {
      return {
        meters: 0,
        initialBearingDeg: 0,
        finalBearingDeg: 0,
        method: this.id,
      }
    }

    return {
      meters,
      initialBearingDeg: initialBearing(a, b),
      finalBearingDeg: normalizeBearing(initialBearing(b, a) + 180),
      method: this.id,
    }
  }
}
