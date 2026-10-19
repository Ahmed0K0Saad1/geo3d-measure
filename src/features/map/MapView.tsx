import { useRef } from 'react'
import { useCesiumViewer, type LayerState } from './useCesiumViewer'
import { useFlyTo, type FlyToRequest } from './useFlyTo'
import { useMapClick } from './useMapClick'
import { usePointEntities } from './usePointEntities'

interface MapViewProps {
  layerState: LayerState
  isClickMode: boolean
  onClickModeEnd: () => void
  flyToRequest: FlyToRequest | null
}

export function MapView({
  layerState,
  isClickMode,
  onClickModeEnd,
  flyToRequest,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewer = useCesiumViewer(containerRef, layerState)

  // البيئة الأولى لكل مصدر إدخال في P2: النقاط تظهر على الكرة (ADR-024)
  usePointEntities(viewer)
  useMapClick(viewer, isClickMode, onClickModeEnd)
  useFlyTo(viewer, flyToRequest)

  return (
    <div
      ref={containerRef}
      className={isClickMode ? 'map-view map-view--click' : 'map-view'}
    />
  )
}
