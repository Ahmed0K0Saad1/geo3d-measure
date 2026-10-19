import { useRef } from 'react'
import { useCesiumViewer, type LayerState } from './useCesiumViewer'
import { usePointEntities } from './usePointEntities'

interface MapViewProps {
  layerState: LayerState
}

export function MapView({ layerState }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewer = useCesiumViewer(containerRef, layerState)

  // البيئة الأولى لكل مصدر إدخال في P2: النقاط تظهر على الكرة (ADR-024)
  usePointEntities(viewer)

  return <div ref={containerRef} className="map-view" />
}
