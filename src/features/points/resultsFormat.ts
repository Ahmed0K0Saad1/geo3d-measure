import {
  metersToFeet,
  metersToKilometers,
  metersToMiles,
  metersToNauticalMiles,
} from '@/core/units/converters.ts'
import type { DistanceUnit } from '@/core/units/unitTypes.ts'

export type { DistanceUnit } from '@/core/units/unitTypes.ts'

const DECIMALS: Record<DistanceUnit, number> = {
  m: 1,
  km: 3,
  mi: 3,
  ft: 0,
  nm: 3,
}

/** يحوّل الأمتار إلى الوحدة المختارة (بلا تنسيق). */
export function convertDistance(meters: number, unit: DistanceUnit): number {
  switch (unit) {
    case 'm':
      return meters
    case 'km':
      return metersToKilometers(meters)
    case 'mi':
      return metersToMiles(meters)
    case 'ft':
      return metersToFeet(meters)
    case 'nm':
      return metersToNauticalMiles(meters)
  }
}

/** رقم المسافة بمنازل ثابتة حسب الوحدة. */
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
