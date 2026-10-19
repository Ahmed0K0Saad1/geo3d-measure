import { useCallback, useEffect } from 'react'
import {
  ScreenSpaceEventType,
  ScreenSpaceEventHandler,
  type Cartesian2,
  type Viewer,
} from 'cesium'
import type { GeoPoint } from '@/core/geo/GeoPoint.ts'
import { usePointsStore } from '@/store/usePointsStore'
import { pickGlobeCoordinates, type PickedCoordinates } from './mapPicking'

/** يبني نقطة النقر خارج دورة الرسم (ADR-023/028). */
function buildClickPoint(coordinates: PickedCoordinates): GeoPoint {
  return {
    id: `click-${Date.now()}`,
    lat: coordinates.lat,
    lon: coordinates.lon,
    height: coordinates.height,
    source: 'click',
    createdAt: new Date(),
  }
}

/**
 * يدير وضع النقر على الخريطة (T2.5):
 * LEFT_CLICK → `globe.pick` مع بديل `pickEllipsoid` → إضافة نقطة `source: 'click'`.
 * يخرج بـEscape أو بعد الإضافة عبر `onExit`.
 */
export function useMapClick(
  viewer: Viewer | null,
  isActive: boolean,
  onExit: () => void,
): { handleClick: (position: Cartesian2) => void } {
  const addPoint = usePointsStore((state) => state.addPoint)

  const handleClick = useCallback(
    (position: Cartesian2): void => {
      if (!viewer) {
        return
      }
      const coordinates = pickGlobeCoordinates(viewer, position)
      if (!coordinates) {
        return
      }
      addPoint(buildClickPoint(coordinates))
      onExit()
    },
    [addPoint, onExit, viewer],
  )

  useEffect(() => {
    if (!viewer || !isActive) {
      return
    }

    const canvas = viewer.canvas
    const handler = new ScreenSpaceEventHandler(canvas)
    handler.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
      handleClick(event.position)
    }, ScreenSpaceEventType.LEFT_CLICK)

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onExit()
      }
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      handler.destroy()
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [handleClick, isActive, onExit, viewer])

  return { handleClick }
}
