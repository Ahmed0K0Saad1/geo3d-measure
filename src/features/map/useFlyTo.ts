import { useEffect } from 'react'
import { Cartesian3, type Viewer } from 'cesium'

/** الارتفاع الإضافي فوق النقطة عند التركيز (م) — T2.7. */
const FOCUS_CLEARANCE_METERS = 2000

/** طلب تركيز تنتجه الواجهة وتستهلكه `MapView` (ADR-030). */
export interface FlyToRequest {
  lat: number
  lon: number
  height?: number
}

/** ارتفاع الكاميرا عند التركيز: ارتفاع النقطة + هامش، بحد أدنى الهامش. */
export function focusAltitude(height?: number): number {
  return Math.max(
    (height ?? 0) + FOCUS_CLEARANCE_METERS,
    FOCUS_CLEARANCE_METERS,
  )
}

/** ينفّذ flyTo عند وصول طلب جديد — الكاميرا لا تُلمس من مكونات القائمة. */
export function useFlyTo(
  viewer: Viewer | null,
  request: FlyToRequest | null,
): void {
  useEffect(() => {
    if (!viewer || !request) {
      return
    }
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        request.lon,
        request.lat,
        focusAltitude(request.height),
      ),
      duration: 1.5,
    })
  }, [viewer, request])
}
