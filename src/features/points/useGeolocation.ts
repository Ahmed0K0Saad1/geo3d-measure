import { useCallback } from 'react'
import type { GeoPoint } from '@/core/geo/GeoPoint.ts'
import { usePointsStore } from '@/store/usePointsStore.ts'
import {
  GeolocationError,
  positionToGeoPoint,
  toGeolocationErrorCode,
} from './geolocation'

/**
 * «موقعي الحالي» (FR-1) — نداء GPS واحد عند الطلب، بلا تتبع مستمر في v1.
 * يضيف النقطة إلى المخزن مباشرة ويعيدها؛ الأخطاء بأكواد مترجمة (ADR-025).
 */
export function useGeolocation() {
  const addPoint = usePointsStore((state) => state.addPoint)

  const getCurrentPosition = useCallback(
    (label?: string) =>
      new Promise<GeoPoint>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new GeolocationError('unsupported'))
          return
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const point = positionToGeoPoint(
              {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                altitude: position.coords.altitude,
                accuracy: position.coords.accuracy,
              },
              {
                id: `gps-${Date.now()}`,
                createdAt: new Date(),
                label,
              },
            )
            addPoint(point)
            resolve(point)
          },
          (error) => {
            reject(new GeolocationError(toGeolocationErrorCode(error.code)))
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        )
      }),
    [addPoint],
  )

  return { getCurrentPosition }
}
