/**
 * تحويلات وحدات المساحة — دوال نقية بلا نصوص واجهة (ADR-004/008/034).
 * مراجع التعريفات الدولية:
 * - هكتار = 10,000 م² · كم² = 1,000,000 م²
 * - قدم² = 0.09290304 م²
 * - أكر = 4046.8564224 م²
 * - ميل² = 2,589,988.110336 م²
 */

import type { AreaUnit } from './unitTypes.ts'

const SQUARE_METERS_PER_HECTARE = 10_000
const SQUARE_METERS_PER_SQUARE_KILOMETER = 1_000_000
const SQUARE_METERS_PER_SQUARE_FOOT = 0.092_903_04
const SQUARE_METERS_PER_ACRE = 4046.856_422_4
const SQUARE_METERS_PER_SQUARE_MILE = 2_589_988.110_336

export function squareMetersToHectares(squareMeters: number): number {
  return squareMeters / SQUARE_METERS_PER_HECTARE
}

export function hectaresToSquareMeters(hectares: number): number {
  return hectares * SQUARE_METERS_PER_HECTARE
}

export function squareMetersToSquareKilometers(squareMeters: number): number {
  return squareMeters / SQUARE_METERS_PER_SQUARE_KILOMETER
}

export function squareKilometersToSquareMeters(
  squareKilometers: number,
): number {
  return squareKilometers * SQUARE_METERS_PER_SQUARE_KILOMETER
}

export function squareMetersToSquareFeet(squareMeters: number): number {
  return squareMeters / SQUARE_METERS_PER_SQUARE_FOOT
}

export function squareFeetToSquareMeters(squareFeet: number): number {
  return squareFeet * SQUARE_METERS_PER_SQUARE_FOOT
}

export function squareMetersToAcres(squareMeters: number): number {
  return squareMeters / SQUARE_METERS_PER_ACRE
}

export function acresToSquareMeters(acres: number): number {
  return acres * SQUARE_METERS_PER_ACRE
}

export function squareMetersToSquareMiles(squareMeters: number): number {
  return squareMeters / SQUARE_METERS_PER_SQUARE_MILE
}

export function squareMilesToSquareMeters(squareMiles: number): number {
  return squareMiles * SQUARE_METERS_PER_SQUARE_MILE
}

/** يحوّل مترًا مربعًا إلى الوحدة المطلوبة (بلا تنسيق). */
export function convertArea(squareMeters: number, unit: AreaUnit): number {
  switch (unit) {
    case 'm2':
      return squareMeters
    case 'ha':
      return squareMetersToHectares(squareMeters)
    case 'km2':
      return squareMetersToSquareKilometers(squareMeters)
    case 'ft2':
      return squareMetersToSquareFeet(squareMeters)
    case 'acre':
      return squareMetersToAcres(squareMeters)
    case 'mi2':
      return squareMetersToSquareMiles(squareMeters)
  }
}
