import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { GeocodingResult } from '@/services/geocoding'
import { useGeocoding } from './useGeocoding'

/** بحث بالاسم مع قائمة نتائج وإسناد OSM (T2.6). */
export function GeocodingSearch() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const { search, results, loading, error, selectResult } = useGeocoding()

  const changeQuery = (value: string): void => {
    setQuery(value)
    search(value)
  }

  const choose = (result: GeocodingResult): void => {
    selectResult(result)
    setQuery('')
  }

  const showEmpty =
    query.trim() !== '' && !loading && error === null && results.length === 0

  return (
    <div className="geocoding">
      <label className="manual-field">
        <span>{t('points.search.label')}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
          placeholder={t('points.search.placeholder')}
          spellCheck={false}
        />
      </label>

      {loading && <p className="points-hint">{t('points.search.loading')}</p>}
      {error !== null && (
        <p className="points-error" role="alert">
          {t(`points.search.errors.${error}`)}
        </p>
      )}
      {showEmpty && <p className="points-hint">{t('points.search.empty')}</p>}

      {results.length > 0 && (
        <ul className="geocoding-results">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                className="geocoding-result"
                onClick={() => choose(result)}
              >
                <span className="geocoding-result__label">{result.label}</span>
                <span className="geocoding-result__coords" dir="ltr">
                  {result.lat.toFixed(5)}, {result.lon.toFixed(5)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="geocoding-attribution">
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          {t('points.search.attribution')}
        </a>
      </p>
    </div>
  )
}
