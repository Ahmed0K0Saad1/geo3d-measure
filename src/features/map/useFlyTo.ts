import { useEffect, useRef } from 'react'
import { Cartesian3, type Viewer } from 'cesium'
import type { GeoPoint } from '@/core/geo/GeoPoint.ts'
import { HaversineStrategy } from '@/core/geo/haversine.ts'
import { usePointsStore } from '@/store/usePointsStore.ts'

/** الارتفاع الإضافي فوق النقطة عند التركيز (م) — T2.7. */
const FOCUS_CLEARANCE_METERS = 2000
/** مدة انتقال الكاميرا (ثانية). */
const FOCUS_DURATION_SECONDS = 1.5
/** معامل ارتفاع التأطير مقابل مسافة المقطع — T4.4. */
const FRAME_DISTANCE_FACTOR = 1.2

const haversine = new HaversineStrategy()

/** طلب تركيز تنتجه الواجهة وتستهلكه `MapView` (ADR-030). */
export interface FlyToRequest {
  lat: number
  lon: number
  height?: number
  /** ارتفاع مطلق (م) يتجاوز `height` + الهامش — يستخدمه التأطير التلقائي. */
  altitude?: number
}

/** ارتفاع الكاميرا عند التركيز: ارتفاع النقطة + هامش، بحد أدنى الهامش. */
export function focusAltitude(height?: number): number {
  return Math.max(
    (height ?? 0) + FOCUS_CLEARANCE_METERS,
    FOCUS_CLEARANCE_METERS,
  )
}

export interface NewPoint {
  index: number
  point: GeoPoint
}

/**
 * آخر نقطة مضافة (غير موجودة في المجموعة السابقة).
 * مقارنة المعرّفات تتجاهل التعديل والحذف وإعادة الترتيب — T4.4.
 */
export function findAddedPoint(
  previousIds: ReadonlySet<string>,
  points: readonly GeoPoint[],
): NewPoint | null {
  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (!previousIds.has(points[index].id)) {
      return { index, point: points[index] }
    }
  }
  return null
}

export interface CameraFrame {
  lat: number
  lon: number
  altitude: number
}

/**
 * تأطير نقطتين: منتصف جغرافي (مع معالجة خط التاريخ) وارتفاع يكبر مع المسافة
 * حتى يظهر المقطع كاملًا في المشهد.
 */
export function framePoints(a: GeoPoint, b: GeoPoint): CameraFrame {
  const lonDelta = ((b.lon - a.lon + 540) % 360) - 180
  const lon = ((a.lon + lonDelta / 2 + 540) % 360) - 180
  const lat = (a.lat + b.lat) / 2
  const distance = haversine.compute(a, b).meters
  const groundHeight = Math.max(a.height ?? 0, b.height ?? 0)
  const altitude =
    groundHeight +
    Math.max(FOCUS_CLEARANCE_METERS, distance * FRAME_DISTANCE_FACTOR)

  return { lat, lon, altitude }
}

function flyTo(
  viewer: Viewer,
  lat: number,
  lon: number,
  altitude: number,
): void {
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(lon, lat, altitude),
    duration: FOCUS_DURATION_SECONDS,
  })
}

/**
 * ينفّذ طلبات التركيز الصريحة (قائمة النقاط) + التركيز التلقائي عند إضافة نقطة
 * جديدة، مع تأطيرها مع النقطة السابقة إن وُجدت (T4.4 — ADR-033).
 */
export function useFlyTo(
  viewer: Viewer | null,
  request: FlyToRequest | null,
): void {
  const points = usePointsStore((state) => state.points)
  const previousIdsRef = useRef<Set<string> | null>(null)

  useEffect(() => {
    // أول تحميل: احفظ الحالة القائمة ولا تُحرّك الكاميرا.
    if (previousIdsRef.current === null) {
      previousIdsRef.current = new Set(points.map((point) => point.id))
      return
    }
    if (!viewer) {
      return
    }

    const added = findAddedPoint(previousIdsRef.current, points)
    previousIdsRef.current = new Set(points.map((point) => point.id))
    if (!added) {
      return
    }

    const previous = added.index > 0 ? points[added.index - 1] : null
    if (previous) {
      const frame = framePoints(previous, added.point)
      flyTo(viewer, frame.lat, frame.lon, frame.altitude)
    } else {
      flyTo(
        viewer,
        added.point.lat,
        added.point.lon,
        focusAltitude(added.point.height),
      )
    }
  }, [points, viewer])

  useEffect(() => {
    if (!viewer || !request) {
      return
    }
    flyTo(
      viewer,
      request.lat,
      request.lon,
      request.altitude ?? focusAltitude(request.height),
    )
  }, [viewer, request])
}
