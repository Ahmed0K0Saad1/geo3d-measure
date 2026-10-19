import { useRef } from 'react'
import { useCesiumViewer, type LayerState } from './useCesiumViewer'

interface MapViewProps {
  layerState: LayerState
}

export function MapView({ layerState }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useCesiumViewer(containerRef, layerState)

  return <div ref={containerRef} className="map-view" />
}
