import { useTranslation } from 'react-i18next'

const TOOL_KEYS = [
  'points',
  'measure',
  'polygon',
  'export',
  'settings',
] as const

export function Sidebar() {
  const { t } = useTranslation()

  return (
    <aside className="app-sidebar">
      <h2 className="sidebar-title">{t('sidebar.tools')}</h2>
      <nav className="sidebar-tools">
        {TOOL_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="sidebar-tool"
            disabled
            title={t('header.comingSoon')}
          >
            {t(`sidebar.${key}`)}
          </button>
        ))}
      </nav>
    </aside>
  )
}
