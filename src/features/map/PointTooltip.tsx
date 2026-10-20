import { useTranslation } from 'react-i18next'
import { usePointsStore } from '@/store/usePointsStore'
import { clampTooltipPosition } from './tooltipPosition'
import type { HoveredPoint } from './usePointHover'

interface PointTooltipProps {
  hovered: HoveredPoint
}

/**
 * تلميح HTML فوق الخريطة عند تمرير المؤشر على دبوس (T4.1 — ADR-033).
 * مكوّن عرض فقط: لا يلمس Cesium، ويقرأ النقطة من المخزن بالمعرّف.
 */
export function PointTooltip({ hovered }: PointTooltipProps) {
  const { t } = useTranslation()
  const points = usePointsStore((state) => state.points)
  const index = points.findIndex((point) => point.id === hovered.pointId)

  if (index === -1) {
    return null
  }

  const point = points[index]
  const number = index + 1
  const label = point.label?.trim() || t('points.panel.unnamed', { number })
  const position = clampTooltipPosition(
    hovered.x,
    hovered.y,
    hovered.containerWidth,
    hovered.containerHeight,
  )

  return (
    <div
      className="point-tooltip"
      role="tooltip"
      style={{ left: `${position.left}px`, top: `${position.top}px` }}
    >
      <span className="point-tooltip__number" aria-hidden="true">
        {number}
      </span>
      <div className="point-tooltip__body">
        <span className="point-tooltip__label">{label}</span>
        <span className="point-tooltip__coords" dir="ltr">
          {point.lat.toFixed(5)}, {point.lon.toFixed(5)}
        </span>
      </div>
    </div>
  )
}
