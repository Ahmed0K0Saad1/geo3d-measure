import type { GeoPoint } from '@/core/geo/GeoPoint.ts'
import { AreaComparison } from '@/features/polygon/AreaComparison'
import { PolygonTools } from '@/features/polygon/PolygonTools'
import { PointsPanel } from '@/features/points/PointsPanel'
import { PointsTools } from '@/features/points/PointsTools'
import { ResultsPanel } from '@/features/points/ResultsPanel'

interface SidebarProps {
  isClickMode: boolean
  onToggleClickMode: () => void
  isPolygonMode: boolean
  onTogglePolygonMode: () => void
  onFocusPoint: (point: GeoPoint) => void
}

export function Sidebar({
  isClickMode,
  onToggleClickMode,
  isPolygonMode,
  onTogglePolygonMode,
  onFocusPoint,
}: SidebarProps) {
  return (
    <aside className="app-sidebar">
      <PointsTools
        isClickMode={isClickMode}
        onToggleClickMode={onToggleClickMode}
      />
      <PointsPanel onFocusPoint={onFocusPoint} />
      <ResultsPanel />
      <PolygonTools
        isPolygonMode={isPolygonMode}
        onTogglePolygonMode={onTogglePolygonMode}
      />
      <AreaComparison />
    </aside>
  )
}
