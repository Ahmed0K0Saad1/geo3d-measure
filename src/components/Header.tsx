import { useTranslation } from 'react-i18next'
import { setLanguage, type AppLanguage } from '@/i18n/i18n'

const LANGUAGES: AppLanguage[] = ['ar', 'en']

export function Header() {
  const { t, i18n } = useTranslation()
  const currentLanguage: AppLanguage =
    i18n.resolvedLanguage === 'en' ? 'en' : 'ar'

  return (
    <header className="app-header">
      <h1 className="app-title">{t('app.title')}</h1>
      <div className="app-header-controls">
        <div
          className="language-switch"
          role="group"
          aria-label={t('header.language')}
        >
          {LANGUAGES.map((language) => (
            <button
              key={language}
              type="button"
              className="language-button"
              aria-pressed={language === currentLanguage}
              onClick={() => void setLanguage(language)}
            >
              {language.toUpperCase()}
            </button>
          ))}
        </div>

        <label className="units-control">
          <span>{t('header.units')}</span>
          <select disabled title={t('header.comingSoon')}>
            <option>{t('header.unitsMetric')}</option>
          </select>
        </label>
      </div>
    </header>
  )
}
