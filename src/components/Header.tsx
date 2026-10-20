import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { setLanguage, type AppLanguage } from '@/i18n/i18n'

const LANGUAGES: AppLanguage[] = ['ar', 'en']

interface HeaderProps {
  children?: ReactNode
}

export function Header({ children }: HeaderProps) {
  const { t, i18n } = useTranslation()
  const currentLanguage: AppLanguage =
    i18n.resolvedLanguage === 'en' ? 'en' : 'ar'

  return (
    <header className="app-header">
      <h1 className="app-title">{t('app.title')}</h1>
      <div className="app-header-controls">
        {children}
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
      </div>
    </header>
  )
}
