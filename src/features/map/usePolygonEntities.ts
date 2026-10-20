import { useEffect, type RefObject } from 'react'
import {
  ArcType,
  CallbackProperty,
  Cartesian3,
  Color,
  HeightReference,
  PolylineDashMaterialProperty,
  type Entity,
  type Viewer,
} from 'cesium'
import type { AreaPoint } from '@/core/geo/areaTypes.ts'
import { usePolygonStore } from '@/store/usePolygonStore.ts'
import {
  POLYGON_FILL_ID,
  POLYGON_OUTLINE_ID,
  POLYGON_PREVIEW_ID,
  POLYGON_VERTEX_PREFIX,
} from './polygonEntityIds'
import { polygonDegrees } from './polygonGeometry'

const POLYGON_COLOR = Color.fromCssColorString('#059669')
const FIRST_VERTEX_COLOR = Color.fromCssColorString('#f59e0b')
const VERTEX_OUTLINE_COLOR = Color.WHITE
const POLYGON_FILL_COLOR = Color.fromCssColorString('#10b981').withAlpha(0.18)

/**
 * يرسم مضلع المخزن (T5.1 — ADR-034):
 * رؤوسًا مميزة، خطًا خارجيًا مثبتًا على الأرض، تعبئة شفافة،
 * وخط معاينة متقطعًا يقرأ المؤشر من ref بلا إعادة رسم React.
 */
export function usePolygonEntities(
  viewer: Viewer | null,
  previewRef: RefObject<AreaPoint | null>,
): void {
  const vertices = usePolygonStore((state) => state.vertices)
  const status = usePolygonStore((state) => state.status)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const entities: Entity[] = []

    vertices.forEach((vertex, index) => {
      entities.push(
        viewer.entities.add({
          id: `${POLYGON_VERTEX_PREFIX}${index}`,
          position: Cartesian3.fromDegrees(
            vertex.lon,
            vertex.lat,
            vertex.height ?? 0,
          ),
          point: {
            pixelSize: index === 0 ? 12 : 9,
            color: index === 0 ? FIRST_VERTEX_COLOR : POLYGON_COLOR,
            outlineColor: VERTEX_OUTLINE_COLOR,
            outlineWidth: 2,
            heightReference: HeightReference.CLAMP_TO_GROUND,
          },
        }),
      )
    })

    if (vertices.length >= 2) {
      entities.push(
        viewer.entities.add({
          id: POLYGON_OUTLINE_ID,
          polyline: {
            positions: Cartesian3.fromDegreesArray(
              polygonDegrees(vertices, status === 'closed'),
            ),
            width: 3,
            material: POLYGON_COLOR,
            arcType: ArcType.GEODESIC,
            clampToGround: true,
          },
        }),
      )
    }

    if (vertices.length >= 3) {
      entities.push(
        viewer.entities.add({
          id: POLYGON_FILL_ID,
          polygon: {
            hierarchy: Cartesian3.fromDegreesArray(
              polygonDegrees(vertices, false),
            ),
            material: POLYGON_FILL_COLOR,
            height: 0,
            heightReference: HeightReference.CLAMP_TO_GROUND,
          },
        }),
      )
    }

    if (status === 'drawing' && vertices.length >= 1) {
      entities.push(
        viewer.entities.add({
          id: POLYGON_PREVIEW_ID,
          polyline: {
            positions: new CallbackProperty(() => {
              const current = usePolygonStore.getState().vertices
              const preview = previewRef.current
              if (!preview || current.length === 0) {
                return []
              }
              const last = current[current.length - 1]
              return [
                Cartesian3.fromDegrees(last.lon, last.lat, last.height ?? 0),
                Cartesian3.fromDegrees(preview.lon, preview.lat),
              ]
            }, false),
            width: 2,
            material: new PolylineDashMaterialProperty({
              color: POLYGON_COLOR,
            }),
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
  }, [previewRef, status, viewer, vertices])
}
