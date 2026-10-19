/**
 * تحويلات MGRS ↔ WGS84 عبر مكتبة mgrs — منطق نقي بلا React/Cesium.
 * مرجع القيم الاختبارية: اختبارات مكتبة mgrs الرسمية (مبنية على GEOTRANS).
 */

import { forward, toPoint } from 'mgrs'

/** أكواد أخطاء MGRS — تترجمها الواجهة (ADR-004/027). */
export type MgrsErrorCode =
  'invalid-coordinate' | 'out-of-range' | 'invalid-precision' | 'invalid-mgrs'

/** خطأ تحويل MGRS يحمل كودًا قابلًا للترجمة. */
export class MgrsError extends Error {
  readonly code: MgrsErrorCode

  constructor(code: MgrsErrorCode) {
    super(`mgrs:${code}`)
    this.name = 'MgrsError'
    this.code = code
  }
}

/** نطاق خطوط العرض الذي تدعمه مكتبة mgrs (UTM؛ لا تدعم المناطق القطبية). */
export const MGRS_MIN_LATITUDE = -80
export const MGRS_MAX_LATITUDE = 84

function assertLatLon(lat: number, lon: number): void {
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    throw new MgrsError('invalid-coordinate')
  }
}

/**
 * يحوّل WGS84 (lat · lon) إلى مرجع MGRS.
 * precision: عدد الخانات (0 = 100 كم … 5 = 1 م).
 */
export function wgs84ToMgrs(lat: number, lon: number, precision = 5): string {
  assertLatLon(lat, lon)
  if (lat < MGRS_MIN_LATITUDE || lat > MGRS_MAX_LATITUDE) {
    throw new MgrsError('out-of-range')
  }
  if (!Number.isInteger(precision) || precision < 0 || precision > 5) {
    throw new MgrsError('invalid-precision')
  }

  try {
    return forward([lon, lat], precision)
  } catch {
    throw new MgrsError('invalid-coordinate')
  }
}

/**
 * يحوّل مرجع MGRS إلى مركز خليته (lat · lon).
 * ملاحظة: `toPoint` هو بديل `reverse` غير الموجود في المكتبة — يعيد مركزًا
 * لا مستطيل حدود؛ المستطيل متاح عبر `inverse` عند الحاجة (T5.3).
 */
export function mgrsToWgs84(value: string): { lat: number; lon: number } {
  const normalized = value.trim()
  if (normalized === '') {
    throw new MgrsError('invalid-mgrs')
  }

  try {
    const [lon, lat] = toPoint(normalized)
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < MGRS_MIN_LATITUDE ||
      lat > MGRS_MAX_LATITUDE ||
      lon < -180 ||
      lon > 180
    ) {
      throw new MgrsError('out-of-range')
    }
    return { lat, lon }
  } catch (error) {
    if (error instanceof MgrsError) {
      throw error
    }
    throw new MgrsError('invalid-mgrs')
  }
}
