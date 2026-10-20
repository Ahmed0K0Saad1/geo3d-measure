/**
 * لقطة الجلسة وبصمتها — منطق نقي + هوك قراءة (T6.2 — ADR-035).
 * البصمة تُرتّب مفاتيح الكائنات حتى لا يبدو السجل معدّلًا بعد إعادة التحميل.
 */

import { useMemo } from 'react'
import type { GeoPoint } from '@/core/geo/GeoPoint.ts'
import type { AppSettings } from '@/services/settingsTypes.ts'
import type { SessionSnapshot } from '@/services/sessionTypes.ts'
import type { PolygonStatus, PolygonVertex } from './usePolygonStore.ts'
import { usePointsStore } from './usePointsStore.ts'
import { usePolygonStore } from './usePolygonStore.ts'
import { useSettingsStore } from './useSettingsStore.ts'

export function buildSessionSnapshot(
  points: readonly GeoPoint[],
  vertices: readonly PolygonVertex[],
  status: PolygonStatus,
  settings: AppSettings,
): SessionSnapshot {
  return {
    points: [...points],
    polygon: {
      vertices: [...vertices],
      closed: status === 'closed',
    },
    settings: {
      distanceUnit: settings.distanceUnit,
      areaUnit: settings.areaUnit,
      coordinateFormat: settings.coordinateFormat,
    },
  }
}

function canonicalize(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (Array.isArray(value)) {
    return value.map(canonicalize)
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [
          key,
          canonicalize((value as Record<string, unknown>)[key]),
        ]),
    )
  }
  return value
}

/** بصمة مستقرة لمقارنة اللقطة الحالية بآخر حفظ. */
export function sessionSignature(snapshot: SessionSnapshot): string {
  return JSON.stringify(canonicalize(snapshot))
}

/** لقطة حالة المتاجر الحالية — تُستخدم في الحفظ اليدوي والتلقائي. */
export function useSessionSnapshot(): SessionSnapshot {
  const points = usePointsStore((state) => state.points)
  const vertices = usePolygonStore((state) => state.vertices)
  const status = usePolygonStore((state) => state.status)
  const distanceUnit = useSettingsStore((state) => state.distanceUnit)
  const areaUnit = useSettingsStore((state) => state.areaUnit)
  const coordinateFormat = useSettingsStore((state) => state.coordinateFormat)

  return useMemo(
    () =>
      buildSessionSnapshot(points, vertices, status, {
        distanceUnit,
        areaUnit,
        coordinateFormat,
      }),
    [areaUnit, coordinateFormat, distanceUnit, points, status, vertices],
  )
}
