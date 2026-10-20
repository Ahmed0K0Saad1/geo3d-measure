import { useCallback, useEffect, useRef, type RefObject } from 'react'
import {
  Cartesian3,
  SceneTransforms,
  ScreenSpaceEventType,
  ScreenSpaceEventHandler,
  type Cartesian2,
  type Viewer,
} from 'cesium'
import type { AreaPoint } from '@/core/geo/areaTypes.ts'
import { usePolygonStore } from '@/store/usePolygonStore.ts'
import { pickGlobeCoordinates } from './mapPicking'
import { POLYGON_FIRST_VERTEX_ID } from './polygonEntityIds'
import { isWithinPixels } from './polygonGeometry'

/** نصف قطر النقر الذي يُعتبر إغلاقًا عند الرأس الأول (بكسل). */
export const FIRST_VERTEX_CLOSE_RADIUS_PX = 16

interface HitEntity {
  id?: { id?: unknown }
}

function isFirstVertexHit(
  viewer: Viewer,
  position: Cartesian2,
  first: AreaPoint,
): boolean {
  const picked = viewer.scene.pick(position) as HitEntity | undefined
  if (picked?.id?.id === POLYGON_FIRST_VERTEX_ID) {
    return true
  }

  try {
    const screen = SceneTransforms.worldToWindowCoordinates(
      viewer.scene,
      Cartesian3.fromDegrees(first.lon, first.lat),
    )
    return (
      screen !== undefined &&
      isWithinPixels(position, screen, FIRST_VERTEX_CLOSE_RADIUS_PX)
    )
  } catch {
    return false
  }
}

/**
 * يدير وضع رسم المضلع (T5.1 — ADR-034):
 * LEFT_CLICK يضيف رأسًا، أو يغلق عند النقر على الرأس الأول،
 * وMOUSE_MOVE يحدّث خط المعاينة عبر ref بلا إعادة رسم React.
 */
export function usePolygonDraw(
  viewer: Viewer | null,
  isActive: boolean,
  onFinish: () => void,
): { previewRef: RefObject<AreaPoint | null> } {
  const previewRef = useRef<AreaPoint | null>(null)

  const handleClick = useCallback(
    (position: Cartesian2): void => {
      if (!viewer) {
        return
      }
      const polygon = usePolygonStore.getState()
      const first = polygon.vertices[0]
      if (
        first &&
        polygon.vertices.length >= 3 &&
        isFirstVertexHit(viewer, position, first)
      ) {
        polygon.close()
        onFinish()
        return
      }

      const coordinates = pickGlobeCoordinates(viewer, position)
      if (!coordinates) {
        return
      }
      polygon.addVertex({
        lat: coordinates.lat,
        lon: coordinates.lon,
        height: coordinates.height,
      })
    },
    [onFinish, viewer],
  )

  useEffect(() => {
    if (!viewer || !isActive) {
      return
    }

    const handler = new ScreenSpaceEventHandler(viewer.canvas)
    handler.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
      handleClick(event.position)
    }, ScreenSpaceEventType.LEFT_CLICK)
    handler.setInputAction((event: ScreenSpaceEventHandler.MotionEvent) => {
      const coordinates = pickGlobeCoordinates(viewer, event.endPosition)
      previewRef.current = coordinates
        ? { lat: coordinates.lat, lon: coordinates.lon }
        : null
    }, ScreenSpaceEventType.MOUSE_MOVE)

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') {
        return
      }
      const polygon = usePolygonStore.getState()
      if (polygon.vertices.length >= 3) {
        polygon.close()
      } else {
        polygon.clear()
      }
      onFinish()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      handler.destroy()
      window.removeEventListener('keydown', onKeyDown)
      previewRef.current = null
    }
  }, [handleClick, isActive, onFinish, viewer])

  return { previewRef }
}
