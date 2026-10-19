import { useRef } from 'react'
import { useCesiumViewer } from './useCesiumViewer'

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null)

  useCesiumViewer(containerRef)

  return <div ref={containerRef} className="map-view" />
}
