/**
 * تنسيق المساحة والفرق بين الطريقتين — منطق نقي قابل للاختبار (T5.4).
 */

import { convertArea } from '@/core/units/areaConverters.ts'
import type { AreaUnit } from '@/core/units/unitTypes.ts'

const DECIMALS: Record<AreaUnit, number> = {
  m2: 0,
  ha: 3,
  km2: 3,
  ft2: 0,
  acre: 3,
  mi2: 4,
}

const formatters = new Map<number, Intl.NumberFormat>()

function formatterFor(decimals: number): Intl.NumberFormat {
  const cached = formatters.get(decimals)
  if (cached) {
    return cached
  }
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  formatters.set(decimals, formatter)
  return formatter
}

/** رقم المساحة بالوحدة المختارة مع فواصل الآلاف. */
export function formatArea(squareMeters: number, unit: AreaUnit): string {
  if (!Number.isFinite(squareMeters) || squareMeters < 0) {
    return '—'
  }
  return formatterFor(DECIMALS[unit]).format(convertArea(squareMeters, unit))
}

/** نسبة مئوية مطلقة بثلاث منازل، مع حد أدنى واضح للقيم الضئيلة. */
export function formatPercent(percent: number): string {
  if (!Number.isFinite(percent)) {
    return '—'
  }
  const absolute = Math.abs(percent)
  if (absolute > 0 && absolute < 0.001) {
    return '<0.001'
  }
  return absolute.toFixed(3)
}

export type AreaDifferenceDirection = 'higher' | 'lower' | 'equal'

export interface AreaDifference {
  absoluteSquareMeters: number
  signedPercent: number
  direction: AreaDifferenceDirection
}

/**
 * فرق UTM عن المساحة الجيوديسية:
 * `signedPercent = (utm - geodesic) / geodesic × 100`.
 */
export function areaDifference(
  geodesicSquareMeters: number,
  utmSquareMeters: number,
): AreaDifference | null {
  if (
    !Number.isFinite(geodesicSquareMeters) ||
    !Number.isFinite(utmSquareMeters) ||
    geodesicSquareMeters <= 0
  ) {
    return null
  }

  const absoluteSquareMeters = Math.abs(utmSquareMeters - geodesicSquareMeters)
  const signedPercent =
    ((utmSquareMeters - geodesicSquareMeters) / geodesicSquareMeters) * 100
  const epsilon = 0.000_000_1
  const direction: AreaDifferenceDirection =
    signedPercent > epsilon
      ? 'higher'
      : signedPercent < -epsilon
        ? 'lower'
        : 'equal'

  return { absoluteSquareMeters, signedPercent, direction }
}
