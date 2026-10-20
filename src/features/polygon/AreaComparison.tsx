import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { areaGeodesic } from '@/core/geo/areaGeodesic.ts'
import { areaUtm } from '@/core/geo/areaUtm.ts'
import {
  IMPERIAL_AREA_UNITS,
  METRIC_AREA_UNITS,
  type AreaUnit,
} from '@/core/units/unitTypes.ts'
import { usePolygonStore } from '@/store/usePolygonStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { areaDifference, formatArea, formatPercent } from './areaFormat'

/**
 * لوحة مقارنة المساحة الجيوديسية ومساحة UTM+Shoelace (T5.4 — ADR-034).
 * تعرض المساحتين والفرق وسببه، مع تحذيرات الحالات الحدية.
 */
export function AreaComparison() {
  const { t } = useTranslation()
  const vertices = usePolygonStore((state) => state.vertices)
  const status = usePolygonStore((state) => state.status)
  const unit = useSettingsStore((state) => state.areaUnit)
  const setUnit = useSettingsStore((state) => state.setAreaUnit)

  const geodesic = useMemo(() => areaGeodesic(vertices), [vertices])
  const utm = useMemo(() => areaUtm(vertices), [vertices])
  const utmSquareMeters = utm?.squareMeters ?? null
  const difference =
    geodesic && utmSquareMeters !== null
      ? areaDifference(geodesic.squareMeters, utmSquareMeters)
      : null

  if (vertices.length < 3 || !geodesic) {
    return (
      <section className="area-panel" aria-label={t('area.title')}>
        <h2 className="sidebar-title">{t('area.title')}</h2>
        <p className="points-hint">{t('area.empty')}</p>
      </section>
    )
  }

  const unitLabel = t(`area.units.${unit}`)

  return (
    <section className="area-panel" aria-label={t('area.title')}>
      <h2 className="sidebar-title">{t('area.title')}</h2>

      <div className="area-header">
        <span
          className={
            status === 'closed' ? 'area-badge area-badge--closed' : 'area-badge'
          }
        >
          {status === 'closed'
            ? t('area.status.closed')
            : t('area.status.open')}
        </span>

        <label className="area-unit-field">
          <span>{t('area.unitLabel')}</span>
          <select
            value={unit}
            aria-label={t('area.unitLabel')}
            onChange={(event) => setUnit(event.target.value as AreaUnit)}
          >
            <optgroup label={t('area.groups.metric')}>
              {METRIC_AREA_UNITS.map((candidate) => (
                <option key={candidate} value={candidate}>
                  {t(`area.units.${candidate}`)}
                </option>
              ))}
            </optgroup>
            <optgroup label={t('area.groups.imperial')}>
              {IMPERIAL_AREA_UNITS.map((candidate) => (
                <option key={candidate} value={candidate}>
                  {t(`area.units.${candidate}`)}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
      </div>

      <div className="area-grid">
        <article className="area-card">
          <h3>{t('area.geodesic')}</h3>
          <p className="area-value" dir="ltr">
            {formatArea(geodesic.squareMeters, unit)}{' '}
            <span className="area-unit-label">{unitLabel}</span>
          </p>
          <p className="area-method">{t(geodesic.methodKey)}</p>
        </article>

        <article className="area-card">
          <h3>{t('area.utm')}</h3>
          {utmSquareMeters !== null ? (
            <p className="area-value" dir="ltr">
              {formatArea(utmSquareMeters, unit)}{' '}
              <span className="area-unit-label">{unitLabel}</span>
            </p>
          ) : (
            <p className="area-unavailable">{t('area.utmUnavailable')}</p>
          )}
          {utm?.zone !== null && utm?.zone !== undefined && (
            <p className="area-method">
              {t('measure.method.utmShoelace', {
                zone: utm.zone,
                hemisphere: utm.hemisphere,
              })}
            </p>
          )}
        </article>
      </div>

      {difference && (
        <div className="area-difference">
          <p className="area-difference__percent">
            {t(`area.difference.${difference.direction}`, {
              percent: formatPercent(difference.signedPercent),
            })}
          </p>
          {difference.direction !== 'equal' && (
            <p className="area-difference__absolute" dir="ltr">
              {t('area.difference.absolute', {
                area: formatArea(difference.absoluteSquareMeters, unit),
                unit: unitLabel,
              })}
            </p>
          )}
        </div>
      )}

      <p className="area-explanation">{t('area.explanation')}</p>

      {utm && utm.warnings.length > 0 && (
        <ul className="area-warnings">
          {utm.warnings.map((warning) => (
            <li key={warning} className="area-warning">
              {t(`area.warnings.${warning}`, {
                zone: utm.zone ?? '—',
                hemisphere: utm.hemisphere ?? '—',
              })}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
