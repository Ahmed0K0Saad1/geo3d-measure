import { useRef } from 'react'
import { useCesiumViewer } from '@/features/map/useCesiumViewer'

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)

  useCesiumViewer(containerRef)

  return <div ref={containerRef} className="cesium-container" />
}
