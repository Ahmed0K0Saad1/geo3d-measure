import { useEffect } from 'react'
import { ArcType, Cartesian3, Color, type Entity, type Viewer } from 'cesium'
import { usePointsStore } from '@/store/usePointsStore'
import { segmentAt, segmentDegrees } from './pathGeometry'

const DEFAULT_SEGMENT_COLOR = '#1d4ed8'
const SELECTED_SEGMENT_COLOR = '#dc2626'
const DEFAULT_SEGMENT_WIDTH = 3
const SELECTED_SEGMENT_WIDTH = 5

/**
 * يرسم مقطعًا جيوديسيًا لكل نقطتين متتاليتين (T4.2 — ADR-033):
 * - المقطع المحدد أحمر أعرض، والبقية أزرق.
 * - `clampToGround` يُبقي الخط فوق التضاريس.
 */
export function usePathEntities(viewer: Viewer | null): void {
  const points = usePointsStore((state) => state.points)
  const selectedSegmentIndex = usePointsStore(
    (state) => state.selectedSegmentIndex,
  )

  useEffect(() => {
    if (!viewer) {
      return
    }

    const entities: Entity[] = []
    for (let index = 0; index < points.length - 1; index += 1) {
      const segment = segmentAt(points, index)
      if (!segment) {
        continue
      }

      const isSelected = index === selectedSegmentIndex
      entities.push(
        viewer.entities.add({
          id: `store-segment-${index}`,
          polyline: {
            positions: Cartesian3.fromDegreesArray(
              segmentDegrees(segment.start, segment.end),
            ),
            width: isSelected ? SELECTED_SEGMENT_WIDTH : DEFAULT_SEGMENT_WIDTH,
            material: Color.fromCssColorString(
              isSelected ? SELECTED_SEGMENT_COLOR : DEFAULT_SEGMENT_COLOR,
            ),
            arcType: ArcType.GEODESIC,
            clampToGround: true,
          },
        }),
      )
    }

    return () => {
      for (const entity of entities) {
        viewer.entities.remove(entity)
      }
    }
  }, [viewer, points, selectedSegmentIndex])
}
