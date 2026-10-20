import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { HaversineStrategy } from '@/core/geo/haversine.ts'
import { computePath } from '@/core/geo/path.ts'
import { DISTANCE_UNITS } from '@/core/units/unitTypes.ts'
import { usePointsStore } from '@/store/usePointsStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { formatBearing, formatDistance } from './resultsFormat'

const strategy = new HaversineStrategy()

/**
 * لوحة نتائج المسار (T4.3 — ADR-033):
 * جدول المقاطع + الإجمالي + تبديل الوحدات + اسم المنهجية (FR-14).
 * صفوف المقاطع أزرار تختار المقطع المميّز على الكرة.
 */
export function ResultsPanel() {
  const { t } = useTranslation()
  const points = usePointsStore((state) => state.points)
  const selectedSegmentIndex = usePointsStore(
    (state) => state.selectedSegmentIndex,
  )
  const selectSegment = usePointsStore((state) => state.selectSegment)
  const unit = useSettingsStore((state) => state.distanceUnit)
  const setUnit = useSettingsStore((state) => state.setDistanceUnit)

  const result = useMemo(() => computePath(points, strategy), [points])

  return (
    <section className="results-panel" aria-label={t('results.title')}>
      <h2 className="sidebar-title">{t('results.title')}</h2>

      {points.length < 2 ? (
        <p className="points-hint">{t('results.empty')}</p>
      ) : (
        <>
          <div
            className="results-units"
            role="group"
            aria-label={t('results.unitsLabel')}
          >
            {DISTANCE_UNITS.map((candidate) => (
              <button
                key={candidate}
                type="button"
                className="results-unit-button"
                aria-pressed={unit === candidate}
                onClick={() => setUnit(candidate)}
              >
                {t(`results.units.${candidate}`)}
              </button>
            ))}
          </div>

          <table className="results-table" aria-label={t('results.caption')}>
            <thead>
              <tr>
                <th scope="col" className="results-col-index">
                  {t('results.columns.index')}
                </th>
                <th scope="col">{t('results.columns.segment')}</th>
                <th scope="col">{t('results.columns.distance')}</th>
                <th scope="col">{t('results.columns.initialBearing')}</th>
                <th scope="col">{t('results.columns.finalBearing')}</th>
              </tr>
            </thead>
            <tbody>
              {result.segments.map((segment, index) => {
                const isSelected = selectedSegmentIndex === index
                const from = index + 1
                const to = index + 2

                return (
                  <tr
                    key={index}
                    className={
                      isSelected
                        ? 'results-row results-row--selected'
                        : 'results-row'
                    }
                  >
                    <th scope="row" className="results-index">
                      {index + 1}
                    </th>
                    <td>
                      <button
                        type="button"
                        className="results-segment"
                        aria-pressed={isSelected}
                        aria-label={t('results.selectSegment', {
                          number: index + 1,
                        })}
                        onClick={() => selectSegment(isSelected ? null : index)}
                      >
                        <span dir="ltr">
                          {t('results.segmentValue', { from, to })}
                        </span>
                      </button>
                    </td>
                    <td className="results-num">
                      <span dir="ltr">
                        {formatDistance(segment.meters, unit)}
                      </span>{' '}
                      <span className="results-unit-label">
                        {t(`results.units.${unit}`)}
                      </span>
                    </td>
                    <td className="results-num" dir="ltr">
                      {formatBearing(segment.initialBearingDeg)}
                    </td>
                    <td className="results-num" dir="ltr">
                      {formatBearing(segment.finalBearingDeg)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="results-total">
                <th scope="row" colSpan={2}>
                  {t('results.total')}
                </th>
                <td className="results-num">
                  <span dir="ltr">
                    {formatDistance(result.totalMeters, unit)}
                  </span>{' '}
                  <span className="results-unit-label">
                    {t(`results.units.${unit}`)}
                  </span>
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>

          <p className="results-method">
            {t('results.method', { method: t(strategy.labelKey) })}
          </p>
        </>
      )}
    </section>
  )
}
