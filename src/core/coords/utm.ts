/**
 * تحويلات UTM ↔ WGS84 عبر proj4js — منطق نقي بلا React/Cesium.
 * مرجع القيم الاختبارية: PROJ (pyproj 3.7.2) مطابق لـproj4js.
 */

import proj4 from 'proj4'

/** نصف الكرة الأرضية في UTM. */
export type UtmHemisphere = 'N' | 'S'

/** إحداثية UTM كاملة مع المنطقة ونصف الكرة. */
export interface UtmCoordinate {
  easting: number
  northing: number
  zone: number
  hemisphere: UtmHemisphere
}

/** أكواد أخطاء UTM — تترجمها الواجهة (ADR-004/027). */
export type UtmErrorCode =
  'invalid-coordinate' | 'out-of-range' | 'invalid-zone'

/** خطأ تحويل UTM يحمل كودًا قابلًا للترجمة. */
export class UtmError extends Error {
  readonly code: UtmErrorCode

  constructor(code: UtmErrorCode) {
    super(`utm:${code}`)
    this.name = 'UtmError'
    this.code = code
  }
}

/** نطاق خطوط العرض المدعوم في UTM (خارجه تُستخدم UPS). */
export const UTM_MIN_LATITUDE = -80
export const UTM_MAX_LATITUDE = 84

const EASTING_MIN = 0
const EASTING_MAX = 1_000_000
const NORTHING_MIN = 0
const NORTHING_MAX = 10_000_000

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new UtmError(label === 'zone' ? 'invalid-zone' : 'invalid-coordinate')
  }
}

function assertLatLon(lat: number, lon: number): void {
  assertFinite(lat, 'lat')
  assertFinite(lon, 'lon')
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new UtmError('invalid-coordinate')
  }
}

function epsgFor(zone: number, hemisphere: UtmHemisphere): string {
  const base = hemisphere === 'N' ? 32600 : 32700
  return `EPSG:${base + zone}`
}

/**
 * يحدد منطقة UTM مع الحالات الخاصة المعيارية:
 * النرويج (32V) وسفالبارد (31X/33X/35X/37X) — مطابقة لسلوك مكتبة mgrs.
 */
export function utmZoneFor(lat: number, lon: number): number {
  assertLatLon(lat, lon)
  let zone = Math.floor((lon + 180) / 6) + 1
  if (zone > 60) {
    zone = 1
  }
  if (lat >= 56 && lat < 64 && lon >= 3 && lon < 12) {
    zone = 32
  }
  if (lat >= 72 && lat < 84) {
    if (lon >= 0 && lon < 9) {
      zone = 31
    } else if (lon >= 9 && lon < 21) {
      zone = 33
    } else if (lon >= 21 && lon < 33) {
      zone = 35
    } else if (lon >= 33 && lon < 42) {
      zone = 37
    }
  }
  return zone
}

/**
 * يحوّل WGS84 (lat · lon بالدرجات) إلى UTM.
 * المدخلات خارج نطاق UTM (−80°..84°) ترفض — تُستخدم UPS هناك.
 */
export function wgs84ToUtm(lat: number, lon: number): UtmCoordinate {
  assertLatLon(lat, lon)
  if (lat < UTM_MIN_LATITUDE || lat > UTM_MAX_LATITUDE) {
    throw new UtmError('out-of-range')
  }

  const zone = utmZoneFor(lat, lon)
  const hemisphere: UtmHemisphere = lat >= 0 ? 'N' : 'S'
  const [easting, northing] = proj4('EPSG:4326', epsgFor(zone, hemisphere), [
    lon,
    lat,
  ])

  if (!Number.isFinite(easting) || !Number.isFinite(northing)) {
    throw new UtmError('invalid-coordinate')
  }

  return { easting, northing, zone, hemisphere }
}

/**
 * يحوّل WGS84 إلى UTM داخل منطقة محددة بلا إعادة اشتقاقها.
 * مخصص لحساب مساحة موحدة: يُسمح بـEasting/Northing خارج النطاق المعتاد
 * عند إسقاط رأس في منطقة مجاورة، ولا يُستخدم للعرض المباشر.
 */
export function wgs84ToUtmInZone(
  lat: number,
  lon: number,
  zone: number,
  hemisphere: UtmHemisphere,
): UtmCoordinate {
  assertLatLon(lat, lon)
  assertFinite(zone, 'zone')

  if (!Number.isInteger(zone) || zone < 1 || zone > 60) {
    throw new UtmError('invalid-zone')
  }
  if (hemisphere !== 'N' && hemisphere !== 'S') {
    throw new UtmError('invalid-coordinate')
  }
  if (lat < UTM_MIN_LATITUDE || lat > UTM_MAX_LATITUDE) {
    throw new UtmError('out-of-range')
  }

  const [easting, northing] = proj4('EPSG:4326', epsgFor(zone, hemisphere), [
    lon,
    lat,
  ])

  if (!Number.isFinite(easting) || !Number.isFinite(northing)) {
    throw new UtmError('invalid-coordinate')
  }

  return { easting, northing, zone, hemisphere }
}

/**
 * يحوّل UTM إلى WGS84 (lat · lon بالدرجات).
 * يتحقق من المنطقة (1..60) ومن حدود Easting/Northing قبل الإسقاط العكسي.
 */
export function utmToWgs84(
  easting: number,
  northing: number,
  zone: number,
  hemisphere: UtmHemisphere,
): { lat: number; lon: number } {
  assertFinite(zone, 'zone')
  assertFinite(easting, 'easting')
  assertFinite(northing, 'northing')

  if (!Number.isInteger(zone) || zone < 1 || zone > 60) {
    throw new UtmError('invalid-zone')
  }
  if (hemisphere !== 'N' && hemisphere !== 'S') {
    throw new UtmError('invalid-coordinate')
  }
  if (
    easting < EASTING_MIN ||
    easting > EASTING_MAX ||
    northing < NORTHING_MIN ||
    northing > NORTHING_MAX
  ) {
    throw new UtmError('out-of-range')
  }

  const [lon, lat] = proj4(epsgFor(zone, hemisphere), 'EPSG:4326', [
    easting,
    northing,
  ])

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < UTM_MIN_LATITUDE ||
    lat > UTM_MAX_LATITUDE ||
    lon < -180 ||
    lon > 180
  ) {
    throw new UtmError('out-of-range')
  }

  return { lat, lon }
}

/** يعرض إحداثية UTM بصيغة مقروءة: `38N 669460E 2734272N`. */
export function formatUtm(value: UtmCoordinate): string {
  return `${value.zone}${value.hemisphere} ${Math.round(value.easting)}E ${Math.round(value.northing)}N`
}
