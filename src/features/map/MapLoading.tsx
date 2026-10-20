import { useTranslation } from 'react-i18next'

/**
 * شاشة انتظار أثناء تحميل حزمة Cesium الكسولة (T7.2 — R-1).
 * تُعرض داخل مساحة الخريطة ولا تمنع استخدام أدوات الشريط الجانبي.
 */
export function MapLoading() {
  const { t } = useTranslation()

  return (
    <div className="map-loading" role="status" aria-live="polite">
      <span className="map-loading__spinner" aria-hidden="true" />
      <p className="map-loading__text">{t('map.loading')}</p>
    </div>
  )
}
