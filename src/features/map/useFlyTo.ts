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

const METERS_PER_DEGREE = 111_320

function normalizeLongitude(lon: number): number {
  return ((lon + 540) % 360) - 180
}

/**
 * تأطير كل نقاط الجلسة المستعادة (T6.2 — ADR-035):
 * يفتح خطوط الطول حول خط طول النقطة الأولى ثم يوسّط النطاق،
 * فلا يقفز المشهد حول الأرض عند عبور خط التاريخ.
 */
export function frameAll(points: readonly GeoPoint[]): CameraFrame | null {
  if (points.length === 0) {
    return null
  }
  if (points.length === 1) {
    const point = points[0]
    return {
      lat: point.lat,
      lon: point.lon,
      altitude: focusAltitude(point.height),
    }
  }

  const firstLon = points[0].lon
  let minLat = 90
  let maxLat = -90
  let minLon = Number.POSITIVE_INFINITY
  let maxLon = Number.NEGATIVE_INFINITY
  let groundHeight = 0

  for (const point of points) {
    minLat = Math.min(minLat, point.lat)
    maxLat = Math.max(maxLat, point.lat)
    const unwrappedLon = firstLon + (((point.lon - firstLon + 540) % 360) - 180)
    minLon = Math.min(minLon, unwrappedLon)
    maxLon = Math.max(maxLon, unwrappedLon)
    groundHeight = Math.max(groundHeight, point.height ?? 0)
  }

  const lat = (minLat + maxLat) / 2
  const lon = normalizeLongitude((minLon + maxLon) / 2)
  const latSpanMeters = (maxLat - minLat) * METERS_PER_DEGREE
  const lonSpanMeters =
    (maxLon - minLon) * METERS_PER_DEGREE * Math.cos((lat * Math.PI) / 180)
  const spanMeters = Math.max(latSpanMeters, lonSpanMeters)

  return {
    lat,
    lon,
    altitude:
      groundHeight +
      Math.max(FOCUS_CLEARANCE_METERS, spanMeters * FRAME_DISTANCE_FACTOR),
  }
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
  fitAllToken = 0,
): void {
  const points = usePointsStore((state) => state.points)
  const previousIdsRef = useRef<Set<string> | null>(null)
  const previousCountRef = useRef(0)
  const lastFitTokenRef = useRef(0)
  const suppressAutoFrameRef = useRef(false)

  // استعادة جلسة: إطار واحد لكل البيانات، مع كتم التركيز التلقائي التالي.
  useEffect(() => {
    if (
      !viewer ||
      fitAllToken === 0 ||
      fitAllToken === lastFitTokenRef.current
    ) {
      return
    }
    lastFitTokenRef.current = fitAllToken
    // أول تحميل لا يحتاج كتمًا: تأثير الإضافة التلقائية سيهمل التهيئة الأولى.
    suppressAutoFrameRef.current = previousIdsRef.current !== null
    const frame = frameAll(points)
    if (frame) {
      flyTo(viewer, frame.lat, frame.lon, frame.altitude)
    }
  }, [fitAllToken, points, viewer])

  useEffect(() => {
    // أول تحميل: احفظ الحالة القائمة ولا تُحرّك الكاميرا.
    if (previousIdsRef.current === null) {
      previousIdsRef.current = new Set(points.map((point) => point.id))
      previousCountRef.current = points.length
      return
    }
    if (!viewer) {
      return
    }

    const added = findAddedPoint(previousIdsRef.current, points)
    const addedCount = points.length - previousCountRef.current
    previousIdsRef.current = new Set(points.map((point) => point.id))
    previousCountRef.current = points.length

    if (suppressAutoFrameRef.current) {
      suppressAutoFrameRef.current = false
      return
    }
    // الاستعادة الجماعية يتولاها frameAll أعلاه.
    if (!added || addedCount > 1) {
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
