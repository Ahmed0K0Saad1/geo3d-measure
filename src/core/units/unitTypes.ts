/** أنواع وحدات القياس المشتركة — بلا نصوص واجهة (ADR-004/008). */

export const DISTANCE_UNITS = ['m', 'km', 'mi', 'ft', 'nm'] as const

export type DistanceUnit = (typeof DISTANCE_UNITS)[number]

export const AREA_UNITS = ['m2', 'ha', 'km2', 'ft2', 'acre', 'mi2'] as const

export type AreaUnit = (typeof AREA_UNITS)[number]

export const METRIC_AREA_UNITS: readonly AreaUnit[] = ['m2', 'ha', 'km2']

export const IMPERIAL_AREA_UNITS: readonly AreaUnit[] = ['ft2', 'acre', 'mi2']
