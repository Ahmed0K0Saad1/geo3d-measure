import { useEffect } from 'react'
import {
  Cartesian3,
  HeightReference,
  VerticalOrigin,
  type Viewer,
} from 'cesium'
import { usePointsStore } from '@/store/usePointsStore'
import { buildPinDataUri, pinColorForIndex } from './pinImage'

/**
 * يرسم نقاط المخزن على الكرة كدبابيس مرقّمة (T4.1 — ADR-033):
 * - لون متناوب حسب الترتيب + رقم داخل الدبوس.
 * - النقطة المختارة بحلقة ذهبية وتكبير خفيف.
 * - النقاط بلا ارتفاع تُثبَّت على التضاريس بدل الغرق تحتها.
 */
export function usePointEntities(viewer: Viewer | null): void {
  const points = usePointsStore((state) => state.points)
  const selectedPointId = usePointsStore((state) => state.selectedPointId)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const entities = points.map((point, index) => {
      const isSelected = selectedPointId === point.id

      return viewer.entities.add({
        id: `store-point-${point.id}`,
        position: Cartesian3.fromDegrees(
          point.lon,
          point.lat,
          point.height ?? 0,
        ),
        billboard: {
          image: buildPinDataUri({
            number: index + 1,
            color: pinColorForIndex(index),
            selected: isSelected,
          }),
          width: 30,
          height: 40,
          verticalOrigin: VerticalOrigin.BOTTOM,
          heightReference:
            point.height === undefined
              ? HeightReference.CLAMP_TO_GROUND
              : HeightReference.NONE,
          scale: isSelected ? 1.15 : 1,
        },
      })
    })

    return () => {
      for (const entity of entities) {
        viewer.entities.remove(entity)
      }
    }
  }, [viewer, points, selectedPointId])
}
