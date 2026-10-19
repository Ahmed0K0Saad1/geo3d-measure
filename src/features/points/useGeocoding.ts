import { useCallback, useEffect, useRef, useState } from 'react'
import type { GeoPoint } from '@/core/geo/GeoPoint.ts'
import {
  GeocodingError,
  nominatimGeocoder,
  type GeocodingErrorCode,
  type GeocodingResult,
} from '@/services/geocoding'
import { usePointsStore } from '@/store/usePointsStore'

/** مهلة debounce قبل إرسال طلب Nominatim (ROADMAP T2.6). */
const DEBOUNCE_MS = 600

export interface UseGeocodingResult {
  search: (query: string) => void
  results: GeocodingResult[]
  loading: boolean
  error: GeocodingErrorCode | null
  selectResult: (result: GeocodingResult) => void
}

/** يبني نقطة البحث خارج دورة الرسم (ADR-023/029). */
function buildGeocodingPoint(result: GeocodingResult): GeoPoint {
  return {
    id: `geocoding-${Date.now()}`,
    lat: result.lat,
    lon: result.lon,
    label: result.label,
    source: 'geocoding',
    createdAt: new Date(),
  }
}

/**
 * بحث بالاسم عبر Nominatim مع debounce وإلغاء الطلبات القديمة (T2.6).
 * نتائج البحث تُعرض في الواجهة، واختيار نتيجة يضيف نقطة `source: 'geocoding'`.
 */
export function useGeocoding(): UseGeocodingResult {
  const addPoint = usePointsStore((state) => state.addPoint)
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<GeocodingErrorCode | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  const cancelPending = useCallback((): void => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    controllerRef.current?.abort()
    controllerRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
      controllerRef.current?.abort()
    }
  }, [])

  const search = useCallback(
    (query: string): void => {
      cancelPending()
      const normalized = query.trim()

      if (normalized === '') {
        setResults([])
        setLoading(false)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)

      timerRef.current = setTimeout(() => {
        timerRef.current = null
        const controller = new AbortController()
        controllerRef.current = controller

        void nominatimGeocoder
          .search(normalized, { signal: controller.signal })
          .then((items) => {
            if (!controller.signal.aborted) {
              setResults(items)
            }
          })
          .catch((caught: unknown) => {
            if (controller.signal.aborted) {
              return
            }
            setResults([])
            setError(caught instanceof GeocodingError ? caught.code : 'network')
          })
          .finally(() => {
            if (!controller.signal.aborted) {
              setLoading(false)
            }
            if (controllerRef.current === controller) {
              controllerRef.current = null
            }
          })
      }, DEBOUNCE_MS)
    },
    [cancelPending],
  )

  const selectResult = useCallback(
    (result: GeocodingResult): void => {
      addPoint(buildGeocodingPoint(result))
      cancelPending()
      setResults([])
      setError(null)
      setLoading(false)
    },
    [addPoint, cancelPending],
  )

  return { search, results, loading, error, selectResult }
}
