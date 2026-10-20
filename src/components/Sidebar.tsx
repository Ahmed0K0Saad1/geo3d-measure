import { useTranslation } from 'react-i18next'
import type { GeoPoint } from '@/core/geo/GeoPoint.ts'
import { PointsPanel } from '@/features/points/PointsPanel'
import { PointsTools } from '@/features/points/PointsTools'
import { ResultsPanel } from '@/features/points/ResultsPanel'

const TOOL_KEYS = [
  'points',
  'measure',
  'polygon',
  'export',
  'settings',
] as const

interface SidebarProps {
  isClickMode: boolean
  onToggleClickMode: () => void
  onFocusPoint: (point: GeoPoint) => void
}

export function Sidebar({
  isClickMode,
  onToggleClickMode,
  onFocusPoint,
}: SidebarProps) {
  const { t } = useTranslation()

  return (
    <aside className="app-sidebar">
      <PointsTools
        isClickMode={isClickMode}
        onToggleClickMode={onToggleClickMode}
      />
      <PointsPanel onFocusPoint={onFocusPoint} />
      <ResultsPanel />
      <h2 className="sidebar-title">{t('sidebar.tools')}</h2>
      <nav className="sidebar-tools">
        {TOOL_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="sidebar-tool"
            disabled
            title={t('header.comingSoon')}
          >
            {t(`sidebar.${key}`)}
          </button>
        ))}
      </nav>
    </aside>
  )
}
