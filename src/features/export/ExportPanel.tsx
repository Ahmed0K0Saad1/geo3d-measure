import { useTranslation } from 'react-i18next'
import { downloadExport, type ExportFormat } from '@/services/exportService.ts'
import { usePointsStore } from '@/store/usePointsStore'
import { usePolygonStore } from '@/store/usePolygonStore'
import { useSessionStore } from '@/store/useSessionStore'

const FORMATS: readonly ExportFormat[] = ['geojson', 'kml', 'csv']

/**
 * أزرار تصدير الحالة الحالية (T6.3 — ADR-035):
 * GeoJSON / KML / CSV، وتُعطّل عند غياب نقاط أو مضلع صالح.
 */
export function ExportPanel() {
  const { t } = useTranslation()
  const points = usePointsStore((state) => state.points)
  const vertices = usePolygonStore((state) => state.vertices)
  const sessionName = useSessionStore((state) => state.name)

  const hasPolygon = vertices.length >= 3
  const hasData = points.length > 0 || hasPolygon
  const baseName = sessionName.trim() || t('export.defaultName')

  return (
    <section className="export-panel" aria-label={t('export.title')}>
      <h2 className="sidebar-title">{t('export.title')}</h2>
      <p className="points-hint">
        {t('export.summary', {
          points: points.length,
          vertices: vertices.length,
        })}
      </p>

      <div
        className="export-actions"
        role="group"
        aria-label={t('export.formatsLabel')}
      >
        {FORMATS.map((format) => (
          <button
            key={format}
            type="button"
            className="points-action export-button"
            disabled={!hasData}
            onClick={() =>
              downloadExport(format, { points, polygon: vertices }, baseName)
            }
          >
            {t(`export.formats.${format}`)}
          </button>
        ))}
      </div>

      {!hasData && <p className="points-hint">{t('export.empty')}</p>}
    </section>
  )
}
