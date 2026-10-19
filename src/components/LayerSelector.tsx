import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { LayerVisibility } from '@/features/map/useCesiumViewer'

const LAYER_KEYS: Array<keyof LayerVisibility> = [
  'imagery',
  'labels',
  'terrain',
]

interface LayerSelectorProps {
  visibility: LayerVisibility
  onToggle: (key: keyof LayerVisibility) => void
}

/**
 * قائمة طبقات مخصصة (ADR-021): بديل BaseLayerPicker المدمج الذي أُوقف
 * لأن بنوده الافتراضية تشير إلى خدمات ميتة (Bing) أو تتطلب مفاتيح.
 */
export function LayerSelector({ visibility, onToggle }: LayerSelectorProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // إغلاق عند النقر خارج القائمة أو بمفتاح Escape
  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (!(target instanceof Node) || containerRef.current?.contains(target)) {
        return
      }
      setOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="layer-selector" ref={containerRef}>
      <button
        type="button"
        className="layer-selector-button"
        aria-expanded={open}
        aria-label={t('layers.title')}
        title={t('layers.title')}
        onClick={() => setOpen((current) => !current)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2 2 7l10 5 10-5-10-5Z" />
          <path d="m2 12 10 5 10-5" />
          <path d="m2 17 10 5 10-5" />
        </svg>
      </button>

      {open && (
        <div className="layer-menu" role="group" aria-label={t('layers.title')}>
          {LAYER_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className="layer-menu-item"
              aria-pressed={visibility[key]}
              onClick={() => onToggle(key)}
            >
              <span className="layer-check" aria-hidden="true">
                {visibility[key] ? '✓' : ''}
              </span>
              <span>{t(`layers.${key}`)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
