import {
  metersToKilometers,
  metersToNauticalMiles,
} from '@/core/units/converters.ts'

/** وحدات المسافة المعروضة في P4 (م · كم · ميل بحري) — ADR-008/033. */
export type DistanceUnit = 'm' | 'km' | 'nm'

export const DISTANCE_UNITS: readonly DistanceUnit[] = ['m', 'km', 'nm']

const DECIMALS: Record<DistanceUnit, number> = {
  m: 1,
  km: 3,
  nm: 3,
}

/** يحوّل الأمتار إلى الوحدة المختارة (بلا تنسيق). */
export function convertDistance(meters: number, unit: DistanceUnit): number {
  switch (unit) {
    case 'm':
      return meters
    case 'km':
      return metersToKilometers(meters)
    case 'nm':
      return metersToNauticalMiles(meters)
  }
}

/** رقم المسافة بمنازل ثابتة: م (1) · كم (3) · ميل بحري (3). */
export function formatDistance(meters: number, unit: DistanceUnit): string {
  return convertDistance(meters, unit).toFixed(DECIMALS[unit])
}

/**
 * اتجاه بدرجة عشرية، مطبَّع إلى [0,360) بعد التقريب
 * حتى لا يظهر «360.0°» بدل «0.0°».
 */
export function formatBearing(degrees: number): string {
  const rounded = Math.round(degrees * 10) / 10
  const normalized = ((rounded % 360) + 360) % 360
  return `${normalized.toFixed(1)}°`
}
