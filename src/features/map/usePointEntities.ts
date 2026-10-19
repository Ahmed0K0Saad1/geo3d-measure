import { useEffect } from 'react'
import {
  Cartesian2,
  Cartesian3,
  Color,
  LabelStyle,
  VerticalOrigin,
  type Viewer,
} from 'cesium'
import { usePointsStore } from '@/store/usePointsStore'

/**
 * يرسم نقاط المخزن على الكرة كعلامات مرقّمة (الحد الأدنى — ADR-024:
 * العرض الأولي في T2.2، والتصميم النهائي Pin/Tooltip في T4.1).
 */
export function usePointEntities(viewer: Viewer | null): void {
  const points = usePointsStore((state) => state.points)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const entities = points.map((point, index) =>
      viewer.entities.add({
        id: `store-point-${point.id}`,
        position: Cartesian3.fromDegrees(
          point.lon,
          point.lat,
          point.height ?? 0,
        ),
        point: {
          pixelSize: 11,
          color: Color.WHITE,
          outlineColor: Color.fromCssColorString('#1d4ed8'),
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: String(index + 1),
          font: 'bold 12px sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 3,
          style: LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(0, -16),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      }),
    )

    return () => {
      for (const entity of entities) {
        viewer.entities.remove(entity)
      }
    }
  }, [viewer, points])
}
