import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BASE_LAYER_IDS, type BaseLayerId } from '@/features/map/layerSources'
import type { LayerState } from '@/features/map/layerState'

interface LayerSelectorProps {
  state: LayerState
  onBaseLayerChange: (baseLayer: BaseLayerId) => void
  onToggle: (key: 'labels' | 'terrain') => void
}

/**
 * قائمة طبقات مخصصة (ADR-021/022): بديل BaseLayerPicker المدمج الذي أُوقف
 * لأن بنوده الافتراضية تشير إلى خدمات ميتة (Bing) أو تتطلب مفاتيح.
 * خريطة أساس واحدة (radio) + طبقات إضافية (checkbox).
 */
export function LayerSelector({
  state,
  onBaseLayerChange,
  onToggle,
}: LayerSelectorProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

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
        triggerRef.current?.focus()
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
        ref={triggerRef}
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
          <p className="layer-menu-heading">{t('layers.baseMaps')}</p>
          {BASE_LAYER_IDS.map((id) => (
            <label key={id} className="layer-menu-option">
              <input
                type="radio"
                name="geo3d-base-layer"
                className="layer-input"
                checked={state.baseLayer === id}
                onChange={() => onBaseLayerChange(id)}
              />
              <span>{t(`layers.${id}`)}</span>
            </label>
          ))}

          <p className="layer-menu-heading">{t('layers.overlays')}</p>
          <label className="layer-menu-option">
            <input
              type="checkbox"
              className="layer-input"
              checked={state.labels}
              onChange={() => onToggle('labels')}
            />
            <span>{t('layers.labels')}</span>
          </label>
          <label className="layer-menu-option">
            <input
              type="checkbox"
              className="layer-input"
              checked={state.terrain}
              onChange={() => onToggle('terrain')}
            />
            <span>{t('layers.terrain')}</span>
          </label>
        </div>
      )}
    </div>
  )
}
