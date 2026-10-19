import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from './ar.json'
import en from './en.json'

export type AppLanguage = 'ar' | 'en'

const STORAGE_KEY = 'geo3d.lang'
const DEFAULT_LANGUAGE: AppLanguage = 'ar'

function readStoredLanguage(): AppLanguage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'ar' || stored === 'en') {
      return stored
    }
  } catch {
    // بعض البيئات تمنع الوصول إلى localStorage — نعود إلى الافتراضي
  }
  return DEFAULT_LANGUAGE
}

/** يزامن lang/dir على عنصر html لتبديل RTL/LTR فورياً. */
export function applyDocumentLanguage(language: AppLanguage): void {
  document.documentElement.lang = language
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
}

/** يبدّل اللغة: تحديث فوري للمكوّنات + حفظ الاختيار + تحديث اتجاه المستند. */
export async function setLanguage(language: AppLanguage): Promise<void> {
  await i18n.changeLanguage(language)
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    // تجاهل: تعذّر الحفظ في هذه البيئة
  }
  applyDocumentLanguage(language)
}

const initialLanguage = readStoredLanguage()

void i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

applyDocumentLanguage(initialLanguage)
