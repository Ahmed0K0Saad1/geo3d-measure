import { useEffect, useState } from 'react'
import {
  ScreenSpaceEventType,
  ScreenSpaceEventHandler,
  type Viewer,
} from 'cesium'

/** بادئة معرّفات كيانات النقاط — مصدر الحقيقة المشترك مع `usePointEntities`. */
export const POINT_ENTITY_PREFIX = 'store-point-'

export interface HoveredPoint {
  pointId: string
  /** إحداثيات المؤشر داخل canvas (من Cesium). */
  x: number
  y: number
  containerWidth: number
  containerHeight: number
}

/**
 * يكتشف الدبوس تحت المؤشر عبر `MOUSE_MOVE` + `scene.pick` (T4.1 — ADR-033).
 * لا يستخدم `Entity.description` لأنه لا يظهر عند التمرير.
 */
export function usePointHover(viewer: Viewer | null): HoveredPoint | null {
  const [hovered, setHovered] = useState<HoveredPoint | null>(null)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const handler = new ScreenSpaceEventHandler(viewer.canvas)
    const container = viewer.container

    handler.setInputAction((movement: ScreenSpaceEventHandler.MotionEvent) => {
      const picked = viewer.scene.pick(movement.endPosition) as
        { id?: { id?: unknown } } | undefined
      const entityId = picked?.id?.id

      if (
        typeof entityId === 'string' &&
        entityId.startsWith(POINT_ENTITY_PREFIX)
      ) {
        setHovered({
          pointId: entityId.slice(POINT_ENTITY_PREFIX.length),
          x: movement.endPosition.x,
          y: movement.endPosition.y,
          containerWidth: container.clientWidth,
          containerHeight: container.clientHeight,
        })
      } else {
        setHovered(null)
      }
    }, ScreenSpaceEventType.MOUSE_MOVE)

    const clearHover = (): void => setHovered(null)
    container.addEventListener('mouseleave', clearHover)

    return () => {
      handler.destroy()
      container.removeEventListener('mouseleave', clearHover)
      setHovered(null)
    }
  }, [viewer])

  return hovered
}
