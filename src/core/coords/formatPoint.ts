/**
 * تنسيق نقطة جغرافية بالصيغة المختارة — منطق نقي بلا React/Cesium (T6.4).
 * UTM/MGRS قد تخرج عن نطاقهما (القطبان)؛ عندها نعود إلى DMS بدل رسالة خطأ.
 */

import { formatDMS } from './parsers.ts'
import { wgs84ToMgrs } from './mgrs.ts'
import { formatUtm, wgs84ToUtm } from './utm.ts'

export const COORDINATE_FORMATS = ['DD', 'DMS', 'UTM', 'MGRS'] as const

export type CoordinateFormat = (typeof COORDINATE_FORMATS)[number]

export interface FormattablePoint {
  lat: number
  lon: number
}

function formatDd(point: FormattablePoint): string {
  return `${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}`
}

function formatDms(point: FormattablePoint): string {
  return `${formatDMS(point.lat, 'lat')} ${formatDMS(point.lon, 'lon')}`
}

/** يعيد تمثيلًا نصيًا واحدًا للصيغة المطلوبة (بلا اتجاه نصي). */
export function formatPoint(
  point: FormattablePoint,
  format: CoordinateFormat,
): string {
  switch (format) {
    case 'DD':
      return formatDd(point)
    case 'DMS':
      return formatDms(point)
    case 'UTM':
      try {
        return formatUtm(wgs84ToUtm(point.lat, point.lon))
      } catch {
        return formatDms(point)
      }
    case 'MGRS':
      try {
        return wgs84ToMgrs(point.lat, point.lon)
      } catch {
        return formatDms(point)
      }
  }
}
