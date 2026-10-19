import { useRef } from 'react'
import { useCesiumViewer, type LayerVisibility } from './useCesiumViewer'

interface MapViewProps {
  layerVisibility: LayerVisibility
}

export function MapView({ layerVisibility }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useCesiumViewer(containerRef, layerVisibility)

  return <div ref={containerRef} className="map-view" />
}
