/**
 * تحويلات وحدات المسافة — دوال نقية بلا نصوص واجهة (ADR-004/008).
 * التنسيق والعرض مسؤولية الواجهة في P4.
 */

const METERS_PER_KILOMETER = 1000
const METERS_PER_NAUTICAL_MILE = 1852
const METERS_PER_MILE = 1609.344
const METERS_PER_FOOT = 0.3048

export function metersToKilometers(meters: number): number {
  return meters / METERS_PER_KILOMETER
}

export function kilometersToMeters(kilometers: number): number {
  return kilometers * METERS_PER_KILOMETER
}

export function metersToNauticalMiles(meters: number): number {
  return meters / METERS_PER_NAUTICAL_MILE
}

export function nauticalMilesToMeters(nauticalMiles: number): number {
  return nauticalMiles * METERS_PER_NAUTICAL_MILE
}

/** الميل القانوني (statute mile). */
export function metersToMiles(meters: number): number {
  return meters / METERS_PER_MILE
}

/** الميل القانوني (statute mile). */
export function milesToMeters(miles: number): number {
  return miles * METERS_PER_MILE
}

export function metersToFeet(meters: number): number {
  return meters / METERS_PER_FOOT
}

export function feetToMeters(feet: number): number {
  return feet * METERS_PER_FOOT
}
