import { useTranslation } from 'react-i18next'
import {
  AREA_UNITS,
  DISTANCE_UNITS,
  type AreaUnit,
  type DistanceUnit,
} from '@/core/units/unitTypes.ts'
import {
  COORDINATE_FORMATS,
  type CoordinateFormat,
} from '@/core/coords/formatPoint.ts'
import { setLanguage, type AppLanguage } from '@/i18n/i18n.ts'
import { useSettingsStore } from '@/store/useSettingsStore'

const LANGUAGES: readonly AppLanguage[] = ['ar', 'en']

/**
 * شاشة الإعدادات (T6.4 — ADR-035): وحدات العرض وصيغة الإحداثيات واللغة.
 * القيم تُحفظ في Dexie واللغة في localStorage للتهيئة الفورية.
 */
export function SettingsPanel() {
  const { t, i18n } = useTranslation()
  const distanceUnit = useSettingsStore((state) => state.distanceUnit)
  const areaUnit = useSettingsStore((state) => state.areaUnit)
  const coordinateFormat = useSettingsStore((state) => state.coordinateFormat)
  const setDistanceUnit = useSettingsStore((state) => state.setDistanceUnit)
  const setAreaUnit = useSettingsStore((state) => state.setAreaUnit)
  const setCoordinateFormat = useSettingsStore(
    (state) => state.setCoordinateFormat,
  )
  const currentLanguage: AppLanguage =
    i18n.resolvedLanguage === 'en' ? 'en' : 'ar'

  return (
    <section className="settings-panel" aria-label={t('settings.title')}>
      <h2 className="sidebar-title">{t('settings.title')}</h2>

      <label className="settings-field">
        <span>{t('settings.distanceUnit')}</span>
        <select
          value={distanceUnit}
          onChange={(event) =>
            setDistanceUnit(event.target.value as DistanceUnit)
          }
        >
          {DISTANCE_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {t(`results.units.${unit}`)}
            </option>
          ))}
        </select>
      </label>

      <label className="settings-field">
        <span>{t('settings.areaUnit')}</span>
        <select
          value={areaUnit}
          onChange={(event) => setAreaUnit(event.target.value as AreaUnit)}
        >
          {AREA_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {t(`area.units.${unit}`)}
            </option>
          ))}
        </select>
      </label>

      <label className="settings-field">
        <span>{t('settings.coordinateFormat')}</span>
        <select
          value={coordinateFormat}
          onChange={(event) =>
            setCoordinateFormat(event.target.value as CoordinateFormat)
          }
        >
          {COORDINATE_FORMATS.map((format) => (
            <option key={format} value={format}>
              {t(`settings.formats.${format}`)}
            </option>
          ))}
        </select>
      </label>

      <label className="settings-field">
        <span>{t('settings.language')}</span>
        <select
          value={currentLanguage}
          onChange={(event) =>
            void setLanguage(event.target.value as AppLanguage)
          }
        >
          {LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {t(`settings.languages.${language}`)}
            </option>
          ))}
        </select>
      </label>

      <p className="points-hint">{t('settings.hint')}</p>
    </section>
  )
}
