import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { GeoPoint } from '@/core/geo/GeoPoint.ts'
import { moveItem } from '@/lib/collections'
import { usePointsStore } from '@/store/usePointsStore'

interface PointsPanelProps {
  onFocusPoint: (point: GeoPoint) => void
}

/**
 * قائمة النقاط: ترقيم 1..n · تسمية · حذف · إعادة ترتيب · تركيز (T2.7).
 * لا تعرف Cesium: التركيز يمر عبر `onFocusPoint` إلى MapView (ADR-030).
 */
export function PointsPanel({ onFocusPoint }: PointsPanelProps) {
  const { t } = useTranslation()
  const points = usePointsStore((state) => state.points)
  const selectedPointId = usePointsStore((state) => state.selectedPointId)
  const removePoint = usePointsStore((state) => state.removePoint)
  const updatePoint = usePointsStore((state) => state.updatePoint)
  const reorderPoints = usePointsStore((state) => state.reorderPoints)
  const selectPoint = usePointsStore((state) => state.selectPoint)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftLabel, setDraftLabel] = useState('')

  const startEditing = (point: GeoPoint): void => {
    setEditingId(point.id)
    setDraftLabel(point.label ?? '')
  }

  const cancelEditing = (): void => {
    setEditingId(null)
    setDraftLabel('')
  }

  const saveLabel = (id: string): void => {
    const label = draftLabel.trim()
    updatePoint(id, { label: label === '' ? undefined : label })
    cancelEditing()
  }

  const deletePoint = (id: string): void => {
    removePoint(id)
    if (selectedPointId === id) {
      selectPoint(null)
    }
    if (editingId === id) {
      cancelEditing()
    }
  }

  const focusPoint = (point: GeoPoint): void => {
    selectPoint(point.id)
    onFocusPoint(point)
  }

  const move = (index: number, offset: -1 | 1): void => {
    const ids = points.map((point) => point.id)
    const nextIds = moveItem(ids, index, offset)
    if (nextIds !== ids) {
      reorderPoints(nextIds)
    }
  }

  return (
    <section
      className="points-panel"
      aria-label={t('points.panel.title', { total: points.length })}
    >
      <h2 className="sidebar-title">
        {t('points.panel.title', { total: points.length })}
      </h2>

      {points.length === 0 ? (
        <p className="points-hint">{t('points.panel.empty')}</p>
      ) : (
        <ol className="points-list">
          {points.map((point, index) => {
            const number = index + 1
            const isSelected = selectedPointId === point.id
            const isEditing = editingId === point.id
            const displayLabel =
              point.label?.trim() || t('points.panel.unnamed', { number })

            return (
              <li
                key={point.id}
                className={
                  isSelected
                    ? 'points-item points-item--selected'
                    : 'points-item'
                }
              >
                <span className="points-item__number" aria-hidden="true">
                  {number}
                </span>
                <div className="points-item__body">
                  {isEditing ? (
                    <div className="points-item__edit">
                      <input
                        type="text"
                        value={draftLabel}
                        onChange={(event) => setDraftLabel(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            saveLabel(point.id)
                          }
                          if (event.key === 'Escape') {
                            cancelEditing()
                          }
                        }}
                        aria-label={t('points.panel.labelInput', { number })}
                        autoFocus
                      />
                      <div className="points-item__actions">
                        <button
                          type="button"
                          className="points-action"
                          onClick={() => saveLabel(point.id)}
                        >
                          {t('points.panel.save')}
                        </button>
                        <button
                          type="button"
                          className="points-action"
                          onClick={cancelEditing}
                        >
                          {t('points.panel.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="points-item__label">{displayLabel}</span>
                      <span className="points-item__coords" dir="ltr">
                        {point.lat.toFixed(5)}, {point.lon.toFixed(5)}
                      </span>
                      <div className="points-item__actions">
                        <button
                          type="button"
                          className="points-action"
                          onClick={() => focusPoint(point)}
                        >
                          {t('points.panel.focus')}
                        </button>
                        <button
                          type="button"
                          className="points-action"
                          onClick={() => startEditing(point)}
                        >
                          {t('points.panel.edit')}
                        </button>
                        <button
                          type="button"
                          className="points-action"
                          onClick={() => move(index, -1)}
                          disabled={index === 0}
                          title={t('points.panel.moveUp', { number })}
                          aria-label={t('points.panel.moveUp', { number })}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="points-action"
                          onClick={() => move(index, 1)}
                          disabled={index === points.length - 1}
                          title={t('points.panel.moveDown', { number })}
                          aria-label={t('points.panel.moveDown', { number })}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="points-action"
                          onClick={() => deletePoint(point.id)}
                        >
                          {t('points.panel.delete')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
