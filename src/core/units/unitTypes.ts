/** أنواع وحدات القياس المشتركة — بلا نصوص واجهة (ADR-004/008). */

export type DistanceUnit = 'm' | 'km' | 'mi' | 'ft' | 'nm'

export const DISTANCE_UNITS: readonly DistanceUnit[] = [
  'm',
  'km',
  'mi',
  'ft',
  'nm',
]

export type AreaUnit = 'm2' | 'ha' | 'km2' | 'ft2' | 'acre' | 'mi2'

export const AREA_UNITS: readonly AreaUnit[] = [
  'm2',
  'ha',
  'km2',
  'ft2',
  'acre',
  'mi2',
]

export const METRIC_AREA_UNITS: readonly AreaUnit[] = ['m2', 'ha', 'km2']

export const IMPERIAL_AREA_UNITS: readonly AreaUnit[] = ['ft2', 'acre', 'mi2']
