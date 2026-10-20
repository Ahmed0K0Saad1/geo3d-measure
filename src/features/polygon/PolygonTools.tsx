import { useTranslation } from 'react-i18next'
import { usePolygonStore } from '@/store/usePolygonStore'

interface PolygonToolsProps {
  isPolygonMode: boolean
  onTogglePolygonMode: () => void
}

/**
 * أدوات رسم المضلع (T5.1 — ADR-034):
 * البدء/الإنهاء والتراجع والمسح، مع عرض عدد الرؤوس.
 */
export function PolygonTools({
  isPolygonMode,
  onTogglePolygonMode,
}: PolygonToolsProps) {
  const { t } = useTranslation()
  const vertices = usePolygonStore((state) => state.vertices)
  const status = usePolygonStore((state) => state.status)
  const startDrawing = usePolygonStore((state) => state.startDrawing)
  const undoVertex = usePolygonStore((state) => state.undoVertex)
  const clear = usePolygonStore((state) => state.clear)
  const close = usePolygonStore((state) => state.close)

  const start = (): void => {
    startDrawing()
    onTogglePolygonMode()
  }

  const finish = (): void => {
    if (vertices.length >= 3) {
      close()
    } else {
      clear()
    }
    onTogglePolygonMode()
  }

  return (
    <section className="polygon-tools" aria-label={t('polygon.title')}>
      <h2 className="sidebar-title">{t('polygon.title')}</h2>

      <button
        type="button"
        className="sidebar-tool"
        aria-pressed={isPolygonMode}
        onClick={isPolygonMode ? finish : start}
      >
        {isPolygonMode
          ? t('polygon.finish')
          : vertices.length > 0
            ? t('polygon.resume')
            : t('polygon.start')}
      </button>

      <div className="polygon-actions">
        <button
          type="button"
          className="points-action"
          onClick={undoVertex}
          disabled={!isPolygonMode || vertices.length === 0}
        >
          {t('polygon.undo')}
        </button>
        <button
          type="button"
          className="points-action"
          onClick={clear}
          disabled={vertices.length === 0}
        >
          {t('polygon.clear')}
        </button>
      </div>

      <p className="polygon-count">
        {t('polygon.vertices', { count: vertices.length })}
      </p>

      {isPolygonMode && <p className="points-hint">{t('polygon.hint')}</p>}
      {!isPolygonMode && status === 'closed' && (
        <p className="points-hint">{t('polygon.closedHint')}</p>
      )}
      {!isPolygonMode && vertices.length === 0 && (
        <p className="points-hint">{t('polygon.empty')}</p>
      )}
    </section>
  )
}
