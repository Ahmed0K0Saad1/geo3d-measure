/**
 * مساحة UTM + Shoelace — ADR-007/034. منطق نقي بلا React/Cesium.
 *
 * كل الرؤوس تُسقط في منطقة UTM واحدة مأخوذة من centroid حتى تكون
 * الإحداثيات قابلة للمقارنة. عند امتداد المضلع لأكثر من منطقة تُحسب
 * المساحة مع تحذير؛ وعند الحالات التي تجعل UTM مضللًا (خط التاريخ،
 * نصفا الكرة، خارج 80°S–84°N) تُعاد `squareMeters: null` مع السبب.
 */

import {
  UTM_MAX_LATITUDE,
  UTM_MIN_LATITUDE,
  utmZoneFor,
  wgs84ToUtmInZone,
  type UtmHemisphere,
} from '@/core/coords/utm.ts'
import type { AreaPoint, AreaResultBase } from './areaTypes.ts'

export type UtmAreaWarning =
  'multi-zone' | 'multi-hemisphere' | 'antimeridian' | 'outside-utm-range'

export interface UtmAreaResult extends AreaResultBase {
  /** null عندما يتعذر حساب UTM؛ السبب في warnings. */
  squareMeters: number | null
  zone: number | null
  hemisphere: UtmHemisphere | null
  warnings: UtmAreaWarning[]
  methodKey: 'measure.method.utmShoelace'
}

interface UtmPoint {
  easting: number
  northing: number
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

/** هل يقطع أي ضلع خط التاريخ الدولي؟ */
export function hasAntimeridianCrossing(points: readonly AreaPoint[]): boolean {
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]
    const next = points[(index + 1) % points.length]
    if (Math.abs(current.lon - next.lon) > 180) {
      return true
    }
  }
  return false
}

/** مساحة Shoelace على إحداثيات مستوية (متر) — قيمة مطلقة. */
export function shoelaceArea(points: readonly UtmPoint[]): number {
  if (points.length < 3) {
    return 0
  }

  let twiceArea = 0
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]
    const next = points[(index + 1) % points.length]
    twiceArea += current.easting * next.northing
    twiceArea -= next.easting * current.northing
  }
  return Math.abs(twiceArea) / 2
}

/** محيط المضلع على مستوى UTM (للعرض فقط؛ ليس مرجعًا جيوديسيًا). */
function perimeterOf(points: readonly UtmPoint[]): number {
  let length = 0
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]
    const next = points[(index + 1) % points.length]
    length += Math.hypot(
      next.easting - current.easting,
      next.northing - current.northing,
    )
  }
  return length
}

function centroidOf(points: readonly AreaPoint[]): AreaPoint {
  let lat = 0
  let lon = 0
  for (const point of points) {
    lat += point.lat
    lon += point.lon
  }
  return { lat: lat / points.length, lon: lon / points.length }
}

export function areaUtm(points: readonly AreaPoint[]): UtmAreaResult | null {
  if (points.length < 3 || !points.every(isValidPoint)) {
    return null
  }

  const base = {
    perimeterMeters: 0,
    methodKey: 'measure.method.utmShoelace' as const,
  }

  const warnings: UtmAreaWarning[] = []
  const outsideRange = points.some(
    (point) => point.lat < UTM_MIN_LATITUDE || point.lat > UTM_MAX_LATITUDE,
  )
  const hemispheres = new Set<UtmHemisphere>(
    points.map((point) => (point.lat >= 0 ? 'N' : 'S')),
  )

  if (outsideRange) {
    warnings.push('outside-utm-range')
  }
  if (hasAntimeridianCrossing(points)) {
    warnings.push('antimeridian')
  }
  if (hemispheres.size > 1) {
    warnings.push('multi-hemisphere')
  }

  if (warnings.length > 0) {
    return {
      ...base,
      squareMeters: null,
      zone: null,
      hemisphere: null,
      warnings,
    }
  }

  const centroid = centroidOf(points)
  const zone = utmZoneFor(centroid.lat, centroid.lon)
  const hemisphere: UtmHemisphere = centroid.lat >= 0 ? 'N' : 'S'
  const zones = new Set(points.map((point) => utmZoneFor(point.lat, point.lon)))
  if (zones.size > 1) {
    warnings.push('multi-zone')
  }

  try {
    const projected = points.map((point) =>
      wgs84ToUtmInZone(point.lat, point.lon, zone, hemisphere),
    )
    return {
      ...base,
      perimeterMeters: perimeterOf(projected),
      squareMeters: shoelaceArea(projected),
      zone,
      hemisphere,
      warnings,
    }
  } catch {
    return {
      ...base,
      squareMeters: null,
      zone,
      hemisphere,
      warnings: [...warnings, 'outside-utm-range'],
    }
  }
}
