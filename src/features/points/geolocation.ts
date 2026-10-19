import type { GeoPoint } from '@/core/geo/GeoPoint.ts'

/** أكواد أخطاء تحديد الموقع — تُترجم في الواجهة (ADR-004/025). */
export type GeolocationErrorCode =
  | 'unsupported'
  | 'permission-denied'
  | 'position-unavailable'
  | 'timeout'
  | 'unknown'

/** خطأ تحديد الموقع يحمل كودًا قابلًا للترجمة بدل رسالة جاهزة. */
export class GeolocationError extends Error {
  readonly code: GeolocationErrorCode

  constructor(code: GeolocationErrorCode) {
    super(`geolocation:${code}`)
    this.name = 'GeolocationError'
    this.code = code
  }
}

/** الحقول اللازمة من GeolocationCoordinates (بلا اعتماد على DOM). */
export interface PositionCoords {
  latitude: number
  longitude: number
  altitude: number | null
  accuracy: number
}

/** بيانات الهوية التي يولّدها المستدعي (وفق ADR-023). */
export interface PointIdentity {
  id: string
  createdAt: Date
  label?: string
}

/** يحوّل إحداثيات المتصفح إلى GeoPoint (دالة نقية — تُختبر في Node). */
export function positionToGeoPoint(
  coords: PositionCoords,
  identity: PointIdentity,
): GeoPoint {
  return {
    id: identity.id,
    lat: coords.latitude,
    lon: coords.longitude,
    height: coords.altitude ?? 0,
    accuracy: coords.accuracy,
    label: identity.label,
    source: 'gps',
    createdAt: identity.createdAt,
  }
}

/** يحوّل كود GeolocationPositionError إلى الكود المترجم المقابل. */
export function toGeolocationErrorCode(code: number): GeolocationErrorCode {
  switch (code) {
    case 1:
      return 'permission-denied'
    case 2:
      return 'position-unavailable'
    case 3:
      return 'timeout'
    default:
      return 'unknown'
  }
}
