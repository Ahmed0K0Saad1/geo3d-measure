import { useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useCesiumViewer } from './useCesiumViewer'
import type { LayerState } from './layerState'
import { useFlyTo, type FlyToRequest } from './useFlyTo'
import { useMapClick } from './useMapClick'
import { usePathEntities } from './usePathEntities'
import { usePointEntities } from './usePointEntities'
import { usePointHover } from './usePointHover'
import { usePolygonDraw } from './usePolygonDraw'
import { usePolygonEntities } from './usePolygonEntities'
import { PointTooltip } from './PointTooltip'
import { useSessionStore } from '@/store/useSessionStore'

interface MapViewProps {
  layerState: LayerState
  isClickMode: boolean
  onClickModeEnd: () => void
  isPolygonMode: boolean
  onPolygonModeEnd: () => void
  flyToRequest: FlyToRequest | null
}

export function MapView({
  layerState,
  isClickMode,
  onClickModeEnd,
  isPolygonMode,
  onPolygonModeEnd,
  flyToRequest,
}: MapViewProps) {
  const { t } = useTranslation()
  const keyboardHintId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const viewer = useCesiumViewer(containerRef, layerState)
  const hovered = usePointHover(viewer)
  const fitAllToken = useSessionStore((state) => state.fitAllToken)
  const { previewRef } = usePolygonDraw(viewer, isPolygonMode, onPolygonModeEnd)

  // البيئة الأولى لكل مصدر إدخال في P2: النقاط تظهر على الكرة (ADR-024)
  usePointEntities(viewer)
  usePathEntities(viewer)
  usePolygonEntities(viewer, previewRef)
  useMapClick(viewer, isClickMode, onClickModeEnd)
  useFlyTo(viewer, flyToRequest, fitAllToken)

  return (
    <div
      className={
        isClickMode || isPolygonMode ? 'map-view map-view--drawing' : 'map-view'
      }
      role="region"
      aria-label={t('map.regionLabel')}
      aria-describedby={keyboardHintId}
    >
      <p id={keyboardHintId} className="visually-hidden">
        {t('map.keyboardHint')}
      </p>
      <div ref={containerRef} className="map-view__canvas" />
      {hovered && <PointTooltip hovered={hovered} />}
    </div>
  )
}
