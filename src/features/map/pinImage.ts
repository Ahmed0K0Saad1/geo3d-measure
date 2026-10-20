/**
 * توليد صورة الدبوس (Pin) كـSVG Data URI — بلا أصول خارجية (ADR-033/T4.1).
 * دوال نقية بلا Cesium ولا React، قابلة للاختبار في Node.
 */

/** لوحة ألوان متناوبة للدبابيس — يُميّز النقاط المتجاورة بصريًا. */
export const PIN_PALETTE = [
  '#1d4ed8',
  '#0f766e',
  '#b45309',
  '#7e22ce',
  '#be123c',
  '#0369a1',
  '#4d7c0f',
  '#9a3412',
] as const

/** لون الدبوس حسب ترتيب النقطة (0-based) مع دعم الفهارس السالبة. */
export function pinColorForIndex(index: number): string {
  const length = PIN_PALETTE.length
  const normalized = ((index % length) + length) % length
  return PIN_PALETTE[normalized]
}

export interface PinOptions {
  /** رقم النقطة المعروض داخل الدبوس (1-based). */
  number: number
  /** لون تعبئة الدبوس (CSS color). */
  color: string
  /** النقطة المختارة: حلقة ذهبية حول الدبوس. */
  selected?: boolean
}

/**
 * يبني Data URI لدبوس SVG بعرض 36 وارتفاع 48.
 * الرقم عدد صحيح، لذا لا يحتاج تهريب XML؛ اللون يمرَّر من لوحة ثابتة.
 */
export function buildPinDataUri({
  number,
  color,
  selected = false,
}: PinOptions): string {
  const label = String(Math.trunc(number))
  const fontSize = label.length >= 3 ? 9 : 12
  const selectionRing = selected
    ? '<circle cx="18" cy="18" r="13.5" fill="none" stroke="#fbbf24" stroke-width="3"/>'
    : ''

  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">',
    `<path d="M18 46C18 46 33 30 33 18A15 15 0 1 0 3 18C3 30 18 46 18 46Z" fill="${color}" stroke="#ffffff" stroke-width="2"/>`,
    selectionRing,
    `<text x="18" y="18" dy="0.35em" text-anchor="middle" font-family="system-ui,'Segoe UI',Arial,sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${label}</text>`,
    '</svg>',
  ].join('')

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
