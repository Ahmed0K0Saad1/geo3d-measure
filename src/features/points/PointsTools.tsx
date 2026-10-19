import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GeocodingSearch } from './GeocodingSearch'
import { GeolocationError, type GeolocationErrorCode } from './geolocation'
import { ManualPointInput } from './ManualPointInput'
import { useGeolocation } from './useGeolocation'

interface PointsToolsProps {
  isClickMode: boolean
  onToggleClickMode: () => void
}

/** أدوات إدخال النقاط: GPS · النقر على الخريطة · البحث · الإدخال اليدوي (T2.2–T2.6). */
export function PointsTools({
  isClickMode,
  onToggleClickMode,
}: PointsToolsProps) {
  const { t } = useTranslation()
  const { getCurrentPosition } = useGeolocation()
  const [isLocating, setIsLocating] = useState(false)
  const [errorCode, setErrorCode] = useState<GeolocationErrorCode | null>(null)
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null)

  const locate = async (): Promise<void> => {
    setIsLocating(true)
    setErrorCode(null)
    try {
      const point = await getCurrentPosition(t('points.myLocation'))
      setAccuracyMeters(point.accuracy ?? null)
    } catch (error) {
      setErrorCode(error instanceof GeolocationError ? error.code : 'unknown')
      setAccuracyMeters(null)
    } finally {
      setIsLocating(false)
    }
  }

  return (
    <section className="points-tools" aria-label={t('points.title')}>
      <h2 className="sidebar-title">{t('points.title')}</h2>
      <button
        type="button"
        className="sidebar-tool"
        onClick={() => void locate()}
        disabled={isLocating}
      >
        {isLocating ? t('points.locating') : t('points.myLocation')}
      </button>
      {accuracyMeters !== null && (
        <p className="points-hint">
          {t('points.accuracy', { meters: Math.round(accuracyMeters) })}
        </p>
      )}
      {errorCode !== null && (
        <p className="points-error" role="alert">
          {t(`points.errors.${errorCode}`)}
        </p>
      )}
      <button
        type="button"
        className="sidebar-tool"
        aria-pressed={isClickMode}
        onClick={onToggleClickMode}
      >
        {isClickMode ? t('points.clickModeActive') : t('points.clickMode')}
      </button>
      {isClickMode && (
        <p className="points-hint">{t('points.clickModeHint')}</p>
      )}
      <GeocodingSearch />
      <ManualPointInput />
    </section>
  )
}
