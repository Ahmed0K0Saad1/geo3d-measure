import { describe, expect, it } from 'vitest'
import {
  PIN_PALETTE,
  buildPinDataUri,
  pinColorForIndex,
} from '../src/features/map/pinImage.ts'

function decodeSvg(uri: string): string {
  const [, payload] = uri.split(',')
  return decodeURIComponent(payload)
}

describe('pinImage — دبابيس SVG (T4.1)', () => {
  it('لوحة الألوان تتناوب حسب الترتيب', () => {
    expect(pinColorForIndex(0)).toBe(PIN_PALETTE[0])
    expect(pinColorForIndex(PIN_PALETTE.length)).toBe(PIN_PALETTE[0])
    expect(pinColorForIndex(PIN_PALETTE.length + 1)).toBe(PIN_PALETTE[1])
  })

  it('تدعم الفهارس السالبة دون كسر التناوب', () => {
    expect(pinColorForIndex(-1)).toBe(PIN_PALETTE[PIN_PALETTE.length - 1])
  })

  it('تنتج Data URI لصورة SVG بالرقم واللون', () => {
    const uri = buildPinDataUri({ number: 3, color: '#0f766e' })
    expect(uri.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true)

    const svg = decodeSvg(uri)
    expect(svg).toContain('<svg')
    expect(svg).toContain('fill="#0f766e"')
    expect(svg).toContain('>3</text>')
  })

  it('تضيف حلقة ذهبية للنقطة المختارة فقط', () => {
    const selected = decodeSvg(
      buildPinDataUri({ number: 1, color: '#1d4ed8', selected: true }),
    )
    const normal = decodeSvg(buildPinDataUri({ number: 1, color: '#1d4ed8' }))

    expect(selected).toContain('stroke="#fbbf24"')
    expect(normal).not.toContain('#fbbf24')
  })

  it('تصغّر الخط للأرقام المكوّنة من ثلاثة خانات', () => {
    const svg = decodeSvg(buildPinDataUri({ number: 123, color: '#1d4ed8' }))
    expect(svg).toContain('font-size="9"')
    expect(svg).toContain('>123</text>')
  })
})
